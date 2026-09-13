import { CHUNK_SIZE, FIRE_QUEST_SCENE, LANDMARKS, RIVER_HALF_WIDTH, VILLAGER_DIALOGUE_SCENE } from "@/config/world/chapter1";
import { BELT_CANOPY, getPalette } from "@/config/world/biomes";
import { WORLD_SPECIES } from "@/config/world/species";
import { VILLAGE_BUILDINGS } from "@/config/world/village";
import type { BiomeId, VegetationCategory, VegetationEntry } from "@/config/world/types";
import { getNativeHeight, getAssetScale } from "@/constants/assetScale";
import { hashCoordinates, mulberry32 } from "./random";
import { beltFactorAt, pathInfluenceAt, riverCenterlineDistance, sampleBiome } from "./worldSampling";

/**
 * Sinh thực vật cho một chunk — truy vấn vào palette đã author thay vì quay
 * xúc xắc từng vật thể độc lập (kou-dou.md §7: "designer quyết bố cục vĩ mô,
 * thuật toán lo trang trí vi mô").
 *
 * Deterministic theo (chunkX, chunkZ, biome, category): cùng toạ độ luôn ra
 * cùng nội dung, giống nguyên tắc InfiniteForest đã dùng.
 */

export interface VegetationItem {
  id: string;
  modelPath: string;
  position: [number, number, number];
  rotationY: number;
  scale: number;
  category: VegetationCategory;
}

const CATEGORIES: VegetationCategory[] = ["canopy", "understory", "shrub", "clutter", "props"];
const CATEGORY_INDEX: Record<VegetationCategory, number> = {
  canopy: 0,
  understory: 1,
  shrub: 2,
  clutter: 3,
  props: 4,
};

/** Seed ổn định cho từng biome, dùng để hai biome không bao giờ trùng pha lưới. */
const BIOME_SEED: Record<BiomeId, number> = {
  deep_canopy: 0,
  clearing: 1,
  light_forest: 2,
  medicinal_grove: 3,
  riverbank: 4,
  ancient_forest: 5,
  rocky: 6,
  cabin_clearing: 7,
  logged: 8,
  village: 9,
};

/** Seed riêng cho pass cổ thụ vành biên — không trùng bất kỳ biome nào ở trên. */
const BELT_SEED = 999;

const GLOBAL_SEED = 20260912;

/** Ngưỡng loại bỏ gần tim lối mòn — lối mòn hiện ra vì KHÔNG có cây (kou-dou.md §6). */
const PATH_CLEARANCE = 0.2;

/**
 * Lùi thêm cho gốc cây khỏi mép nước, TRÊN mức RIVER_HALF_WIDTH thật —
 * không phải vì mặt nước hiển thị sai, mà vì camera isometric xiên khiến tán
 * cây cao (cách gốc vài mét theo phương đứng) trông như đổ xuống che một
 * phần mặt nước ở góc nhìn chéo, đặc biệt rõ tại khúc cua. Cây càng cao thì
 * lùi càng xa; bụi/thảm thấp không cần vì không có hiệu ứng này.
 */
const RIVER_CLEARANCE_MARGIN: Partial<Record<VegetationCategory, number>> = {
  canopy: 6,
  understory: 3,
};

/** Các biome có palette author ở P1. Ngoài danh sách này chỉ có `deep_canopy` nền. */
function relevantBiomes(chunkX: number, chunkZ: number): BiomeId[] {
  const originX = chunkX * CHUNK_SIZE;
  const originZ = chunkZ * CHUNK_SIZE;
  const probes: [number, number][] = [
    [0, 0],
    [CHUNK_SIZE, 0],
    [0, CHUNK_SIZE],
    [CHUNK_SIZE, CHUNK_SIZE],
    [CHUNK_SIZE / 2, CHUNK_SIZE / 2],
  ];

  const found = new Set<BiomeId>(["deep_canopy"]);
  for (const [dx, dz] of probes) {
    const sample = sampleBiome(originX + dx, originZ + dz);
    for (const key of Object.keys(sample.weights) as BiomeId[]) {
      if ((sample.weights[key] ?? 0) > 0.02) found.add(key);
    }
  }
  return [...found];
}

/**
 * Vùng "breathing room" quanh vật thể tác giả đặt tay — gộp chung landmark
 * (cây đổ, đá, cổ thụ) và loài học (WORLD_SPECIES) vì cả hai đều cần thực vật
 * trang trí tránh ra, lý do giống nhau: kou-dou.md §5 Layer 5 — "avoid placing
 * an important interactive plant in the middle of equally saturated decor".
 * Loài học thêm vào đây còn có tác dụng thứ hai: giữ cho hoa nhiệm vụ luôn
 * nổi bật, không bị cỏ/bụi ngẫu nhiên mọc đè lên đúng lúc chunk tái sinh.
 */
const CLEARANCE_POINTS: { position: [number, number]; clearance: number }[] = [
  ...LANDMARKS.map((lm) => ({ position: lm.position, clearance: lm.clearance })),
  ...WORLD_SPECIES.map((sp) => ({ position: sp.position, clearance: sp.clearance })),
  ...VILLAGER_DIALOGUE_SCENE.npcs.map((n) => ({ position: n.position, clearance: 5 })),
  // Clairière de l'incendie : il faut voir les flammes de loin ET pouvoir
  // tourner autour de chaque tronc pour verser l'eau.
  ...FIRE_QUEST_SCENE.trees.map((t) => ({ position: t.position, clearance: 7 })),
  // Village de Koudou : sans ça, les buissons et les touffes d'herbe poussent
  // au travers des murs et des palissades — la végétation est semée par une
  // grille de bruit qui ignore complètement les objets posés à la main.
  ...VILLAGE_BUILDINGS.map((b) => ({ position: b.position, clearance: b.clearance })),
];

function tooCloseToAuthoredPoint(x: number, z: number): boolean {
  for (const p of CLEARANCE_POINTS) {
    const dx = x - p.position[0];
    const dz = z - p.position[1];
    if (dx * dx + dz * dz < p.clearance * p.clearance) return true;
  }
  return false;
}

/**
 * Rải một lớp thực vật trên lưới jitter. `weightAt` quyết định xác suất chấp
 * nhận từng điểm — trọng số biome cho lớp thường, hoặc `beltFactorAt` cho lớp
 * cổ thụ vành biên — nên hàm này dùng chung được cho cả hai trường hợp.
 */
function scatterEntry(
  entry: VegetationEntry,
  category: VegetationCategory,
  weightAt: (x: number, z: number) => number,
  seed: number,
  idPrefix: string,
  chunkX: number,
  chunkZ: number,
): VegetationItem[] {
  if (entry.models.length === 0 || entry.spacing <= 0) return [];

  const originX = chunkX * CHUNK_SIZE;
  const originZ = chunkZ * CHUNK_SIZE;

  // Lưới jitter: số ô theo khoảng cách trung bình mong muốn giữa các cây.
  const cols = Math.max(1, Math.round(CHUNK_SIZE / entry.spacing));
  const cell = CHUNK_SIZE / cols;

  const rng = mulberry32(hashCoordinates(chunkX * 131 + CATEGORY_INDEX[category], chunkZ * 137 + seed * 977, GLOBAL_SEED));

  const items: VegetationItem[] = [];

  for (let ix = 0; ix < cols; ix++) {
    for (let iz = 0; iz < cols; iz++) {
      const jx = (ix + 0.5) * cell + (rng() - 0.5) * cell * 0.85;
      const jz = (iz + 0.5) * cell + (rng() - 0.5) * cell * 0.85;
      const x = originX + jx;
      const z = originZ + jz;

      const weight = weightAt(x, z);
      // Trọng số LÀ xác suất chấp nhận — biên giới vì thế mềm dần qua dải
      // blend thay vì một đường ranh giới cứng.
      if (rng() > weight) continue;
      if (riverCenterlineDistance(x, z) <= RIVER_HALF_WIDTH + (RIVER_CLEARANCE_MARGIN[category] ?? 0)) continue;
      if (pathInfluenceAt(x, z) > PATH_CLEARANCE) continue;
      if (tooCloseToAuthoredPoint(x, z)) continue;

      const modelPath = entry.models[Math.floor(rng() * entry.models.length)];
      const targetHeight = entry.heightRange[0] + rng() * (entry.heightRange[1] - entry.heightRange[0]);
      const native = getNativeHeight(modelPath);
      const scale = native && native > 0 ? targetHeight / native : getAssetScale(modelPath);

      items.push({
        id: `${chunkX}_${chunkZ}_${idPrefix}_${category}_${ix}_${iz}`,
        modelPath,
        position: [x, 0, z],
        rotationY: rng() * Math.PI * 2,
        scale,
        category,
      });
    }
  }

  return items;
}

export function generateChunkVegetation(chunkX: number, chunkZ: number): VegetationItem[] {
  const items: VegetationItem[] = [];

  for (const biome of relevantBiomes(chunkX, chunkZ)) {
    const palette = getPalette(biome);
    for (const category of CATEGORIES) {
      const entry = palette[category];
      if (!entry) continue;
      const weightAt = (x: number, z: number) => sampleBiome(x, z).weights[biome] ?? 0;
      items.push(...scatterEntry(entry, category, weightAt, BIOME_SEED[biome], biome, chunkX, chunkZ));
    }
  }

  // Vành chắn biên: cổ thụ cao và dày hơn hẳn deep_canopy thường, chồng thêm
  // lên trên lớp nền — lý do "không đi tiếp được" phải thấy rõ TRƯỚC khi va
  // tường vô hình của WorldBounds. weightAt trả 0 trong toàn bộ vùng chơi
  // được nên chunk ở giữa bản đồ sẽ không tốn gì thêm (rng() > 0 luôn đúng).
  items.push(...scatterEntry(BELT_CANOPY, "canopy", beltFactorAt, BELT_SEED, "belt", chunkX, chunkZ));

  return items;
}

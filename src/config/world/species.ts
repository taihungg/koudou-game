import type { BiomeId } from './types';

/**
 * Vị trí loài học tác giả đặt tay — kou-dou.md §7: "quest targets" thuộc nhóm
 * hand-authored, không phải thứ thuật toán rải ngẫu nhiên như cỏ/bụi. Khác
 * `InfiniteForest` cũ (spawn 5% xác suất mỗi ô chunk, chỉ "ổn định" chừng nào
 * người chơi còn đứng nguyên trong chunk đó): ở đây mỗi entry là MỘT điểm cố
 * định trên bản đồ, tồn tại vĩnh viễn bất kể chunk nào đang render — điều kiện
 * bắt buộc để sau này làm checklist kiểu "3/5 loài đã tìm trong Bosquet
 * médicinal".
 *
 * P1 chỉ phủ Z0/Z1/Z2 (3 zone có palette lúc đó); P3 mở rộng nốt sang 5 zone
 * còn lại (river/ancient_forest/cave_camp/cabin/human_traces) sau khi palette
 * của chúng được author.
 *
 * `speciesId` phải khớp đúng field `id` trong learningEntities.json — đó là
 * khoá mà useLearningStore dùng để gate XP lặp lại (`completedExercises`), nên
 * nhiều điểm đặt có thể trỏ cùng một speciesId (gặp lại loài đã học) nhưng mỗi
 * VỊ TRÍ vẫn cần `id` riêng để React key và va chạm không đụng nhau.
 *
 * Chọn loài theo `leftPanel.Habitat` trong data (chỉ lặp lại 7 câu mẫu, không
 * phải mô tả sinh học thật) để ít nhất đọc hợp lý với biome: "Zones ouvertes"
 * cho Z0/cabane, "Lisières de forêt tropicale" cho Z1, "Sous-bois sombres"/
 * "Forêts denses" cho Z2/forêt ancienne, "Près des points d'eau" cho rivière,
 * "Montagnes rocheuses" cho grotte, "Savanes arides" cho traces humaines
 * (logged — sol exposé après la coupe).
 */
export interface SpeciesPlacement {
  /** Id riêng của VỊ TRÍ này — dùng làm React key và id sensor, không phải id loài. */
  id: string;
  zoneId: string;
  biome: BiomeId;
  /** Khớp field `id` trong src/data/learningEntities.json (flowers[]). */
  speciesId: string;
  position: [number, number];
  /** Bán kính "breathing room" — thực vật trang trí không sinh vào đây (kou-dou.md §5 Layer 5). */
  clearance: number;
}

export const WORLD_SPECIES: SpeciesPlacement[] = [
  // Z0 — Clairière d'arrivée: một loài duy nhất, dễ thấy, để tập thao tác
  // tương tác trước khi vào rừng dày (kou-dou.md Z0: "teach interaction").
  {
    id: 'z0_species_01',
    zoneId: 'arrival',
    biome: 'clearing',
    speciesId: 'Flower_n_01', // Fleur de Trésor — "zones ouvertes, sols ensoleillés"
    position: [-175, -178],
    clearance: 3,
  },

  // Z1 — Forêt claire: "first Fiche Espèce" gần lối vào zone, loài thứ hai
  // nằm sâu hơn để người chơi phải rời khỏi đường mòn một chút.
  {
    id: 'z1_species_01',
    zoneId: 'early_forest',
    biome: 'light_forest',
    speciesId: 'Flower_n_02', // Liane du Roi — "lisières de forêt"
    position: [-140, -100],
    clearance: 3,
  },
  {
    id: 'z1_species_02',
    zoneId: 'early_forest',
    biome: 'light_forest',
    speciesId: 'Flowers_n02_07', // Amaranthe — "lisières de forêt"
    position: [-70, -75],
    clearance: 3,
  },

  // Z2 — Bosquet médicinal: "introduce multiple useful plants, begin spaced
  // repetition" — 5 loài rải quanh landmark, đều cách xa dải sông ở phía bắc.
  {
    id: 'z2_species_01',
    zoneId: 'medicinal_grove',
    biome: 'medicinal_grove',
    speciesId: 'Flower_n_05', // Orchidée Fantôme — "sous-bois sombres"
    position: [30, -140],
    clearance: 3.5,
  },
  {
    id: 'z2_species_02',
    zoneId: 'medicinal_grove',
    biome: 'medicinal_grove',
    speciesId: 'Flower_n_07', // Fougère Argentée — "forêts denses"
    position: [110, -135],
    clearance: 3.5,
  },
  {
    id: 'z2_species_03',
    zoneId: 'medicinal_grove',
    biome: 'medicinal_grove',
    speciesId: 'Flowers_n02_10', // Dahlia Sombre — "sous-bois sombres"
    position: [105, -80],
    clearance: 3.5,
  },
  {
    id: 'z2_species_04',
    zoneId: 'medicinal_grove',
    biome: 'medicinal_grove',
    speciesId: 'Flowers_n02_12', // Fuchsia — "forêts denses"
    position: [45, -75],
    clearance: 3.5,
  },
  {
    id: 'z2_species_05',
    zoneId: 'medicinal_grove',
    biome: 'medicinal_grove',
    speciesId: 'Flowers_n03_02', // Renoncule — "sous-bois sombres"
    position: [75, -155],
    clearance: 3.5,
  },

  // Rivière — 2 loài trên hai bờ khác nhau, đúng habitat "près des points
  // d'eau"; đặt cách tim sông 15-20 m nên nằm ngoài RIVER_CLEARANCE_MARGIN của
  // tán cây (P3, mở rộng WORLD_SPECIES sang các zone chưa có palette ở P1/P2).
  {
    id: 'river_species_01',
    zoneId: 'river',
    biome: 'riverbank',
    speciesId: 'Flower_n_03', // "près des points d'eau, sols humides"
    position: [-35, -18],
    clearance: 3,
  },
  {
    id: 'river_species_02',
    zoneId: 'river',
    biome: 'riverbank',
    speciesId: 'Flowers_n02_01', // "près des points d'eau, sols humides"
    position: [-45, 18],
    clearance: 3,
  },

  // Forêt ancienne — habitat "forêts denses" / "sous-bois sombres", rải đều
  // trong hình chữ nhật zone (x[-195,-50] z[45,125]).
  {
    id: 'ancient_forest_species_01',
    zoneId: 'ancient_forest',
    biome: 'ancient_forest',
    speciesId: 'Flowers_n02_05', // "forêts denses, épiphyte"
    position: [-160, 60],
    clearance: 3.5,
  },
  {
    id: 'ancient_forest_species_02',
    zoneId: 'ancient_forest',
    biome: 'ancient_forest',
    speciesId: 'Flowers_n02_17', // "sous-bois sombres"
    position: [-90, 100],
    clearance: 3.5,
  },
  {
    id: 'ancient_forest_species_03',
    zoneId: 'ancient_forest',
    biome: 'ancient_forest',
    speciesId: 'Flowers_n03_09', // "sous-bois sombres"
    position: [-70, 70],
    clearance: 3.5,
  },

  // Grotte et camp — habitat "montagnes rocheuses".
  {
    id: 'cave_camp_species_01',
    zoneId: 'cave_camp',
    biome: 'rocky',
    speciesId: 'Flower_n_04', // "montagnes rocheuses, résistant au vent"
    position: [-145, 155],
    clearance: 3,
  },
  {
    id: 'cave_camp_species_02',
    zoneId: 'cave_camp',
    biome: 'rocky',
    speciesId: 'Flowers_n02_09', // "montagnes rocheuses, résistant au vent"
    position: [-170, 185],
    clearance: 3,
  },

  // Cabane abandonnée — habitat "zones ouvertes, bords de sentiers", cùng
  // logique với clairière đã đọc phải "zones ouvertes" ở Z0.
  {
    id: 'cabin_species_01',
    zoneId: 'cabin',
    biome: 'cabin_clearing',
    speciesId: 'Flower_n_08', // "zones ouvertes, bords de sentiers"
    position: [30, 115],
    clearance: 3,
  },
  {
    id: 'cabin_species_02',
    zoneId: 'cabin',
    biome: 'cabin_clearing',
    speciesId: 'Flowers_n02_13', // "zones ouvertes, bords de sentiers"
    position: [85, 80],
    clearance: 3,
  },

  // Traces humaines — habitat "savanes arides": vùng bị đốn hạ, tán cây thưa
  // nên đất khô nắng gắt hơn, khớp với loài chịu hạn thay vì loài rừng ẩm.
  {
    id: 'human_traces_species_01',
    zoneId: 'human_traces',
    biome: 'logged',
    speciesId: 'Flower_n_06', // "savanes arides, tolère la sécheresse"
    position: [50, 165],
    clearance: 3,
  },
  {
    id: 'human_traces_species_02',
    zoneId: 'human_traces',
    biome: 'logged',
    speciesId: 'Flowers_n02_04', // "savanes arides, tolère la sécheresse"
    position: [150, 185],
    clearance: 3,
  },
];

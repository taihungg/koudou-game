import { GAME_ASSETS } from '@/constants/assets';
import { BRIDGE_POINT, RIVER_SAMPLES } from './river';
import { VILLAGE_BOUNDS, VILLAGE_GATE, VILLAGE_STREET_Z } from './village';
import type { BiomeGround, LandmarkConfig, PathConfig, ZoneConfig } from './types';

/**
 * Bố cục Chương 1 — bản đồ hữu hạn, có biên, chia thành 8 zone có chủ đích.
 *
 * Mốc kích thước lấy từ phép đo thật:
 *   - người chơi nhìn thấy cao ~2,2 m (models/characters/players/Rogue.glb)
 *   - camera ortho zoom 40 chỉ thấy khoảng 40 × 39 m mặt đất
 *   - tốc độ đi bộ 5 m/s → đi hết tuyến chính ~730 m ≈ 2,5 phút
 */

/** Nửa cạnh của toàn bản đồ, kể cả vành rừng chắn biên. */
export const WORLD_HALF = 240;
/** Nửa cạnh vùng thật sự chơi được. Từ đây ra ngoài là vành canopy dày. */
export const PLAYABLE_HALF = 200;
/** Bề dày vành chắn biên — đúng bằng 1 chunk. */
export const BELT = WORLD_HALF - PLAYABLE_HALF;

/** Giữ nguyên theo InfiniteForest để hai hệ thống còn so sánh được. */
export const CHUNK_SIZE = 40;
/**
 * Camera chỉ thấy ~40 × 39 m nên 3×3 chunk (120 × 120 m) đã dư 40 m lề mỗi phía.
 * InfiniteForest đang dùng 2 (5×5 = 200 × 200 m), thừa gấp bốn lần diện tích.
 */
export const RENDER_DISTANCE = 1;
/**
 * Mặt đất render XA HƠN thực vật một vòng chunk — terrain chỉ là một mesh tô
 * màu, rẻ hơn nhiều so với hàng trăm vật thể + collider của
 * ChunkVegetation/Landmarks. Sàn luôn phủ rộng hơn nơi cây cối dừng lại, nên
 * không có cảnh "cây trôi nổi trên khoảng trống" khi camera bị zoom rộng hơn
 * bình thường (zoom trình duyệt, cutscene, minimap...).
 */
export const TERRAIN_RENDER_DISTANCE = RENDER_DISTANCE + 2;

/**
 * Bán kính chunk khi đang chiếu cutscene.
 *
 * Camera điện ảnh là camera phối cảnh, nhìn ngang và xa hơn nhiều so với ô
 * ~40 × 39 m của camera gameplay: với `RENDER_DISTANCE = 1` (cây chỉ tồn tại
 * trong 120 × 120 m) mọi khuôn hình rộng đều lộ mặt đất trọc. Nới lên 2 là đủ —
 * sương `fogExp2` mật độ 0,0085 nuốt gần hết mọi thứ xa quá ~150 m, nên nới
 * thêm nữa chỉ tốn draw call chứ không thấy gì hơn.
 *
 * An toàn về hiệu năng vì trong cutscene người chơi bị đóng băng, không có va
 * chạm/di chuyển nào tranh ngân sách khung hình.
 */
export const RENDER_DISTANCE_CINEMATIC = 2;
export const TERRAIN_RENDER_DISTANCE_CINEMATIC = RENDER_DISTANCE_CINEMATIC + 2;

/** Cạnh một ô địa hình. Bộ tile naturekit là 1×1 unit, nhân 5 → 8 ô/chunk chẵn. */
export const TILE = 5;

/** Điểm xuất hiện của người chơi: giữa Clairière d'arrivée. */
export const SPAWN: [number, number, number] = [-160, 3, -165];

export const ZONES: ZoneConfig[] = [
  {
    id: 'arrival',
    name: "Clairière d'arrivée",
    shape: { type: 'circle', center: [-160, -165], radius: 35 },
    biome: 'clearing',
    blend: 14,
    seed: 1001,
  },
  {
    id: 'early_forest',
    name: 'Forêt claire',
    shape: { type: 'rect', min: [-190, -125], max: [-40, -55] },
    biome: 'light_forest',
    blend: 16,
    seed: 1002,
  },
  {
    id: 'medicinal_grove',
    name: 'Bosquet médicinal',
    shape: { type: 'circle', center: [70, -110], radius: 60 },
    biome: 'medicinal_grove',
    blend: 18,
    seed: 1003,
  },
  {
    id: 'river',
    name: 'Rivière',
    // Bám theo đường cong thật (river.ts) thay vì dải thẳng cắt ngang bản đồ.
    // Chỉ qua được ở cầu, nên chia rõ nửa Bắc (học/an toàn) với nửa Nam (bí
    // ẩn/dấu vết con người).
    shape: { type: 'path', points: RIVER_SAMPLES, halfWidth: 25 },
    biome: 'riverbank',
    blend: 12,
    seed: 1004,
  },
  {
    id: 'ancient_forest',
    name: 'Forêt ancienne',
    shape: { type: 'rect', min: [-195, 45], max: [-50, 125] },
    biome: 'ancient_forest',
    blend: 18,
    seed: 1005,
  },
  {
    id: 'cave_camp',
    name: 'Grotte et camp',
    shape: { type: 'circle', center: [-160, 165], radius: 33 },
    biome: 'rocky',
    blend: 12,
    seed: 1006,
  },
  {
    id: 'cabin',
    name: 'Cabane abandonnée',
    shape: { type: 'circle', center: [55, 100], radius: 52 },
    biome: 'cabin_clearing',
    blend: 16,
    seed: 1007,
  },
  {
    id: 'human_traces',
    // Mép Đông lùi từ x=190 về x=150 để nhường chỗ cho zone `village`. Hai zone
    // chồng nhau thì `sampleBiome` chia đôi trọng số (xem worldSampling.ts) —
    // để nguyên 190 thì cả ngôi làng bị pha 50% biome `logged`: nền đất xám
    // nâu lấn hết màu đất nện của làng, và gốc cây/thân đổ của vùng phá rừng
    // mọc rải rác ngay giữa sân làng.
    //
    // Vùng chồng còn lại chỉ là dải blend 14 m tràn tới x≈164, tức đúng đoạn
    // cổng làng — chuyển tiếp nằm ở NGƯỠNG, và từ ngôi nhà đầu tiên (x=166)
    // trở đi là 100% biome làng.
    name: 'Traces humaines',
    shape: { type: 'rect', min: [20, 155], max: [150, 196] },
    biome: 'logged',
    blend: 14,
    seed: 1008,
  },
  {
    // Village de Koudou — cửa vào Chương 2. Hình CHỮ NHẬT, khác mọi zone khác
    // trên bản đồ vốn đều là tròn/dải uốn: trên minimap một khối vuông vắn đọc
    // ngay ra "chỗ này do người quy hoạch", không lẫn với rừng. Mặt bằng lấy
    // đúng từ bố cục thật, xem `village.ts`.
    id: 'village',
    name: 'Village de Koudou',
    shape: { type: 'rect', min: VILLAGE_BOUNDS.min, max: VILLAGE_BOUNDS.max },
    biome: 'village',
    blend: 12,
    seed: 1009,
  },
];

/**
 * Lòng sông nằm giữa dải zone `river` (rộng 50 m): người chơi đi qua bờ lau sậy
 * rồi mới tới mặt nước, chứ không phải bước thẳng từ rừng xuống nước.
 */
export const RIVER_HALF_WIDTH = 9;
/** Bề rộng khoảng hở duy nhất trên tường nước, tại BRIDGE_POINT (river.ts). */
export const BRIDGE_WIDTH = 14;

export const PATHS: PathConfig[] = [
  { id: 'p1', width: 6, points: [[-160, -165], [-150, -140], [-130, -120]] },
  { id: 'p2', width: 6, points: [[-130, -120], [-80, -95], [-20, -95], [40, -105], [70, -110]] },
  { id: 'p3', width: 6, points: [[70, -110], [50, -60], [10, -35], BRIDGE_POINT] },
  { id: 'p4', width: 6, points: [BRIDGE_POINT, [-60, 45], [-110, 80]] },
  { id: 'p5', width: 5, points: [[-110, 80], [-140, 120], [-160, 165]] },
  { id: 'p6', width: 6, points: [[-110, 80], [-40, 95], [55, 100]] },
  { id: 'p7', width: 5, points: [[55, 100], [100, 140], [140, 170]] },
  // p8 trước đây chạy thẳng lên mép bản đồ (x=140 → z=WORLD_HALF) và cụt ở
  // vành cổ thụ: một lối mòn không dẫn tới đâu cả. Nay nó rẽ qua chỗ hai người
  // dân đang nói chuyện rồi chạy tới cổng làng — lối mòn có đích đến.
  { id: 'p8', width: 6, points: [[140, 170], [138, 176], VILLAGE_GATE.position] },
  // p9 — đường chính trong làng. Rộng hơn lối mòn rừng (7 so với 5–6) vì đây là
  // đường có người dọn, không phải vệt chân người đi mòn ra.
  //
  // Dừng ở x=189 chứ không chạy tới tận giếng (x=194): con đường KẾT THÚC ở
  // quảng trường trước giếng, chứ không đâm xuyên qua nó. Chừa 5 m đất nện làm
  // khoảng sân, và giếng vì thế đóng tầm nhìn ở cuối trục thay vì đứng giữa
  // lòng đường.
  { id: 'p9', width: 7, points: [VILLAGE_GATE.position, [189, VILLAGE_STREET_Z]] },
];

/**
 * Màu nền từng biome. Đây là "ground signature" ở kou-dou.md §5 Layer 3 —
 * mỗi khu vực phải đọc được ngay từ mặt đất trước khi nhìn tới cây cối.
 */
export const BIOME_GROUND: BiomeGround = {
  clearing: '#7aa64a',
  light_forest: '#4e7c34',
  medicinal_grove: '#6f9463',
  // Bờ sông là bùn pha rêu, không phải cát: dải rộng 50 m mà tô nâu sáng thì
  // đọc thành sa mạc cắt ngang rừng.
  riverbank: '#5f6444',
  // Tối HƠN deep_canopy, vì người chơi phải cảm thấy mình đi VÀO chỗ sâu hơn.
  ancient_forest: '#1e3326',
  rocky: '#6b6355',
  cabin_clearing: '#75974a',
  logged: '#7b6a4e',
  // Đất nện — sáng và ấm hơn `logged` để hai vùng liền kề vẫn tách nhau, và
  // sáng hơn PATH_GROUND (#8a7a5c) để con đường chính hiện ra như một vệt SẪM
  // cắt qua sân làng, thay vì chìm vào nền cùng tông.
  village: '#9d8b68',
  // Nền mặc định của cả bản đồ — nâng sáng lên để forêt ancienne còn chỗ tối hơn.
  deep_canopy: '#2c4322',
};

/** Màu đất lộ của lối mòn — trộn dần vào màu nền theo khoảng cách tới tim đường. */
export const PATH_GROUND = '#8a7a5c';

/** Màu mặt nước sông. */
export const WATER_GROUND = '#3d6b7a';

/**
 * Landmark thủ công cho vertical slice P1 — mỗi zone một điểm mốc để người
 * chơi nhớ vị trí bằng thị giác thay vì toạ độ (kou-dou.md §5 Layer 4):
 * "hoa thuốc ở gần cây to gãy", không phải "chúng ở đâu đó giữa nhiều cây
 * giống hệt nhau".
 */
export const LANDMARKS: LandmarkConfig[] = [
  {
    id: 'arrival_fallen_tree',
    zoneId: 'arrival',
    position: [-150, -150],
    // Cây chết xoay nằm ngang mô phỏng "cây đổ khổng lồ" (kou-dou.md, landmark
    // đề xuất cho Z0: "giant fallen tree").
    modelPath: GAME_ASSETS.MODELS.QUATERNIUS.COMMONTREE_DEAD_2,
    scale: 2.2,
    rotationY: 0.6,
    rotationX: Math.PI / 2,
    clearance: 9,
  },
  {
    id: 'early_forest_rock',
    zoneId: 'early_forest',
    position: [-110, -95],
    modelPath: GAME_ASSETS.MODELS.NATUREKIT.ROCK_LARGEC,
    scale: 6,
    rotationY: 0.3,
    clearance: 7,
  },
  {
    id: 'medicinal_grove_ancient_tree',
    zoneId: 'medicinal_grove',
    position: [75, -100],
    modelPath: GAME_ASSETS.MODELS.NATUREKIT.TREE_DETAILED,
    scale: 9,
    rotationY: 1.1,
    clearance: 8,
  },
  {
    // Canoë échoué sur la rive — landmark de la zone rivière (P3), positionné
    // sur le chemin p3 avant le pont pour préfigurer la future quête "aller
    // chercher de l'eau" (demande initiale du joueur pour cette rivière).
    id: 'river_canoe',
    zoneId: 'river',
    position: [20, -25],
    modelPath: GAME_ASSETS.MODELS.NATUREKIT.CANOE,
    scale: 5,
    rotationY: 2.0,
    clearance: 6,
  },
];

export interface VillagerNPCConfig {
  id: string;
  modelUrl: string;
  position: [number, number];
  rotationY: number;
}

/**
 * Deux habitants qui discutent des récents glissements de terrain, postés à
 * l'écart du chemin p8 dans `human_traces` (fin de la carte, zone
 * déforestation). Alex peut s'approcher et écouter en secret — la
 * conversation alimente l'exercice d'écoute à trous, voir
 * `src/data/villagerListeningExercise.ts`.
 */
export const VILLAGER_DIALOGUE_SCENE: {
  npcs: VillagerNPCConfig[];
  sensor: { position: [number, number]; radius: number };
} = {
  npcs: [
    {
      id: 'human_traces_villager_a',
      modelUrl: GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_RANGER,
      position: [130, 176],
      rotationY: 0,
    },
    {
      id: 'human_traces_villager_b',
      modelUrl: GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_BARBARIAN,
      position: [130, 190],
      rotationY: Math.PI,
    },
  ],
  sensor: { position: [130, 183], radius: 18 },
};

export interface BurningTreeConfig {
  id: string;
  modelPath: string;
  position: [number, number];
  /** Hauteur visée en mètres — la mise à l'échelle passe par `scaleToHeight`. */
  targetHeight: number;
  rotationY: number;
}

/**
 * Incendie de forêt : trois arbres en flammes dans une clairière au bord du
 * chemin p3, à ~30 m de la rivière. La distance est le cœur de la boucle de
 * jeu — Alex doit faire l'aller-retour "remplir le seau → verser l'eau" une
 * fois par arbre (voir `useFireQuestStore`), donc assez près pour que ce ne
 * soit pas pénible, assez loin pour que ce soit un trajet.
 *
 * Les arbres sont aussi des points de dégagement pour la végétation
 * (`vegetationSampling.ts`) : sans ça, la forêt dense repousse par-dessus les
 * flammes au rechargement du chunk.
 */
export const FIRE_QUEST_SCENE: {
  center: [number, number];
  /** Rayon de déclenchement de la quête en approchant. */
  discoverRadius: number;
  /** Rayon d'interaction autour de chaque tronc pour verser l'eau. */
  treeRadius: number;
  /**
   * Distance maximale à l'axe de la rivière pour pouvoir puiser. Les murs de
   * collision sont à `RIVER_HALF_WIDTH` (9 m) et font 2 m d'épaisseur, donc le
   * joueur ne peut pas s'approcher à moins de ~8,4 m : 12 m laisse une berge
   * utile d'environ 3,5 m tout le long du cours d'eau.
   */
  waterReach: number;
  trees: BurningTreeConfig[];
} = {
  center: [38, -45],
  discoverRadius: 22,
  treeRadius: 5,
  waterReach: 12,
  trees: [
    {
      id: 'fire_tree_a',
      modelPath: GAME_ASSETS.MODELS.QUATERNIUS.COMMONTREE_DEAD_1,
      position: [33, -47],
      targetHeight: 7,
      rotationY: 0.4,
    },
    {
      id: 'fire_tree_b',
      modelPath: GAME_ASSETS.MODELS.QUATERNIUS.COMMONTREE_DEAD_3,
      position: [42, -48],
      targetHeight: 9,
      rotationY: 2.1,
    },
    {
      id: 'fire_tree_c',
      modelPath: GAME_ASSETS.MODELS.QUATERNIUS.COMMONTREE_DEAD_2,
      position: [38, -39],
      targetHeight: 8,
      rotationY: 4.0,
    },
  ],
};

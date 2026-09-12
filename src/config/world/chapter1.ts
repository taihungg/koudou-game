import { GAME_ASSETS } from '@/constants/assets';
import { BRIDGE_POINT, RIVER_SAMPLES } from './river';
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
    name: 'Traces humaines',
    shape: { type: 'rect', min: [20, 155], max: [190, 196] },
    biome: 'logged',
    blend: 14,
    seed: 1008,
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
  { id: 'p8', width: 6, points: [[140, 170], [140, WORLD_HALF]] },
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
];

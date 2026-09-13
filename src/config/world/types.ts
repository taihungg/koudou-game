/**
 * Kiểu dữ liệu cho hệ thống world composition (kou-dou.md §4, §19).
 *
 * Nguyên tắc: **designer quyết bố cục vĩ mô, thuật toán lo trang trí vi mô.**
 * Zone, path, landmark đều được đặt tay; chỉ cỏ/bụi/rác nền mới sinh procedural,
 * và luôn sinh BÊN TRONG vùng zone đã được author.
 *
 * Mọi kích thước tính bằng **mét** (1 unit = 1 m). Xem constants/assetScale.ts.
 */

export type BiomeId =
  | 'clearing'
  | 'light_forest'
  | 'medicinal_grove'
  | 'riverbank'
  | 'ancient_forest'
  | 'rocky'
  | 'cabin_clearing'
  | 'logged'
  | 'village'
  | 'deep_canopy';

export type ZoneShape =
  | { type: 'circle'; center: [number, number]; radius: number }
  | { type: 'rect'; min: [number, number]; max: [number, number] }
  /** Dải bám theo một polyline — dùng cho sông uốn lượn thay vì dải thẳng. */
  | { type: 'path'; points: [number, number][]; halfWidth: number };

export interface ZoneConfig {
  id: string;
  /** Tên hiển thị trong game (tiếng Pháp). */
  name: string;
  shape: ZoneShape;
  biome: BiomeId;
  /**
   * Bề rộng dải chuyển tiếp ra phía ngoài biên, tính bằng mét. Trọng số giảm
   * dần 1 → 0 qua dải này nên ranh giới biome không bao giờ là một đường thẳng.
   */
  blend: number;
  /** Seed riêng của zone, để nội dung vi mô tái lập được. */
  seed: number;
}

export interface PathConfig {
  id: string;
  /** Polyline toạ độ [x, z]. */
  points: [number, number][];
  /** Bề rộng lối mòn, mét. Thực vật bị loại trong phạm vi width/2. */
  width: number;
}

/** Bảng màu nền của từng biome — "ground signature" trong kou-dou.md §5 Layer 3. */
export type BiomeGround = Record<BiomeId, string>;

export type VegetationCategory = 'canopy' | 'understory' | 'shrub' | 'clutter' | 'props';

export interface VegetationEntry {
  /** Danh sách model để random — luôn lấy từ GAME_ASSETS, không hardcode path. */
  models: string[];
  /**
   * Khoảng chiều cao MỤC TIÊU (mét) sau khi chuẩn hoá qua `scaleToHeight`.
   * Không phải hệ số scale — mỗi instance random một chiều cao trong khoảng
   * này rồi mới suy ra scale, nên các model khác nguồn vẫn đọc được nhất quán.
   */
  heightRange: [number, number];
  /**
   * Khoảng cách trung bình giữa các vị trí ứng viên, tính bằng mét (trước khi
   * bị loại bởi trọng số biome/lối mòn/landmark). Số CÀNG NHỎ = càng dày.
   *
   * Không dùng "số vật thể/100 m²" — con số 15–25/100 m² trong kou-dou.md là
   * cho GROUND CLUTTER, áp nhầm sang tán cây sẽ ra rừng dày như tường ngay ở
   * khu đất trống (đã xảy ra ở bản nháp đầu của P1).
   */
  spacing: number;
}

export type BiomePalette = Partial<Record<VegetationCategory, VegetationEntry>>;

/**
 * Một vật thể của ngôi làng (nhà, giếng, rào, đèn, ghế…).
 *
 * Khác `LandmarkConfig` ở hai điểm cố ý: tỉ lệ mặc định đi qua CHIỀU CAO MỤC
 * TIÊU (`targetHeight` → `scaleToHeight`) chứ không phải hệ số thô, vì làng
 * trộn ba pack khác hệ đơn vị (`objects` ×4, `villages_raw_glb` ×1) mà vẫn phải
 * đọc được cùng một thước người; và collider là nửa-kích-thước ĐO THEO MODEL,
 * không suy từ `clearance` — nhà có mặt bằng chữ nhật, bọc bằng hộp vuông theo
 * clearance sẽ chặn cả lối đi trước cửa.
 */
export interface VillageBuildingConfig {
  id: string;
  modelPath: string;
  position: [number, number];
  /** Chiều cao mục tiêu (m). Ưu tiên cái này; xem `scale` cho ngoại lệ. */
  targetHeight?: number;
  /**
   * Hệ số tuyệt đối, CHỈ dùng cho prop có tỉ lệ dẹt bất thường mà chuẩn hoá
   * theo chiều cao sẽ kéo dài ra vô lý — ghế băng cao 0,3 m nhưng dài 2,36 m:
   * ép cao 0,5 m là thành cái ghế dài 3,9 m.
   */
  scale?: number;
  rotationY: number;
  /** Nửa kích thước collider [hx, hy, hz] tính bằng mét. `null` = đi xuyên được. */
  collider: [number, number, number] | null;
  /** Bán kính "breathing room" — thực vật vi mô không sinh vào đây. */
  clearance: number;
}

export interface LandmarkConfig {
  id: string;
  zoneId: string;
  position: [number, number];
  modelPath: string;
  /** Scale tuyệt đối — landmark là vật thể tác giả đặt tay, không chuẩn hoá theo chiều cao. */
  scale: number;
  rotationY?: number;
  /** Chỉ dùng khi cần đặt nằm — ví dụ thân cây đổ (xem `arrival_fallen_tree`). */
  rotationX?: number;
  /** Bán kính vùng "breathing room": thực vật vi mô không sinh vào đây (kou-dou.md §5 Layer 5). */
  clearance: number;
}

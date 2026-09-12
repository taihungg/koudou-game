import ASSET_HEIGHTS from './assetHeights.generated.json';

/**
 * Lớp chuẩn hoá tỉ lệ asset — `canonicalScale` trong kou-dou.md §18.
 *
 * Mốc quy đổi: **1 unit = 1 mét**, vì player capsule là
 * `CapsuleCollider args={[0.5, 0.4]}` → cao 2*0.5 + 2*0.4 = **1.8 unit = 1.8 m**
 * (src/components/game/Player.tsx).
 *
 * Mọi con số dưới đây được ĐO, không ước lượng:
 *   node scripts/audit-models.mjs public/models   (GLB/glTF)
 *   node scripts/audit-fbx.mjs    public/models   (FBX nhị phân)
 *
 * Lý do file này tồn tại: các pack trong repo nằm ở BỐN hệ đơn vị khác nhau, và
 * không có một hằng số nào đúng cho tất cả. Trước đây code hardcode `scale={0.01}`
 * cho mọi FBX, nhưng phép đo cho thấy 0.01 chỉ đúng với pack `villages`.
 */

type ScaleRule = {
  /** So khớp theo tiền tố đường dẫn public. Rule dài hơn được ưu tiên. */
  prefix: string;
  scale: number;
  /** Bằng chứng đo được — giữ lại để lần sau không ai đoán lại. */
  evidence: string;
};

const RULES: ScaleRule[] = [
  // --- Đã ở mét, không cần đổi ---------------------------------------------
  { prefix: '/models/forest/', scale: 1, evidence: 'Log 0,87–2,41 m · Rock 1,0–1,8 m · Cattail 0,56–0,92 m' },
  { prefix: '/models/forest1/', scale: 1, evidence: 'Tree 2,86–10,77 m · Bush 0,23–2,49 m · Grass 0,52–1,20 m' },
  { prefix: '/models/trees/', scale: 1, evidence: 'Bush 1,17–1,72 m · nấm 0,75–1,11 m · đá 0,27–1,01 m' },
  { prefix: '/models/flowers/', scale: 1, evidence: 'Hoa cao 0,24–1,18 m (TB 0,63) — đúng thật, nhưng xem scaleToHeight' },
  // Sau khi convert FBX -> GLB, trục Z-up đã được đổi đúng sang Y-up.
  { prefix: '/models/quaternius_raw_glb/', scale: 1, evidence: 'PalmTree_1 cao 4,47 m · CommonTree 2,2–3,5 m · Grass 1,0–1,2 m' },
  { prefix: '/models/villages_raw_glb/', scale: 1, evidence: 'convert đã ×0,01: Fense dài 3,6 m cao 1,05 m · Bag 0,9 m' },
  { prefix: '/models/resourcebits_raw_glb/', scale: 1, evidence: 'Copper_Bar dài 0,8 m · Stack_Large 1,5–1,7 m' },

  // --- Bộ tile Kenney: mọi tile nền/vách đúng 1×1×1 unit --------------------
  // ×5 để tile = 5 m, khi đó CHUNK_SIZE 40 chứa đúng 8 tile.
  { prefix: '/models/naturekit/', scale: 5, evidence: 'ground_grass/river/cliff đúng 1×1 · tree_default 1,71→8,6 m · statue_obelisk 0,88→4,4 m' },

  // --- Pack kiểu hex-tile/diorama, nhỏ hơn nhiều ----------------------------
  { prefix: '/models/objects/', scale: 4, evidence: 'house cao 0,91 → 3,6 m · wall_straight dài 2 → 8 m' },
  { prefix: '/models/buildings/', scale: 4, evidence: 'building_home_A cao 0,93 → 3,7 m' },
  { prefix: '/models/decoration/', scale: 5, evidence: 'tree_single 1,2 → 6 m · tile đồi/núi 1,76–1,88' },

  // koudou/ vẫn là FBX (8 file, linh vật) và chưa xác định được hệ đơn vị.
  // CẦN KIỂM TRA BẰNG MẮT trước khi dùng chính thức.
  { prefix: '/models/koudou/', scale: 0.25, evidence: 'CHƯA CHẮC — bbox 8,29 unit, ×0,25 → 2,07 m' },

  // --- CÁCH LY: file hỏng sau khi convert FBX -> GLB, đừng dùng -------------
  // Không đăng ký trong GAME_ASSETS. Số ở đây chỉ để nếu ai đó lỡ trỏ tới thì
  // không ra kích thước vô lý.
  { prefix: '/models/nature_raw_glb/', scale: 1, evidence: 'HỎNG — export tích luỹ, SNature_Tree.glb chứa cả 17 model khác' },
  { prefix: '/models/wild_raw_glb/SCharacter_', scale: 10000, evidence: 'HỎNG — hình học 5e-3, cần ×10000 mới ra 0,5 m' },
  { prefix: '/models/wild_raw_glb/SNature_', scale: 10000, evidence: 'HỎNG — cùng lỗi với SCharacter_' },
  { prefix: '/models/wild_raw_glb/', scale: 100, evidence: 'HỎNG — hình học đúng mét (bear 2,1 m) nhưng node gốc còn scale 0,01' },
];

// Rule dài hơn khớp trước, để '/models/wild/SCharacter_' thắng '/models/wild/'.
const SORTED_RULES = [...RULES].sort((a, b) => b.prefix.length - a.prefix.length);

const heights = ASSET_HEIGHTS as Record<string, number>;

/** Hệ số đưa asset về đơn vị mét. Trả 1 nếu pack chưa được khai báo. */
export function getAssetScale(modelPath: string): number {
  return SORTED_RULES.find((r) => modelPath.startsWith(r.prefix))?.scale ?? 1;
}

/** Chiều cao gốc (chưa scale) đo được, hoặc null nếu asset không có trong bảng. */
export function getNativeHeight(modelPath: string): number | null {
  return heights[modelPath] ?? null;
}

/** Chiều cao thật tính bằng mét sau khi áp canonicalScale. */
export function getHeightInMetres(modelPath: string): number | null {
  const native = getNativeHeight(modelPath);
  return native === null ? null : native * getAssetScale(modelPath);
}

/**
 * Hệ số để asset cao đúng `targetMetres`.
 *
 * Dùng cái này thay cho hệ số nhân cố định bất cứ khi nào các asset trong cùng
 * một nhóm phải đọc được như nhau. Ví dụ 59 model trong /models/flowers/ cao từ
 * 0,24 đến 1,18 m: nhân chung 2,0–2,4 như code cũ cho ra 0,48 m … 2,83 m, tức
 * chênh nhau 5,9 lần — loài thấp nhất chìm dưới cỏ (cỏ cao tới 1,2 m) còn loài
 * cao nhất vượt cả người chơi (1,8 m).
 *
 * Nếu không đo được chiều cao thì lùi về canonicalScale của pack.
 */
export function scaleToHeight(modelPath: string, targetMetres: number): number {
  const native = getNativeHeight(modelPath);
  if (native === null || native <= 0) return getAssetScale(modelPath);
  return targetMetres / native;
}

/** Chiều cao mục tiêu theo vai trò trong cảnh, tính bằng mét. */
export const TARGET_HEIGHT = {
  /** Người chơi — mốc so sánh, không phải asset. */
  PLAYER: 1.8,
  /**
   * Hoa/cây nhiệm vụ: phải nhô lên khỏi cỏ (tối đa 1,2 m) nhưng thấp hơn
   * người chơi để không che tầm nhìn.
   */
  LEARNING_ENTITY: 1.4,
  /** Cỏ và rác nền. */
  GROUND_CLUTTER: 0.6,
  /** Bụi tầng giữa. */
  SHRUB: 1.6,
  /** Cây tầng dưới tán. */
  UNDERSTORY_TREE: 5,
  /** Cây tầng tán. */
  CANOPY_TREE: 8,
  /** Cây vượt tán, dùng làm landmark. */
  EMERGENT_TREE: 11,
} as const;

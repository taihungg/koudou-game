import { GAME_ASSETS } from '@/constants/assets';
import type { VillageBuildingConfig } from './types';

/**
 * Village de Koudou — khu định cư nhỏ ở rìa Đông bản đồ Chương 1, nối tiếp
 * ngay sau chỗ hai người dân đứng nói chuyện (`VILLAGER_DIALOGUE_SCENE`).
 * Đây cũng là CỬA VÀO Chương 2 (xem `src/config/chapter2Unlock.ts`).
 *
 * ── Vì sao bố cục lại là thế này ──────────────────────────────────────────
 * Vài ngôi nhà rải ngẫu nhiên trên bãi đất trống KHÔNG đọc ra là làng — nó đọc
 * ra là "vài ngôi nhà". Thứ làm nên ngôi làng là bố cục có chủ đích, ở đây gồm
 * năm tầng, xếp theo thứ tự người chơi gặp:
 *
 *   1. NGƯỠNG  — hàng rào mặt tiền + hai trụ cổng cao. Có ranh giới thì mới có
 *      "bên trong" và "bên ngoài"; không có nó thì người chơi không biết mình
 *      vừa ĐẾN một nơi nào cả.
 *   2. TRỤC    — một con đường thẳng duy nhất chạy từ cổng về phía Đông
 *      (`p9` trong chapter1.ts). Làng có một trục, không phải một đám.
 *   3. HÀNG    — nhà xếp thành HAI HÀNG song song hai bên đường, mặt tiền đều
 *      quay vào đường. Chính sự thẳng hàng này nói "có người quy hoạch chỗ
 *      này", tách nó khỏi mọi thứ khác trên bản đồ vốn đều mọc tự nhiên.
 *   4. ĐIỂM TỤ — giếng làng đặt ở ĐÚNG cuối trục đường, đóng tầm nhìn lại. Đi
 *      hết đường thì mắt dừng ở đâu đó, chứ không trôi ra rừng.
 *   5. MẶT SAU — ruộng, bao tải, ghế băng, đèn đường. Làng có mặt sau và có
 *      sinh hoạt, không chỉ là một dãy mặt tiền dựng cho đẹp.
 *
 * ── Ràng buộc toạ độ (đừng phá khi chỉnh) ─────────────────────────────────
 *   - Mọi vật thể phải nằm trong x ≤ 200 = `PLAYABLE_HALF`. Vượt qua đó là
 *     `beltFactorAt` bắt đầu rải cổ thụ vành biên (spacing 6 m, rất dày) và
 *     chúng sẽ mọc xuyên qua nhà.
 *   - Cổng ở x = 156 chứ không gần hơn: sensor cổng (r = 6) phải KHÔNG chạm
 *     vùng nghe lén của hai người dân (`[130, 183]`, r = 18, với tới x ≈ 146,6),
 *     nếu không hai prompt "ESPACE" sẽ tranh nhau cùng một phím.
 *
 * Kích thước model đều là số ĐO thật (`node scripts/audit-models.mjs`):
 *   objects/house   1,69 × 0,91 × 1,66  → ép cao 4,2 m thì mặt bằng ~7,8 × 7,7 m
 *   objects/well    1,02 × 0,74 × 1,02  → ép cao 2,4 m  → ~3,3 × 3,3 m
 *   objects/market  1,47 × 0,86 × 1,67  → ép cao 3,6 m  → ~6,2 × 7,0 m
 *   villages/Fense_1  0,17 × 1,05 × 3,60 (trục dài nằm theo Z cục bộ)
 *   villages/Fense_6  1,19 × 2,34 × 4,28 (bản cao nhất → dùng làm trụ cổng)
 *   villages/Lamp_1   0,67 × 3,68 × 1,79
 *   villages/bench    0,69 × 0,30 × 2,36 (trục dài theo Z)
 *
 * CẢNH BÁO: `VILLAGES.GATE_1/2/3` KHÔNG dùng được — bbox đo ra 0 × 0,01 × 0,01,
 * tức 530 tam giác bị nén dẹt trong 1 cm. Cổng ở đây dựng bằng hai tấm Fense_6.
 */

const M = GAME_ASSETS.MODELS;

/** Ranh giới zone làng — trùng đúng mặt bằng thật của khu định cư. */
export const VILLAGE_BOUNDS = {
  min: [156, 158] as [number, number],
  max: [200, 194] as [number, number],
};

/** Trục đường chính: từ cổng chạy thẳng về Đông, kết thúc ở giếng làng. */
export const VILLAGE_STREET_Z = 176;

/**
 * Cổng làng. `barrier` là đoạn rào chắn ngang lối vào, CHỈ dựng khi chưa mở
 * khoá Chương 2 — mở khoá xong thì nó biến mất, và khoảng trống giữa hai trụ
 * chính là tín hiệu "cổng đã mở", không cần thêm hiệu ứng nào khác.
 */
export const VILLAGE_GATE = {
  /** Tâm lối vào, nằm trên trục đường. */
  position: [156, VILLAGE_STREET_Z] as [number, number],
  /** Khoảng hở giữa hai trụ cổng, mét (đo từ mép trong trụ này sang trụ kia). */
  openingWidth: 7.3,
  /** Bán kính sensor mở prompt. Xem ghi chú ràng buộc toạ độ ở đầu file. */
  sensorRadius: 6,
};

/**
 * Hàng rào mặt tiền + hai cánh quặt vào trong.
 *
 * Cố ý KHÔNG quây kín bốn phía: quây kín thì tốn ~40 draw call cho thứ người
 * chơi chỉ nhìn thấy một mặt, và làng bị đọc thành pháo đài. Rào chỉ dựng ở
 * mặt người chơi đi tới, phần còn lại để rừng khép lại — đủ để có "ngưỡng" mà
 * vẫn không biến làng thành hộp kín.
 */
function fenceFacade(): VillageBuildingConfig[] {
  const out: VillageBuildingConfig[] = [];
  const x = VILLAGE_GATE.position[0];

  // Mặt tiền dọc theo trục Z, chừa khoảng hở ở giữa cho cổng. Trục dài của
  // Fense_1 nằm theo Z cục bộ nên rotationY = 0 là đã đúng hướng.
  //
  // Các mốc này ăn khớp ĐẦU-NỐI-ĐẦU với hai trụ cổng: Fense_1 dài 3,6 m nên
  // tấm trong cùng phía Bắc phủ tới z=168,0, đúng chỗ trụ Bắc (Fense_6 dài
  // 4,28 m, tâm 170,2) bắt đầu ở z=168,06; phía Nam trụ kết thúc ở z=183,94 và
  // tấm kế tiếp bắt đầu ở 184,0. Lệch đi là hai tấm rào đâm xuyên nhau — mắt
  // nhìn thấy ngay ở hàng rào thẳng, vì mọi cọc đều song song.
  const facadeZ = [159.0, 162.6, 166.2, 185.8, 189.4, 193.0];
  facadeZ.forEach((z, i) => {
    out.push({
      id: `village_fence_w${i}`,
      modelPath: M.VILLAGES.FENSE_1,
      position: [x, z],
      targetHeight: 1.05,
      rotationY: 0,
      collider: [0.3, 0.6, 1.8],
      clearance: 2.2,
    });
  });

  // Hai cánh quặt vào trong ở hai đầu — rào cụt giữa đồng trông như phim
  // trường; có cánh quặt thì mắt hiểu đây là biên của một khu đất.
  const wingX = [157.8, 161.4, 165.0];
  for (const [wi, z] of [VILLAGE_BOUNDS.min[1], VILLAGE_BOUNDS.max[1]].entries()) {
    wingX.forEach((wx, i) => {
      out.push({
        id: `village_fence_wing${wi}_${i}`,
        modelPath: M.VILLAGES.FENSE_1,
        position: [wx, z],
        targetHeight: 1.05,
        rotationY: Math.PI / 2,
        collider: [1.8, 0.6, 0.3],
        clearance: 2.2,
      });
    });
  }

  return out;
}

/** Hai trụ cổng — bản rào cao nhất trong pack, đặt sát hai mép lối vào. */
const GATE_POSTS: VillageBuildingConfig[] = [
  {
    id: 'village_gate_post_n',
    modelPath: M.VILLAGES.FENSE_6,
    position: [156, 170.2],
    targetHeight: 2.34,
    rotationY: 0,
    collider: [0.6, 1.2, 2.14],
    clearance: 3,
  },
  {
    id: 'village_gate_post_s',
    modelPath: M.VILLAGES.FENSE_6,
    position: [156, 181.8],
    targetHeight: 2.34,
    rotationY: 0,
    collider: [0.6, 1.2, 2.14],
    clearance: 3,
  },
];

/** Rào chắn ngang lối vào — chỉ tồn tại khi Chương 2 còn khoá. */
export const VILLAGE_GATE_BARRIER: VillageBuildingConfig[] = [
  {
    id: 'village_gate_barrier_a',
    modelPath: M.VILLAGES.FENSE_1,
    position: [156, 174.2],
    targetHeight: 1.05,
    rotationY: 0,
    collider: null, // collider chặn là MỘT hộp duy nhất, xem Village.tsx
    clearance: 2,
  },
  {
    id: 'village_gate_barrier_b',
    modelPath: M.VILLAGES.FENSE_1,
    position: [156, 177.8],
    targetHeight: 1.05,
    rotationY: 0,
    collider: null,
    clearance: 2,
  },
];

/** Quay mặt vật thể tại `from` về phía `to`. Model của các pack này có mặt
 *  trước nằm theo +Z cục bộ (cùng quy ước `StaticVillage.tsx` đang dùng). */
export function faceTowards(from: [number, number], to: [number, number]): number {
  return Math.atan2(to[0] - from[0], to[1] - from[1]);
}

/** Nhà quay mặt ra đường chính — chỉ cần toạ độ x là suy ra được góc. */
function houseFacingStreet(x: number, z: number, skew = 0): number {
  return faceTowards([x, z], [x, VILLAGE_STREET_Z]) + skew;
}

/**
 * Năm ngôi nhà xếp hai hàng ven đường. `skew` là độ lệch nhỏ ĐẶT TAY (không
 * random): thẳng hàng tuyệt đối trông như đồ hoạ mẫu, lệch vài độ thì vừa giữ
 * được nhịp hàng lối vừa ra dáng nhà dân tự dựng.
 */
const HOUSES: VillageBuildingConfig[] = [
  { id: 'village_house_n1', position: [166, 167] as [number, number], skew: 0.07 },
  { id: 'village_house_n2', position: [179, 167] as [number, number], skew: -0.05 },
  { id: 'village_house_n3', position: [192, 167] as [number, number], skew: 0.04 },
  { id: 'village_house_s1', position: [169, 185] as [number, number], skew: -0.06 },
  { id: 'village_house_s2', position: [182, 185] as [number, number], skew: 0.08 },
].map(({ id, position, skew }) => ({
  id,
  modelPath: M.OBJECTS.HOUSE,
  position,
  targetHeight: 4.2,
  rotationY: houseFacingStreet(position[0], position[1], skew),
  collider: [3.9, 2.1, 3.8] as [number, number, number],
  clearance: 6,
}));

/** Giếng làng, chợ, ruộng — phần "có người sống ở đây" của bố cục. */
const CIVIC: VillageBuildingConfig[] = [
  {
    // Điểm tụ: đặt đúng cuối trục đường để đóng tầm nhìn.
    id: 'village_well',
    modelPath: M.OBJECTS.WELL,
    position: [194, VILLAGE_STREET_Z],
    targetHeight: 2.4,
    rotationY: faceTowards([194, VILLAGE_STREET_Z], VILLAGE_GATE.position),
    collider: [1.7, 1.2, 1.7],
    clearance: 4,
  },
  {
    id: 'village_market',
    modelPath: M.OBJECTS.MARKET,
    position: [193, 186],
    targetHeight: 3.6,
    rotationY: faceTowards([193, 186], [190, VILLAGE_STREET_Z]),
    collider: [3.1, 1.8, 3.5],
    clearance: 5,
  },
  {
    id: 'village_farm_1',
    modelPath: M.OBJECTS.FARM_PLOT,
    position: [172, 160],
    targetHeight: 1.2,
    rotationY: 0,
    collider: null,
    clearance: 3.5,
  },
  {
    id: 'village_farm_2',
    modelPath: M.OBJECTS.FARM_PLOT,
    position: [185, 160],
    targetHeight: 1.2,
    rotationY: Math.PI / 2,
    collider: null,
    clearance: 3.5,
  },
];

/**
 * Đồ đường phố. Đèn đặt SO LE hai bên đường chứ không đối xứng từng cặp: nhịp
 * so le vẫn nhấn được trục đường mà không biến nó thành đại lộ nghi lễ.
 */
const STREET_PROPS: VillageBuildingConfig[] = [
  ...[
    [158, 171] as [number, number],
    [158, 181] as [number, number],
    [165, 171.5] as [number, number],
    [177, 180.5] as [number, number],
    [189, 171.5] as [number, number],
  ].map((position, i) => ({
    id: `village_lamp_${i}`,
    modelPath: M.VILLAGES.LAMP_1,
    position,
    targetHeight: 4,
    rotationY: faceTowards(position, [position[0], VILLAGE_STREET_Z]),
    collider: [0.35, 2, 0.35] as [number, number, number],
    clearance: 2,
  })),
  // Ghế băng: dùng `scale` tuyệt đối, KHÔNG `targetHeight` — ghế cao 0,30 m mà
  // dài 2,36 m, ép theo chiều cao là ra cái ghế dài 4 m.
  ...[
    [172, 180.5] as [number, number],
    [186, 180.5] as [number, number],
  ].map((position, i) => ({
    id: `village_bench_${i}`,
    modelPath: M.VILLAGES.BENCH,
    position,
    scale: 1.2,
    rotationY: Math.PI / 2,
    collider: [1.5, 0.25, 0.45] as [number, number, number],
    clearance: 2,
  })),
  {
    id: 'village_bag_1',
    modelPath: M.VILLAGES.BAG_2,
    position: [189, 188],
    scale: 1.1,
    rotationY: 0.6,
    collider: null,
    clearance: 1.5,
  },
  {
    id: 'village_bag_2',
    modelPath: M.VILLAGES.BAG_1,
    position: [196, 187],
    scale: 1.1,
    rotationY: -0.4,
    collider: null,
    clearance: 1.5,
  },
];

/** Toàn bộ vật thể tĩnh của làng (không gồm rào chắn cổng khi khoá). */
export const VILLAGE_BUILDINGS: VillageBuildingConfig[] = [
  ...fenceFacade(),
  ...GATE_POSTS,
  ...HOUSES,
  ...CIVIC,
  ...STREET_PROPS,
];

/**
 * Trưởng làng — đứng ở quảng trường cuối trục đường, quay mặt về phía cổng.
 *
 * Vị trí chọn theo bố cục chứ không tuỳ tiện: người chơi bước qua cổng ở
 * x=156 rồi đi thẳng theo đường chính về Đông, nên đặt trưởng làng ở cuối trục
 * là ông ấy nằm trong tầm mắt suốt quãng đường đi tới — không thể bỏ lỡ, mà
 * cũng không cần cưỡng ép mở hội thoại ngay lúc vừa vào cổng.
 *
 * Lệch 2 m khỏi tim đường (z=178 thay vì 176) để không chắn tầm nhìn tới giếng
 * làng, vốn là điểm đóng bố cục ở cuối trục.
 */
export const VILLAGE_CHIEF = {
  position: [187, 178] as [number, number],
  /** Quay về phía cổng, tức nhìn thẳng vào người chơi đang đi tới. */
  rotationY: faceTowards([187, 178], VILLAGE_GATE.position),
  /**
   * Bán kính mở prompt. Tim đường ở z=176 nên người chơi đi giữa đường là đã
   * cách 2 m — chắc chắn kích hoạt. Không đụng sensor cổng (cách 31 m) hay
   * sensor loài nào.
   */
  sensorRadius: 5,
};

/** Model cần preload — dedupe để không gọi `useGLTF.preload` trùng. */
export const VILLAGE_MODELS: string[] = [
  ...new Set([...VILLAGE_BUILDINGS, ...VILLAGE_GATE_BARRIER].map((b) => b.modelPath)),
];

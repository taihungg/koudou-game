import { CatmullRomCurve3, Vector3 } from 'three';

/**
 * Đường tim của sông — một spline mượt thay vì dải thẳng cắt ngang bản đồ, để
 * đọc được như sông thật và làm nền cho nhiệm vụ "đi lấy nước" sau này.
 *
 * File riêng (không import từ chapter1.ts) để tránh vòng lặp import: chapter1
 * cần RIVER_SAMPLES để dựng zone 'river', còn ở đây không cần biết WORLD_HALF —
 * điểm điều khiển chỉ cần vượt ra ngoài mép bản đồ một chút để Catmull-Rom
 * không cong bất thường ở hai đầu đoạn.
 */
const CONTROL_POINTS: [number, number][] = [
  [-280, 10],
  [-200, -12],
  [-130, 14],
  [-60, -8],
  [-20, 6],
  [40, -14],
  [110, 10],
  [170, -8],
  [230, 12],
  [280, -6],
];

export const RIVER_CURVE = new CatmullRomCurve3(
  CONTROL_POINTS.map(([x, z]) => new Vector3(x, 0, z)),
  false,
  'catmullrom',
  0.5,
);

export const RIVER_LENGTH = RIVER_CURVE.getLength();

/**
 * Sông lấy mẫu thành polyline — dùng cho zone weight, kiểm tra nước/cầu, và
 * tường va chạm. Không cần mịn bằng mesh hiển thị (River.tsx tự lấy mẫu mịn
 * hơn trực tiếp từ RIVER_CURVE), nhưng 60 mẫu (~10 m/đoạn) từng để lại sai số
 * ~0,5 m so với đường cong thật ở khúc cua — dây cung luôn cắt vào phía lồi
 * của khúc cua, khiến điểm rải cây ở phía lồi tưởng mình đã đủ xa bờ trong
 * khi bờ thật ở gần hơn. 150 mẫu (~4 m/đoạn) giảm sai số này xuống ~0,09 m,
 * không đáng kể (đo bằng scripts kiểm nghiệm khi debug — xem lịch sử sửa lỗi
 * "sông bị ngắt ở khúc cua").
 */
const LOGIC_SAMPLE_COUNT = 150;
export const RIVER_SAMPLES: [number, number][] = RIVER_CURVE
  .getSpacedPoints(LOGIC_SAMPLE_COUNT)
  .map((v) => [v.x, v.z] as [number, number]);

/** Điểm đặt cầu — trùng một control point để không lệch khỏi đường cong thật. */
export const BRIDGE_POINT: [number, number] = [-20, 6];

/**
 * Hướng cục bộ của sông tại BRIDGE_POINT, suy từ hai mẫu lân cận trong
 * RIVER_SAMPLES — dùng để xoay mặt cầu (Bridge.tsx) đúng góc vuông với dòng
 * chảy, cùng công thức pháp tuyến RiverWalls.tsx đã dùng để xoay tường.
 */
function findBridgeIndex(): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < RIVER_SAMPLES.length; i++) {
    const [x, z] = RIVER_SAMPLES[i];
    const d = Math.hypot(x - BRIDGE_POINT[0], z - BRIDGE_POINT[1]);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

const BRIDGE_IDX = findBridgeIndex();
const [BX0, BZ0] = RIVER_SAMPLES[Math.max(0, BRIDGE_IDX - 1)];
const [BX1, BZ1] = RIVER_SAMPLES[Math.min(RIVER_SAMPLES.length - 1, BRIDGE_IDX + 1)];
const BRIDGE_TANGENT_RAW = [BX1 - BX0, BZ1 - BZ0] as const;
const BRIDGE_TANGENT_LEN = Math.hypot(BRIDGE_TANGENT_RAW[0], BRIDGE_TANGENT_RAW[1]) || 1;
/** Vector đơn vị dọc hướng chảy tại điểm cầu. */
export const BRIDGE_TANGENT: [number, number] = [
  BRIDGE_TANGENT_RAW[0] / BRIDGE_TANGENT_LEN,
  BRIDGE_TANGENT_RAW[1] / BRIDGE_TANGENT_LEN,
];
/** Vector đơn vị vuông góc dòng chảy — hướng băng qua sông, dùng để xếp các tấm cầu. */
export const BRIDGE_NORMAL: [number, number] = [-BRIDGE_TANGENT[1], BRIDGE_TANGENT[0]];

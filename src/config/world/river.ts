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

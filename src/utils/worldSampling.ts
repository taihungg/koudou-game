import {
  PATHS,
  PLAYABLE_HALF,
  RIVER_HALF_WIDTH,
  WORLD_HALF,
  ZONES,
} from '@/config/world/chapter1';
import { RIVER_SAMPLES } from '@/config/world/river';
import type { BiomeId, PathConfig, ZoneShape } from '@/config/world/types';

/**
 * Truy vấn hình học của thế giới: một điểm (x, z) thuộc biome nào, cách lối mòn
 * bao xa, có nằm dưới nước không.
 *
 * Toàn bộ là hàm thuần và không cấp phát trong vòng lặp nóng, vì terrain lẫn
 * hệ thống rải thực vật đều gọi chúng vài nghìn lần mỗi khi nạp chunk.
 */

/** Khoảng cách có dấu tới biên hình: âm là ở trong, dương là ở ngoài. */
export function signedDistanceToShape(x: number, z: number, shape: ZoneShape): number {
  if (shape.type === 'circle') {
    const dx = x - shape.center[0];
    const dz = z - shape.center[1];
    return Math.sqrt(dx * dx + dz * dz) - shape.radius;
  }
  if (shape.type === 'path') {
    let best = Infinity;
    for (let i = 0; i < shape.points.length - 1; i++) {
      const [ax, az] = shape.points[i];
      const [bx, bz] = shape.points[i + 1];
      const d = distanceToSegment(x, z, ax, az, bx, bz);
      if (d < best) best = d;
    }
    return best - shape.halfWidth;
  }
  const cx = (shape.min[0] + shape.max[0]) / 2;
  const cz = (shape.min[1] + shape.max[1]) / 2;
  const hx = (shape.max[0] - shape.min[0]) / 2;
  const hz = (shape.max[1] - shape.min[1]) / 2;
  const dx = Math.abs(x - cx) - hx;
  const dz = Math.abs(z - cz) - hz;
  const outside = Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dz, 0) ** 2);
  const inside = Math.min(Math.max(dx, dz), 0);
  return outside + inside;
}

/** Khoảng cách từ điểm tới đoạn thẳng AB. */
export function distanceToSegment(
  px: number, pz: number,
  ax: number, az: number,
  bx: number, bz: number,
): number {
  const abx = bx - ax;
  const abz = bz - az;
  const lenSq = abx * abx + abz * abz;
  const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / lenSq));
  const dx = px - (ax + t * abx);
  const dz = pz - (az + t * abz);
  return Math.sqrt(dx * dx + dz * dz);
}

/** Khoảng cách tới tim của lối mòn gần nhất. */
export function distanceToNearestPath(x: number, z: number, paths: PathConfig[] = PATHS): number {
  let best = Infinity;
  for (const path of paths) {
    for (let i = 0; i < path.points.length - 1; i++) {
      const [ax, az] = path.points[i];
      const [bx, bz] = path.points[i + 1];
      const d = distanceToSegment(x, z, ax, az, bx, bz);
      if (d < best) best = d;
    }
  }
  return best;
}

/**
 * 1 khi đứng ngay trên tim đường, giảm về 0 ở mép. Dùng cho cả việc tô màu đất
 * lẫn việc loại thực vật — lối mòn hiện ra vì KHÔNG có cây, chứ không phải vì
 * ta vẽ một con đường (kou-dou.md §6).
 */
export function pathInfluenceAt(x: number, z: number, paths: PathConfig[] = PATHS): number {
  let best = 0;
  for (const path of paths) {
    const half = path.width / 2;
    for (let i = 0; i < path.points.length - 1; i++) {
      const [ax, az] = path.points[i];
      const [bx, bz] = path.points[i + 1];
      const d = distanceToSegment(x, z, ax, az, bx, bz);
      if (d < half) {
        const w = 1 - d / half;
        if (w > best) best = w;
      }
    }
  }
  return best;
}

/**
 * Khoảng cách ngắn nhất tới đường tim sông (đã lấy mẫu thành polyline trong
 * river.ts). Dùng cho cả kiểm tra "có đang ở dưới nước" lẫn tường va chạm.
 */
export function riverCenterlineDistance(x: number, z: number): number {
  let best = Infinity;
  for (let i = 0; i < RIVER_SAMPLES.length - 1; i++) {
    const [ax, az] = RIVER_SAMPLES[i];
    const [bx, bz] = RIVER_SAMPLES[i + 1];
    const d = distanceToSegment(x, z, ax, az, bx, bz);
    if (d < best) best = d;
  }
  return best;
}

/**
 * 0 trong vùng chơi được, tăng dần 0→1 khi vượt qua PLAYABLE_HALF, đạt 1 ở
 * đúng mép bản đồ. Dùng để làm cây ở vành biên to và dày dần lên — lý do
 * "không đi tiếp được nữa" phải hiện rõ bằng mắt trước khi chạm tường vô hình.
 */
export function beltFactorAt(x: number, z: number): number {
  const d = Math.max(Math.abs(x), Math.abs(z));
  if (d <= PLAYABLE_HALF) return 0;
  if (d >= WORLD_HALF) return 1;
  const t = (d - PLAYABLE_HALF) / (WORLD_HALF - PLAYABLE_HALF);
  return t * t * (3 - 2 * t);
}

/** Trọng số của một zone tại điểm: 1 ở lõi, giảm mượt về 0 qua dải blend. */
export function zoneWeightAt(x: number, z: number, zoneIndex: number): number {
  const zone = ZONES[zoneIndex];
  const d = signedDistanceToShape(x, z, zone.shape);
  if (d <= 0) return 1;
  if (d >= zone.blend) return 0;
  const t = 1 - d / zone.blend;
  return t * t * (3 - 2 * t); // smoothstep, tránh gãy khúc ở mép
}

export interface BiomeSample {
  /** Trọng số theo từng biome, đã chuẩn hoá về tổng 1. */
  weights: Partial<Record<BiomeId, number>>;
  /** Biome chiếm ưu thế — dùng khi cần chọn một palette duy nhất. */
  dominant: BiomeId;
  /** Mức ảnh hưởng của lối mòn, 0..1. */
  path: number;
  /**
   * Nằm trong lòng sông — tính LIÊN TỤC dọc cả đường cong, KỂ CẢ ở chỗ cầu.
   * Một khúc sông cạn để lội qua được vẫn là nước; chỉ tường vật lý (RiverWalls)
   * mới có khoảng hở, còn nền/thực vật thì không nên "ngắt" ở đó — trước đây
   * tách hai việc này ra làm một khiến nền lộ ra một miếng nâu (màu lối mòn)
   * giữa dòng nước ngay tại điểm cầu.
   */
  water: boolean;
  /** Nằm trong vành chắn biên. */
  belt: boolean;
}

/**
 * Lấy mẫu biome tại một điểm. Phần trọng số không thuộc zone nào rơi về
 * `deep_canopy` — rừng già dày đặc là nền mặc định của cả bản đồ.
 */
export function sampleBiome(x: number, z: number): BiomeSample {
  const weights: Partial<Record<BiomeId, number>> = {};
  let total = 0;

  for (let i = 0; i < ZONES.length; i++) {
    const w = zoneWeightAt(x, z, i);
    if (w <= 0) continue;
    const biome = ZONES[i].biome;
    weights[biome] = (weights[biome] ?? 0) + w;
    total += w;
  }

  const belt = Math.abs(x) > PLAYABLE_HALF || Math.abs(z) > PLAYABLE_HALF;
  if (belt) {
    // Vành biên luôn là rừng dày, đè lên mọi zone tràn ra tới đó.
    weights.deep_canopy = (weights.deep_canopy ?? 0) + 2;
    total += 2;
  } else if (total < 1) {
    weights.deep_canopy = (weights.deep_canopy ?? 0) + (1 - total);
    total = 1;
  }

  let dominant: BiomeId = 'deep_canopy';
  let best = -1;
  for (const key of Object.keys(weights) as BiomeId[]) {
    const w = weights[key]! / total;
    weights[key] = w;
    if (w > best) {
      best = w;
      dominant = key;
    }
  }

  return {
    weights,
    dominant,
    path: pathInfluenceAt(x, z),
    water: riverCenterlineDistance(x, z) <= RIVER_HALF_WIDTH,
    belt,
  };
}

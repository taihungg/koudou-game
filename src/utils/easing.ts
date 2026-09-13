/**
 * Hàm easing dùng cho chuyển động camera điện ảnh.
 *
 * Tách riêng khỏi component vì `src/config/cinematics/*` cần khai báo tên easing
 * dưới dạng DỮ LIỆU (chuỗi) — kịch bản là config, không phải code, nên không thể
 * nhúng thẳng hàm vào đó.
 */

export type EasingName =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic';

export const EASINGS: Record<EasingName, (t: number) => number> = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};

/** Kẹp về [0,1] — dùng khắp nơi khi quy đổi thời gian sang tiến độ. */
export function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

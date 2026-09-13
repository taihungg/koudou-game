import type { EasingName } from '@/utils/easing';

/**
 * Kiểu dữ liệu cho cutscene. Kịch bản được viết dưới dạng DỮ LIỆU (xem
 * `chapter1Intro.ts`) chứ không phải code React: chỉnh nhịp, đổi toạ độ, sửa lời
 * dẫn đều chỉ đụng vào một file config, giống cách `src/config/world/*` mô tả bố
 * cục bản đồ.
 */

export type Vec3 = [number, number, number];

/** Kiểu nối cảnh. Không có cross-dissolve thật (cần render-to-texture) —
 *  `dissolve` là một cú chớp đen RẤT ngắn, đọc trên màn hình như cắt mềm. */
export type TransitionKind = 'cut' | 'fade' | 'dissolve';

/** Camera đứng yên. Dùng cho cảnh màn đen hoặc cảnh chỉ có overlay DOM. */
export interface HoldCamera {
  mode: 'hold';
  position: Vec3;
  lookAt: Vec3;
  fov?: number;
}

/** Máy quay trượt từ A đến B, điểm nhìn cũng trượt theo. */
export interface DollyCamera {
  mode: 'dolly';
  from: Vec3;
  to: Vec3;
  lookAtFrom: Vec3;
  /** Bỏ trống = giữ nguyên `lookAtFrom` suốt cảnh. */
  lookAtTo?: Vec3;
  fov?: number;
  fovTo?: number;
  ease?: EasingName;
}

/**
 * Quay vòng quanh một điểm. Góc tính bằng radian, 0 = phía +X, tăng dần về +Z.
 *
 * Cố tình KHÔNG quay đủ 360°: bản đồ hữu hạn (WORLD_HALF = 240) và thực vật chỉ
 * tồn tại trong vài chunk quanh tâm stream, nên một vòng tròn kín luôn có đoạn
 * chĩa thẳng ra vành biên hoặc ra vùng chưa nạp. Cung 120–180° hướng vào trong
 * bản đồ đọc trên màn hình y hệt mà không phơi ra mép thế giới.
 */
export interface OrbitCamera {
  mode: 'orbit';
  /** Tâm quay, cũng là điểm nhìn. */
  center: Vec3;
  radius: number;
  radiusTo?: number;
  height: number;
  heightTo?: number;
  fromAngle: number;
  toAngle: number;
  fov?: number;
  fovTo?: number;
  ease?: EasingName;
}

export type ShotCamera = HoldCamera | DollyCamera | OrbitCamera;

export interface ShotSubtitle {
  /** Lời dẫn tiếng Pháp. Luôn hiển thị, kể cả khi sau này có voice-over. */
  fr: string;
  /** Mặc định 300 ms sau khi vào cảnh. */
  showAtMs?: number;
  /** Mặc định 300 ms trước khi hết cảnh. */
  hideAtMs?: number;
}

/** Chỉnh màu toàn khung bằng lớp phủ DOM (`backdrop-filter`) — rẻ hơn nhiều so
 *  với post-processing pass, và đủ cho tương phản "đất chết ↔ hồi sinh". */
export interface ShotGrade {
  saturate: number;
  sepia?: number;
  brightness?: number;
  /** Màu phủ nhẹ lên khung hình (rgba). */
  tint?: string;
}

/**
 * Đổi phông nền 3D trong một cảnh (nền đen tuyệt đối, tắt sương) để đạo cụ nổi
 * lên giữa hư không — dùng cho cảnh cuộn bản đồ. Camera những cảnh này được đặt
 * ra ngoài bản đồ nên trong khung hình không còn gì khác.
 */
export interface ShotStage {
  background: string;
}

export interface IntroShot {
  id: string;
  durationMs: number;
  camera: ShotCamera;
  transitionIn: TransitionKind;
  /** Giữ màn đen suốt cảnh (chữ vẫn hiện). */
  blackout?: boolean;
  subtitle?: ShotSubtitle;
  grade?: ShotGrade;
  stage?: ShotStage;
  /** Lớp DOM riêng của cảnh — dựng ở Bước 3/4. */
  domOverlay?: 'map-card' | 'title-card';
}

/**
 * Độ lệch isometric của camera so với người chơi, dùng chung cho mọi cảnh.
 *
 * `Player` đặt camera tại `player + [OFFSET, OFFSET, OFFSET]` mỗi khung hình, còn
 * hệ thống chunk suy ngược vị trí người chơi bằng `camera.position - OFFSET`.
 * Trước đây số 20 bị chép ở hai nơi: đổi một bên thì streaming lệch âm thầm.
 */
export const ISO_CAMERA_OFFSET = 20;

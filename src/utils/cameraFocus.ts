/**
 * Tâm stream chunk của thế giới, tách khỏi vị trí camera.
 *
 * Bình thường `ZonedForest` suy vị trí người chơi bằng `camera.position −
 * ISO_CAMERA_OFFSET` (xem `src/constants/camera.ts`) — đúng vì `Player.tsx` ghim
 * camera tại `player + [20,20,20]` mỗi khung hình.
 *
 * Nhưng trong cutscene, camera BAY TỰ DO (và là camera phối cảnh, không phải
 * ortho) nên phép suy ngược đó cho ra toạ độ vô nghĩa: chunk sẽ nạp/dỡ loạn theo
 * đường bay, gây giật và lộ mặt đất trọc. Khi `override = true`, hệ thống world
 * đọc `x/z` ở đây — do camera điện ảnh ghi vào, và đó là ĐIỂM NHÌN (nơi khán giả
 * đang xem), không phải vị trí camera.
 *
 * Dùng ô nhớ module-scope thay vì Zustand theo đúng pattern `minimapProbe`
 * (`MinimapProbe.tsx`) và `WorldDebugHUD.tsx`: giá trị đổi mỗi khung hình, cho
 * chảy qua `set()` sẽ kéo theo re-render cả cây React 60 lần/giây.
 */
export const cameraFocus = {
  x: 0,
  z: 0,
  /** `true` = hệ thống world phải đọc x/z ở đây thay vì suy từ camera. */
  override: false,
};

/** Gọi khi cutscene kết thúc — quên trả về `false` là chunk sẽ đứng im tại chỗ. */
export function releaseCameraFocus() {
  cameraFocus.override = false;
}

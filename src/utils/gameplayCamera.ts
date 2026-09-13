import type * as THREE from "three";

/**
 * Tham chiếu tới camera GAMEPLAY của màn hiện tại (camera ortho khai báo trong
 * `src/app/forest/page.tsx`).
 *
 * Vì sao cần: cutscene tạm thời đổi camera mặc định sang camera phối cảnh, và
 * khi xong phải trả lại đúng camera cũ. Cách "đọc `state.camera` lúc mount rồi
 * nhớ lại" KHÔNG đáng tin — đã dính lỗi thật:
 *
 *   - `makeDefault` của drei lưu `oldCam` trong một layout effect phụ thuộc
 *     chính giá trị `camera` nó vừa ghi, nên nó tự chạy lại và `oldCam` thành ra
 *     là camera nó vừa gắn;
 *   - cây con trong `<Canvas>` liên tục suspend/resume mỗi khi chunk nạp model
 *     mới, mỗi lần như vậy layout effect của mọi camera đều bị dọn rồi chạy lại,
 *     nên "camera đang mặc định" tại thời điểm mount có thể là camera phối cảnh
 *     mặc định của R3F chứ không phải camera ortho của màn chơi.
 *
 * Hậu quả khi trả nhầm: camera phối cảnh ở lại sau intro, rồi `Player.tsx` (viết
 * cho ortho) lerp `camera.zoom` về 40 → phóng đại 40 lần, nhân vật to kín màn
 * hình.
 *
 * Ô nhớ này là nguồn sự thật một chiều: màn chơi khai báo camera của nó ở đây,
 * cutscene chỉ việc đọc ra mà trả về.
 */
export const gameplayCamera: { current: THREE.Camera | null } = { current: null };

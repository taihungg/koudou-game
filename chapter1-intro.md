# Intro Chương 1 — cutscene mở màn

Tài liệu trạng thái cho cutscene mở màn `/forest`. Kịch bản nội dung (lời dẫn,
thứ tự cảnh) là thứ người viết game quyết định; file này ghi **code đang ở đâu,
dùng thế nào, và ba cái bẫy đã dính** để không ai phải gỡ lại lần nữa.

Kịch bản: professeur Dubois — chuyên gia môi trường nổi tiếng — biến mất không
một lời giải thích, chỉ để lại một tấm bản đồ. Học trò của ông, Alex, đi theo bản
đồ để tìm ông. Điểm đến đầu tiên: một khu rừng kỳ lạ.

## Đang có gì (Bước 1 — hạ tầng, ĐÃ XONG)

| File | Vai trò |
|---|---|
| `src/config/cinematics/types.ts` | Kiểu dữ liệu cảnh quay (dolly / orbit / hold, chuyển cảnh, phụ đề, chỉnh màu, sân khấu riêng) |
| `src/config/cinematics/chapter1Intro.ts` | **Kịch bản dạng dữ liệu** — 11 cảnh, ~54 giây, toạ độ thật trên bản đồ Chương 1 |
| `src/store/useCinematicStore.ts` | `phase`, `shotIndex`, chế độ dựng cảnh + `cinematicClock` (đồng hồ duy nhất) |
| `src/components/game/cinematic/CinematicCamera.tsx` | Camera phối cảnh, nội suy keyframe, sân khấu nền đen, tâm stream chunk |
| `src/components/game/cinematic/IntroScene.tsx` | Phần trong `<Canvas>`, đọc `?cine=` |
| `src/components/ui/IntroCinematicUI.tsx` | Lớp phủ đen, letterbox, phụ đề, nút « Passer », điều phối vòng đời |
| `src/utils/cameraFocus.ts` | Tâm stream chunk khi camera bay tự do |
| `src/utils/gameplayCamera.ts` | Neo tới camera gameplay để trả lại cho đúng |
| `src/utils/easing.ts` | Hàm easing cho chuyển động camera |

Chỉnh nhịp/lời dẫn/toạ độ: **chỉ sửa `chapter1Intro.ts`**, không đụng component.

## Chế độ dựng cảnh

```
/forest?cine=3          # ghim cảnh số 3, bỏ lớp phủ đen, không chạy tiếp
/forest?cine=3&cinet=0.7  # ghim cảnh 3 tại 70% thời lượng
```

Chạy được cả khi đã xem intro rồi. Đây là cách DUY NHẤT nên dùng để căn khuôn
hình — ngồi xem lại 54 giây cho mỗi lần chỉnh một toạ độ là không khả thi.

## Ba cái bẫy đã dính (đọc trước khi sửa camera)

**1. Quyền "camera mặc định" là giao kèo tay ba.** `/forest/page.tsx` đặt
`makeDefault={!cinematic}` để camera ortho TỰ NHƯỜNG quyền; `CinematicCamera` gọi
`set({ camera })` để nhận; khi unmount nó trả về camera ghi trong
`gameplayCamera`. Bỏ bất kỳ mắt xích nào cũng hỏng:

- Bỏ điều kiện `makeDefault` → layout effect của drei gắn lại camera ortho, màn
  hình **đứng im ở góc nhìn ortho cũ** (nhìn vào gốc toạ độ, tức khúc sông) suốt
  cả intro, trong khi camera điện ảnh vẫn bay trong bộ nhớ.
- Tin vào `oldCam` của drei để khôi phục → nó khôi phục nhầm chính camera vừa
  tháo, camera phối cảnh ở lại làm mặc định, rồi `Player.tsx` (viết cho ortho)
  lerp `camera.zoom` về 40 → **nhân vật to kín màn hình** khi vào game.

**2. Không được hoãn việc trả camera** sang khung hình sau
(`requestAnimationFrame`). React StrictMode ở dev chạy effect theo trình tự
mount → cleanup → mount lại, nên cú trả bị hoãn rơi xuống SAU lần mount thứ hai
và đá camera điện ảnh ra ngay giữa cutscene.

**3. Chunk streaming phải đổi tâm.** `ZonedForest`/`MinimapProbe` suy vị trí
người chơi bằng `camera.position − ISO_CAMERA_OFFSET` — vô nghĩa với camera bay
tự do. Trong cutscene, `cameraFocus.override = true` và máy quay tự khai báo tâm
stream (chính là ĐIỂM NHÌN). Cảnh màn đen / cảnh sân khấu rời giữ nguyên tâm cũ
thay vì kéo chunk chạy theo toạ độ vô nghĩa.

Bán kính chunk trong cutscene nới lên `RENDER_DISTANCE_CINEMATIC = 2`
(`chapter1.ts`): camera phối cảnh nhìn xa hơn nhiều so với ô ~40 × 39 m của camera
gameplay, để nguyên 1 là mọi khuôn hình rộng đều lộ mặt đất trọc.

## Điều khiển vòng đời

- Cờ `hasSeenChapter1Intro` trong `useGameStore` **có persist** (ngoại lệ có chủ
  ý so với luật "không persist cờ modal" trong CLAUDE.md) — intro chỉ chạy ở lần
  chơi đầu tiên. Menu chính có nút « Revoir l'introduction » để bật lại.
- Escape / Space / nút « Passer » đều bỏ qua intro; cờ vẫn được ghi nhận.
- `prefers-reduced-motion: reduce` → lùi về thẻ kể chuyện tĩnh `ForestIntroUI`.
- Người chơi bị đóng băng bằng `setInteracting(true)` suốt cutscene và được thả
  ra TRƯỚC khi màn đen mở, để `Player.tsx` kịp ghim lại camera ortho.

## Còn lại

- **Bước 2 — căn khuôn hình + phụ đề.** ĐANG LÀM. Đã xong: bầu trời + mặt trời
  (`SkyBackground.tsx`); dời cảnh `dubois` ra hành lang lối mòn `p4` quanh
  `(-110, 80)`; cảnh `hero` ngẩng dần lên để bắt mặt trời; đổi thứ tự lời dẫn để
  tên Dubois xuất hiện TRƯỚC đại từ "Il"; giãn thời lượng cho mọi dòng phụ đề về
  mức ≤ 13 ký tự/giây. Còn lại: xem lại bằng mắt các cảnh `dead_land`, `dubois`
  sau khi dời máy, và chốt lại đoạn kết theo `SPAWN` thật (xem mục dưới).
- **Bước 3 — diễn viên & đạo cụ.** Alex, silhouette Dubois (model Mage, ngược
  sáng, không cận mặt — bộ nhân vật không có ông già đeo kính), cuộn bản đồ
  (`tools/map_rolled.glb`), thẻ bản đồ 2D cho cảnh `map_close`.
- **Bước 4 — âm thanh, thẻ tiêu đề, viết lại lore.** Lớp audio theo manifest
  (thiếu file thì im lặng, không vỡ); thẻ « CHAPITRE 1 — LA FORÊT ÉTRANGE »;
  viết lại tiền đề ở `useDialogueStore.ts` (2 chỗ), `ForestIntroUI.tsx`,
  `dialouge.md` cho khớp kịch bản mới. (`KOUDOU-overview.md` đã bị xoá khỏi repo;
  tài liệu cốt truyện nay tra ở `kou-dou.md`.)

## Đoạn kết đang lệch với SPAWN

Ba cảnh cuối (`alex_decides`, `forest_gate`, `hero`) được dựng quanh Clairière
d'arrivée `(-160, -165)` — nơi `SPAWN` đứng lúc viết intro — để máy quay dừng
đúng chỗ người chơi sẽ xuất hiện, cắt sang gameplay là liền mạch.

`SPAWN` hiện đã đổi thành `(38, 3, -60)`. Nếu đó là điểm xuất hiện chính thức thì
phải neo lại ba cảnh cuối theo toạ độ mới; nếu chỉ là điểm spawn tạm để test thì
không cần làm gì. Chưa tự đổi vì đây là quyết định thiết kế, không phải lỗi.

## Ghi chú khi test

Vòng lặp khung hình của `<Canvas>` bị trình duyệt điều tiết rất mạnh khi cửa sổ
xem trước không được vẽ (kiểm thử tự động, tab nền): cutscene sẽ "đứng" ở màn đen
rồi nhảy cóc vài cảnh một lúc. Đó là hiện tượng của môi trường test, không phải
lỗi game. Muốn đo đúng thì bơm khung hình từ console:

```js
const t0 = performance.now();
while (performance.now() - t0 < 9000) await new Promise(r => requestAnimationFrame(r));
```

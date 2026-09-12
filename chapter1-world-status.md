# Chapter 1 forest world — status

Tài liệu trạng thái để tiếp tục công việc sau khi compact session. Đây KHÔNG phải
tài liệu thiết kế (đó là `kou-dou.md`) — đây là "code hiện đang ở đâu, dùng thế
nào, còn thiếu gì".

Toàn bộ việc mô tả ở đây nằm trong 3 commit gần nhất:
`4f1d63f` (hệ thống world), `7998dbd` (tài liệu), `d223b8e` (nhạc nền, không
liên quan tới world).

## Route nào dùng hệ thống nào

- **`/forest`** (Chapter 1) → `Environment.tsx` → `ZonedForest.tsx` — hệ thống
  MỚI, bản đồ hữu hạn có biên, mô tả bên dưới.
- **`/village`** (Chapter 2) → `VillageEnvironment.tsx` → `InfiniteForest.tsx` —
  hệ thống CŨ, chunk vô hạn rải ngẫu nhiên. **Chưa đụng tới** — vẫn hoạt động
  như trước, không thay đổi.

Không nhầm hai hệ thống này. Nếu sửa gì cho "rừng" mà không thấy hiệu ứng, kiểm
tra xem có đang sửa nhầm `InfiniteForest.tsx` (chỉ ảnh hưởng `/village`) không.

## Bật chế độ debug

`http://localhost:3000/forest?debug=1` — hiện bảng góc dưới trái: toạ độ, biome,
zone + % trọng số, khoảng cách tới lối mòn gần nhất, khoảng cách tới biên bản
đồ, có đang trong nước không.

**Lưu ý khi test bằng cách sửa `SPAWN`/`RENDER_DISTANCE`/zoom tạm thời**: BẮT
BUỘC `localStorage.clear(); location.reload()` sau mỗi lần sửa file trong khi
tab đang mở — Next.js Fast Refresh giữa chừng làm hỏng trạng thái vật lý/input
(người chơi đứng yên, phím không phản hồi, không phải bug thật). Luôn trả các
hằng số về giá trị gốc sau khi test xong (xem "Hằng số chính thức" bên dưới).

## Hằng số chính thức (đừng để sót giá trị TEMP-* khi commit)

Tất cả trong `src/config/world/chapter1.ts`:

```
WORLD_HALF = 240            // nửa cạnh bản đồ, gồm cả vành biên
PLAYABLE_HALF = 200          // ngoài đây là vành canopy chắn biên
CHUNK_SIZE = 40
RENDER_DISTANCE = 1          // bán kính chunk cho THỰC VẬT (3×3 chunk)
TERRAIN_RENDER_DISTANCE = 3  // bán kính chunk cho MẶT ĐẤT (rẻ hơn, trải xa hơn)
SPAWN = [-160, 3, -165]      // giữa Clairière d'arrivée (Z0)
```

Camera `/forest/page.tsx`: `zoom={40}`, offset `ISO_CAMERA_OFFSET=20`
(`src/constants/camera.ts` — một nguồn duy nhất, trước đây bị chép ở cả
`Player.tsx` và forest cũ).

## Bố cục 8 zone

| Zone id | Tên | Hình | Biome | Palette đầy đủ? |
|---|---|---|---|---|
| `arrival` | Clairière d'arrivée (Z0) | tròn tâm (-160,-165) r35 | `clearing` | ✅ |
| `early_forest` | Forêt claire (Z1) | chữ nhật x[-190,-40] z[-125,-55] | `light_forest` | ✅ |
| `medicinal_grove` | Bosquet médicinal (Z2) | tròn tâm (70,-110) r60 | `medicinal_grove` | ✅ |
| `river` | Rivière | path (đường cong, xem dưới) | `riverbank` | có nước, chưa có thực vật bờ sông riêng |
| `ancient_forest` | Forêt ancienne | chữ nhật z[45,125] | `ancient_forest` | ❌ lùi về `deep_canopy` |
| `cave_camp` | Grotte et camp | tròn tâm (-160,165) r33 | `rocky` | ❌ lùi về `deep_canopy` |
| `cabin` | Cabane abandonnée | tròn tâm (55,100) r52 | `cabin_clearing` | ❌ lùi về `deep_canopy` |
| `human_traces` | Traces humaines | chữ nhật z[155,196] | `logged` | ❌ lùi về `deep_canopy` |

`deep_canopy` là nền mặc định phủ mọi nơi không thuộc zone nào, và cũng dùng
làm vành biên (qua `beltFactorAt`, xem dưới). `getPalette()` trong
`src/config/world/biomes.ts` tự lùi về `deep_canopy` cho 4 biome chưa author —
**đây chính là việc còn lại lớn nhất của P3**.

## Sông (đã đổi từ thẳng sang uốn lượn, đã vá 2 lỗi)

`src/config/world/river.ts`: `CatmullRomCurve3` qua 10 điểm điều khiển, lấy mẫu
150 điểm (`RIVER_SAMPLES`) cho mọi việc TÍNH TOÁN (zone weight, kiểm tra nước,
tường va chạm). Mesh HIỂN THỊ (`River.tsx`) lấy mẫu mịn hơn riêng (220 đoạn)
trực tiếp từ `RIVER_CURVE`, không dùng `RIVER_SAMPLES`.

- `RIVER_HALF_WIDTH = 9` — nửa bề rộng nước thật (dùng cho tô màu + tường vật lý)
- `BRIDGE_POINT = [-20, 6]`, `BRIDGE_WIDTH = 14` — điểm + bề rộng khoảng hở
  duy nhất trên tường (`RiverWalls.tsx`, ~120 đoạn collider ngắn nối theo
  đường cong). **Chưa có mặt cầu vật lý** — chỗ cầu hiện là chỗ lội qua được,
  không có sàn gỗ để đi trên khô. Đây là việc còn lại của P3.
- Lỗi #1 đã vá: điểm cầu từng bị tô màu nâu (lối mòn) đè lên nước bán trong
  suốt → mảng vá lệch màu. Sửa: `water` giờ tính LIÊN TỤC dọc cả đường cong
  (không trừ khoảng hở nữa) — chỉ tường vật lý mới có khoảng hở, không phải
  cách tô màu/né cây.
- Lỗi #2 đã vá: ở khúc cua, tán cây cao sát mép 9m bị góc camera isometric
  xiên khiến trông như che một phần mặt nước. Sửa: thêm `RIVER_CLEARANCE_MARGIN`
  trong `vegetationSampling.ts` — canopy lùi thêm 6m, understory 3m khỏi mép
  nước thật (chỉ ảnh hưởng chỗ RẢI CÂY, không đổi độ rộng nước hiển thị).

## Thực vật — cách sinh (đọc trước khi chỉnh mật độ)

`src/utils/vegetationSampling.ts`, palette trong `src/config/world/biomes.ts`.

- Đơn vị mật độ là **`spacing`** (khoảng cách mét trung bình giữa các cây),
  KHÔNG PHẢI số/100m². Từng nhầm điều này ở bản nháp đầu → rừng dày như tường
  ngay ở khu đất trống. Muốn thưa hơn thì TĂNG số, dày hơn thì GIẢM số.
- 5 tầng mỗi biome: `canopy` (có trunk collider), `understory` (có trunk
  collider nhỏ hơn), `shrub`, `clutter` (instanced, không collider), `props`
  (không collider).
- `heightRange` là mét THẬT sau chuẩn hoá (không phải hệ số scale) — mỗi
  instance random một chiều cao mục tiêu trong khoảng rồi mới suy ra scale qua
  `scaleToHeight()` (`src/constants/assetScale.ts`), nên trộn nhiều nguồn asset
  vẫn ra một dải chiều cao thống nhất.
- Bị loại khỏi vị trí rải nếu: gần tim lối mòn (`pathInfluenceAt`), trong bán
  kính nước + margin (`riverCenterlineDistance` + `RIVER_CLEARANCE_MARGIN`),
  hoặc trong clearance của landmark/species (`CLEARANCE_POINTS`, gộp cả
  `LANDMARKS` và `WORLD_SPECIES`).
- `BELT_CANOPY` (biomes.ts): pass RIÊNG, luôn chạy cho mọi chunk, trọng số
  chấp nhận là `beltFactorAt()` (0 trong vùng chơi được → 1 ở mép bản đồ) thay
  vì trọng số biome — cây cao 12–17m, cách nhau 6m, tạo cảm giác "không đi tiếp
  được nữa" TRƯỚC khi chạm tường vô hình của `WorldBounds`.
- Terrain (`TerrainTiles.tsx`) và thực vật dùng HAI bán kính chunk khác nhau
  (`TERRAIN_RENDER_DISTANCE` > `RENDER_DISTANCE`) — mặt đất rẻ nên trải xa hơn,
  tránh cảnh cây hiện ra trước khi có nền dưới chân khi camera bị zoom rộng bất
  thường (zoom trình duyệt, cutscene...).

## Landmark + loài học (nền cho checklist sau này)

`src/config/world/chapter1.ts` (`LANDMARKS`, 3 điểm) và
`src/config/world/species.ts` (`WORLD_SPECIES`, 8 điểm — 1 ở Z0, 2 ở Z1, 5 ở
Z2). Cả hai đều **đặt tay, id cố định vĩnh viễn**, không tái sinh theo chunk
như thực vật trang trí — điều kiện bắt buộc để sau này làm checklist kiểu
"3/5 loài đã tìm trong Bosquet médicinal".

`WorldSpecies.tsx` tái dùng nguyên `LearningEntity.tsx` đã có sẵn (glow ring,
sensor, thẻ bài, XP) — không viết lại gì. `speciesId` trong mỗi entry phải
khớp field `id` trong `src/data/learningEntities.json`.

**Chưa làm**: UI checklist thật ("X/Y loài đã tìm"). Dữ liệu đã sẵn sàng
(`zoneId` + `speciesId` ổn định) nhưng cần quyết định thiết kế (hiện ở đâu,
theo zone hay toàn cục, câu chữ tiếng Pháp) trước khi code.

## Chuẩn hoá asset (đọc trước khi thêm pack mới)

`src/constants/assetScale.ts` là nguồn sự thật duy nhất cho scale theo pack.
Sinh lại bằng:

```bash
node scripts/generate-asset-data.mjs
```

Script này gọi `audit-models.mjs` (GLB/glTF) và `audit-fbx.mjs` (FBX nhị phân,
tự parse không cần three.js) để đo bounding box THẬT, ghi ra
`assetHeights.generated.json` + `assetsExtra.ts`. Chạy lại mỗi khi thêm pack
mới vào `public/models/`.

**Chưa chắc chắn**: `/models/koudou/` (linh vật, 8 file FBX) — scale đang đặt
tạm `0.25`, ghi rõ "CHƯA CHẮC" trong `assetScale.ts`, cần kiểm tra bằng mắt.
`/models/survival/survivalassetpack.fbx` là một atlas gộp nhiều vật thể trong
một file, **không dùng trực tiếp được**.

## Vấn đề đã biết, không thuộc phạm vi world system

Commit `d223b8e` (nhạc nền, không phải tôi làm, chỉ đang nằm sẵn trong working
tree lúc tôi commit): `BackgroundMusic.tsx` gọi
`/audio/koudou_background_music.wav` nhưng file thật tên
`_koudou_background_music.wav` (thừa dấu gạch dưới đầu) → phát nhạc lỗi âm
thầm, chỉ thấy lỗi decode trong console. Chưa sửa vì ngoài phạm vi phiên làm
việc này.

## Việc còn lại (P3 theo plan đã duyệt)

1. Author palette cho 4 biome còn thiếu: `ancient_forest`, `rocky`,
   `cabin_clearing`, `logged` (hiện lùi về `deep_canopy`, nhìn không khác gì
   nền mặc định).
2. Landmark + thực vật bờ sông riêng cho biome `riverbank` (hiện chỉ có nước,
   chưa có sậy/đá ven bờ).
3. Mặt cầu vật lý thật tại `BRIDGE_POINT` (hiện chỉ là khoảng hở lội qua được).
4. Mở rộng `WORLD_SPECIES` sang 5 zone còn lại khi palette của chúng xong.

Việc UI checklist ("X/Y loài đã tìm") có thể làm song song, không phụ thuộc P3.

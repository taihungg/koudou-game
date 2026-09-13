import type { IntroShot } from './types';

/**
 * Intro Chương 1 — « La Forêt étrange ».
 *
 * Kịch bản: professeur Dubois, chuyên gia môi trường nổi tiếng, biến mất không
 * một lời giải thích và chỉ để lại một tấm bản đồ. Học trò của ông, Alex, đi
 * theo bản đồ để tìm ông. Điểm đến đầu tiên: một khu rừng kỳ lạ.
 *
 * MỌI toạ độ ở đây là toạ độ THẬT trên bản đồ Chương 1 (`src/config/world/
 * chapter1.ts`) — không dựng sân khấu riêng. Mặt đất phẳng ở y = 0
 * (`WorldBounds.tsx`), người chơi cao ~2,2 m, nên camera tầm mắt là y ≈ 1,8–3.
 *
 * Đối chiếu cảnh ↔ zone:
 *   - `dead_land`     → zone `human_traces` (biome `logged`: đất nâu, gốc cây)
 *   - `revived_grove` → zone `medicinal_grove`, cạnh landmark cây cổ thụ
 *   - `dubois`        → zone `ancient_forest` (biome tối nhất, hợp cảnh bí ẩn)
 *   - `alex_decides`  → zone `arrival`, gần landmark cây đổ
 *   - `forest_gate` / `hero` → rìa `early_forest` nhìn theo lối mòn `p1`
 *
 * Tổng thời lượng ~56 giây. Luôn có nút « Passer » ngay từ giây đầu.
 *
 * ── Luật thời lượng phụ đề (đừng rút ngắn khi chỉnh nhịp) ─────────────────
 * Người học tiếng Pháp trình độ A2 đọc khoảng 12–13 ký tự/giây. Mỗi dòng lời dẫn
 * phải nằm trên màn hình ít nhất `số ký tự / 13` giây, và cảnh phải đủ dài để
 * chứa cả khoảng đó lẫn 300–800 ms mờ vào/mờ ra hai đầu. Hiện cả sáu dòng đều ở
 * mức 9–12,3 ký tự/giây. Cắt nhịp cho "gọn" mà phá ngưỡng này thì người chơi
 * chưa đọc xong câu đã mất chữ — với một game dạy ngôn ngữ thì đó không phải
 * chuyện thẩm mỹ, đó là hỏng chức năng.
 */

/** Điểm Alex đứng ở cảnh 6–8. Trong Clairière d'arrivée, cách landmark cây đổ
 *  (-150,-150) đủ xa để vòng máy quay không xuyên qua thân cây. */
const ALEX_STAND: [number, number, number] = [-165, 0, -160];

export const CHAPTER1_INTRO_SHOTS: IntroShot[] = [
  {
    // Đệm đen mở màn: che nốt khung hình đầu tiên trong lúc chunk vừa nạp xong,
    // đồng thời cho người chơi một nhịp trước khi chữ đầu tiên hiện ra.
    id: 'open_black',
    durationMs: 1000,
    transitionIn: 'cut',
    blackout: true,
    camera: { mode: 'hold', position: [150, 7, 170], lookAt: [130, 1.5, 178], fov: 45 },
  },
  {
    // Cảnh 1a — vùng đất chết. Máy quay trượt ngang qua bãi gốc cây của zone
    // `human_traces`, ám nâu và bạc màu. Nhìn về phía -X nên ngôi làng (x > 164)
    // nằm sau lưng máy, không lọt vào khung.
    //
    // Câu giới thiệu Dubois đặt Ở ĐÂY chứ không phải ở cảnh `dubois`: nếu để
    // cảnh 1b nói trước ("Il a aidé...") thì đại từ "Il" chỉ vào một người chưa
    // được giới thiệu — đúng thứ làm người học A2 mất mạch ngay câu đầu tiên.
    id: 'dead_land',
    durationMs: 6500,
    transitionIn: 'fade',
    grade: { saturate: 0.3, sepia: 0.4, brightness: 0.85 },
    subtitle: {
      fr: 'Le professeur Dubois est un célèbre spécialiste de l’environnement.',
      showAtMs: 700,
      hideAtMs: 6200,
    },
    camera: {
      mode: 'dolly',
      from: [140, 7, 170],
      to: [112, 6, 172],
      lookAtFrom: [120, 1.5, 178],
      lookAtTo: [92, 1.5, 180],
      fov: 45,
      ease: 'linear',
    },
  },
  {
    // Cảnh 1b — hồi sinh. Cắt mềm sang Bosquet médicinal, máy quay ngửa dần lên
    // tán cây cổ thụ (landmark `medicinal_grove_ancient_tree` ở (75,-100)).
    id: 'revived_grove',
    durationMs: 6000,
    transitionIn: 'dissolve',
    grade: { saturate: 1.15 },
    subtitle: {
      fr: 'Il a aidé de nombreuses régions à retrouver leur vie.',
      showAtMs: 700,
      hideAtMs: 5600,
    },
    camera: {
      mode: 'dolly',
      from: [58, 2.6, -78],
      to: [64, 8.5, -86],
      lookAtFrom: [75, 4, -100],
      lookAtTo: [75, 11, -100],
      fov: 48,
      ease: 'easeInOutCubic',
    },
  },
  {
    // Cảnh 2 — Dubois. Máy quay tiến chậm vào bóng người trong sương của Forêt
    // ancienne. Ở Bước 3, silhouette đứng tại (-110, 0, 80).
    //
    // Đặt dọc HÀNH LANG LỐI MÒN p4, không phải giữa rừng: `pathInfluenceAt`
    // không rải cây sát tim đường, nên đây là chỗ duy nhất trong Forêt ancienne
    // vừa dày đặc vừa có đường nhìn thông. Bản nháp trước đặt máy giữa rừng và
    // thân cây che gần hết khung.
    id: 'dubois',
    durationMs: 6000,
    transitionIn: 'fade',
    // KHÔNG có lời dẫn: tên ông đã được nói ở cảnh `dead_land`, đây là lúc thấy
    // mặt người. Để khung hình thở một nhịp, người chơi vừa kịp ghép tên với
    // hình — thêm chữ vào đây là cướp mất chính cú trả bài đó.
    camera: {
      mode: 'dolly',
      from: [-89, 3.0, 65],
      to: [-96, 2.4, 70],
      lookAtFrom: [-110, 2, 80],
      fov: 40,
      fovTo: 36,
      ease: 'easeInOutCubic',
    },
  },
  {
    // Cảnh 3 — màn đen. Nhạc tắt, chỉ còn tiếng gió (Bước 4).
    id: 'disappearance',
    durationMs: 5400,
    transitionIn: 'fade',
    blackout: true,
    subtitle: {
      fr: 'Mais un jour, il est parti sans donner d’explication.',
      showAtMs: 800,
      hideAtMs: 5100,
    },
    camera: { mode: 'hold', position: [-117, 2.6, 75], lookAt: [-125, 2, 82], fov: 36 },
  },
  {
    // Cảnh 4 — cuộn bản đồ bay tới. Sân khấu đen tuyệt đối, đặt ngoài bản đồ
    // (y = 400) để trong khung hình không còn gì ngoài đạo cụ (dựng ở Bước 3).
    id: 'map_throw',
    durationMs: 2600,
    transitionIn: 'cut',
    stage: { background: '#000000' },
    camera: {
      mode: 'dolly',
      from: [0, 400, 0],
      to: [0, 400, -1.2],
      lookAtFrom: [0, 400, -12],
      fov: 50,
      ease: 'easeOutCubic',
    },
  },
  {
    // Cảnh 5 — cận cảnh bản đồ (lớp DOM, dựng ở Bước 3): các điểm đánh dấu chính
    // là những zone có thật, để người chơi vào game đã có sẵn bản đồ tinh thần.
    id: 'map_close',
    durationMs: 6000,
    transitionIn: 'dissolve',
    stage: { background: '#000000' },
    domOverlay: 'map-card',
    subtitle: {
      fr: 'Des lieux marqués. Un chemin. Aucune explication.',
      showAtMs: 900,
      hideAtMs: 5600,
    },
    camera: { mode: 'hold', position: [0, 400, -1.2], lookAt: [0, 400, -12], fov: 50 },
  },
  {
    // Cảnh 6 — Alex quyết định. Cung quay ~137° quanh Alex, hướng vào trong bản
    // đồ (xem ghi chú OrbitCamera trong types.ts về việc không quay đủ 360°).
    id: 'alex_decides',
    durationMs: 7000,
    transitionIn: 'fade',
    subtitle: {
      fr: 'Son élève, Alex, décide de suivre la carte pour le retrouver.',
      showAtMs: 900,
      hideAtMs: 6600,
    },
    camera: {
      mode: 'orbit',
      center: [ALEX_STAND[0], 1.3, ALEX_STAND[2]],
      radius: 9,
      radiusTo: 7.5,
      height: 3.4,
      heightTo: 2.4,
      fromAngle: 0.45,
      toAngle: 2.85,
      fov: 42,
      ease: 'easeInOutCubic',
    },
  },
  {
    // Cảnh 7 — cửa rừng. Nhìn từ mép Clairière d'arrivée theo lối mòn p1 vào
    // tường cây của Forêt claire. Sương (fogExp2 0.0085) lo phần còn lại.
    id: 'forest_gate',
    durationMs: 6500,
    transitionIn: 'fade',
    subtitle: {
      fr: 'Sa première destination est une forêt étrange…',
      showAtMs: 1000,
      hideAtMs: 6100,
    },
    camera: {
      mode: 'dolly',
      from: [-158, 2.6, -155],
      to: [-152, 2.2, -147],
      lookAtFrom: [-140, 4, -126],
      lookAtTo: [-138, 3.2, -122],
      fov: 44,
      fovTo: 40,
      ease: 'easeInOutCubic',
    },
  },
  {
    // Cảnh 8 — hero shot. Máy quay thấp phía sau Alex, tiến dần; fov hẹp nén
    // khoảng cách nên hàng cây phía trước dồn lại.
    //
    // Điểm nhìn NGẨNG DẦN lên (y: 2,2 → 9) để cuối cảnh khung hình mở ra trời
    // và bắt được mặt trời: phương vị của lối mòn p1 (hướng +X+Z) trùng đúng
    // phương vị mặt trời trong `SkyBackground.SUN_POSITION`, nên đây là khuôn
    // hình duy nhất trong cả intro nhìn thẳng vào mặt trời.
    id: 'hero',
    durationMs: 6000,
    transitionIn: 'dissolve',
    camera: {
      mode: 'dolly',
      from: [-173, 1.7, -168],
      to: [-168, 2.5, -163.5],
      lookAtFrom: [ALEX_STAND[0], 2.2, ALEX_STAND[2]],
      lookAtTo: [-150, 4.6, -148],
      fov: 38,
      fovTo: 44,
      ease: 'easeInOutCubic',
    },
  },
  {
    // Cảnh 9 — thẻ tiêu đề (lớp DOM ở Bước 4), rồi trả quyền điều khiển.
    id: 'title',
    durationMs: 3500,
    transitionIn: 'fade',
    blackout: true,
    domOverlay: 'title-card',
    camera: { mode: 'hold', position: [-168, 2.5, -163.5], lookAt: [-152, 4.5, -150], fov: 38 },
  },
];

export const CHAPTER1_INTRO_DURATION_MS = CHAPTER1_INTRO_SHOTS.reduce(
  (total, shot) => total + shot.durationMs,
  0,
);

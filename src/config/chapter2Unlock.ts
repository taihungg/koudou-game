import { WORLD_SPECIES } from '@/config/world/species';

/**
 * Điều kiện mở khoá Chương 2 — NGUỒN SỰ THẬT DUY NHẤT.
 *
 * Có ba chỗ hỏi câu "đã được vào Chương 2 chưa?" và chúng phải luôn trả lời
 * giống nhau:
 *   1. Nút « Chapitre 2 » ở màn hình chính (`src/app/page.tsx`)
 *   2. Rào chắn cổng làng trong 3D (`Village.tsx`)
 *   3. Prompt ở cổng làng (`VillageGateUI.tsx`)
 *
 * Nếu để mỗi nơi tự đọc cờ riêng thì sớm muộn chúng cũng lệch nhau: menu mở
 * mà cổng vẫn chặn, hoặc rào đã gỡ mà prompt vẫn báo khoá. Mọi thay đổi về
 * điều kiện chỉ sửa Ở ĐÂY.
 *
 * ĐIỀU KIỆN: tìm đủ TOÀN BỘ loài hoa trong catalogue **và** đạt tối thiểu 500
 * điểm tiếng Pháp. Hai điều kiện phải đồng thời thoả.
 */

/** Số điểm ngôn ngữ tối thiểu. */
export const CHAPTER2_MIN_XP = 500;

/** Số lượng loài tối thiểu cần khám phá để mở khoá vào làng (trên tổng số 59 loài). */
export const CHAPTER2_REQUIRED_SPECIES = 35;

/**
 * Catalogue = danh sách loài ĐẶT TAY trên bản đồ (`WORLD_SPECIES`), không phải
 * 59 bản ghi trong `learningEntities.json`.
 *
 * Phân biệt này quan trọng: file JSON là ngân hàng nội dung thẻ học, phần lớn
 * chưa được đặt ở đâu trên bản đồ cả. Lấy nó làm mẫu số thì điều kiện vĩnh
 * viễn không thể đạt. Mẫu số đúng là thứ Carnet de M. Dubois đang đếm — cùng
 * một danh sách, cùng một phép "đã tìm thấy" (xem `DuboisNotebookUI.tsx`), nên
 * người chơi nhìn carnet là biết còn thiếu bao nhiêu.
 */
export const CHAPTER2_SPECIES_IDS: string[] = [
  ...new Set(WORLD_SPECIES.map((sp) => sp.speciesId)),
];

/** Chỉ lấy đúng phần state mà điều kiện cần — tránh phụ thuộc vào cả GameState. */
export interface Chapter2Requirements {
  /** `xp_langage` trong `useGameStore`. */
  xpLangage: number;
  /** `completedExercises` trong `useLearningStore`. */
  completedExercises: string[];
}

export interface Chapter2Progress {
  speciesFound: number;
  speciesTotal: number;
  speciesDone: boolean;
  xp: number;
  xpRequired: number;
  xpDone: boolean;
  unlocked: boolean;
}

/**
 * Tiến độ chi tiết, không chỉ true/false — chỗ nào báo khoá cũng nên nói rõ
 * còn thiếu GÌ. "Chưa mở" mà không kèm lý do thì người chơi không biết phải
 * làm gì tiếp.
 *
 * Hàm trả về object MỚI mỗi lần gọi, nên đừng gọi thẳng trong selector của
 * Zustand (`useGameStore(s => chapter2Progress(...))`) — định danh đổi mỗi lần
 * render sẽ làm component re-render vô hạn. Lấy giá trị nguyên thuỷ ra khỏi
 * store trước, rồi bọc `useMemo` như các component hiện có đang làm.
 */
export function chapter2Progress(req: Chapter2Requirements): Chapter2Progress {
  const found = CHAPTER2_SPECIES_IDS.filter((id) =>
    req.completedExercises.includes(id),
  ).length;
  const target = Math.min(CHAPTER2_REQUIRED_SPECIES, CHAPTER2_SPECIES_IDS.length);
  const speciesDone = found >= target;
  const xpDone = req.xpLangage >= CHAPTER2_MIN_XP;

  return {
    speciesFound: found,
    speciesTotal: target,
    speciesDone,
    xp: req.xpLangage,
    xpRequired: CHAPTER2_MIN_XP,
    xpDone,
    unlocked: speciesDone && xpDone,
  };
}

export function isChapter2Unlocked(req: Chapter2Requirements): boolean {
  return chapter2Progress(req).unlocked;
}

/* ════════════════════════════════════════════════════════════════════════════
 * ⚠️  TẠM THỜI — MỞ CỔNG LÀNG ĐỂ TEST / QUAY DEMO
 *
 * Đặt `false` là mọi thứ trở lại điều kiện thật. Đây là công tắc DUY NHẤT,
 * không có chỗ nào khác bỏ qua điều kiện.
 *
 * Phạm vi ảnh hưởng CỐ Ý HẸP — chỉ cổng làng trong `/forest`:
 *   ✓ rào chắn ngang cổng biến mất, đi thẳng vào được
 *   ✓ prompt « ESPACE — Entrer dans le village » hiện ra
 *   ✗ nút « Chapitre 2 » ở màn hình chính VẪN KHOÁ
 *
 * Giữ menu khoá là có chủ đích, đúng theo yêu cầu: bản demo phải quay được
 * đúng mạch chơi thật — chơi Chương 1, đi theo lối mòn qua hai người dân, tới
 * cổng rồi bước vào Chương 2 — chứ không phải bấm thẳng từ màn hình bắt đầu.
 * ════════════════════════════════════════════════════════════════════════════ */
export const DEMO_UNLOCK_VILLAGE_GATE = true;

/**
 * Cổng làng trong `/forest` có mở hay không.
 *
 * Tách khỏi `isChapter2Unlocked` (menu chính vẫn dùng hàm kia) để công tắc
 * demo không vô tình mở luôn cả menu.
 */
export function isVillageGateOpen(req: Chapter2Requirements): boolean {
  return DEMO_UNLOCK_VILLAGE_GATE || isChapter2Unlocked(req);
}

export const CHAPTER2_LOCKED_TITLE = 'Village de Koudou';
export const CHAPTER2_LOCKED_MESSAGE =
  "Le portail est fermé. Le village n'ouvre ses portes qu'aux botanistes confirmés.";

/** Nhãn hiển thị khi đã mở khoá. */
export const CHAPTER2_ENTER_LABEL = 'Entrer dans le village';

import { create } from 'zustand';

/**
 * Trạng thái cutscene. KHÔNG persist — một cutscene đang chạy dở không được
 * phép sống lại sau khi tải lại trang (cùng lý do `useGameStore.partialize` loại
 * các cờ modal ra ngoài).
 *
 * Cờ "đã xem intro rồi" thì ngược lại, nằm ở `useGameStore.hasSeenChapter1Intro`
 * và CÓ persist — đó mới là thứ cần nhớ giữa các phiên chơi.
 */

export type CinematicPhase =
  /** Không có cutscene nào chạy — gameplay bình thường. */
  | 'idle'
  /** Camera đã vào vị trí cảnh đầu, đang chờ chunk/model nạp xong. Màn đen. */
  | 'preroll'
  /** Đang chiếu. */
  | 'playing'
  /** Cảnh cuối đã hết, đang bàn giao lại quyền điều khiển. */
  | 'ending';

interface CinematicState {
  phase: CinematicPhase;
  /** Chỉ số cảnh, phản chiếu từ vòng lặp `useFrame` ra cho lớp DOM. */
  shotIndex: number;

  /**
   * Chế độ dựng cảnh: `/forest?cine=<số cảnh>&cinet=<0..1>` ghim cutscene đứng
   * yên tại một cảnh, một thời điểm, bỏ luôn lớp phủ đen — để căn khuôn hình mà
   * không phải ngồi xem lại từ đầu mỗi lần chỉnh một toạ độ. Cùng tinh thần với
   * `?debug=1` của hệ thống world. `null` = chạy bình thường.
   */
  debugShot: number | null;
  debugProgress: number;

  start: () => void;
  setDebugShot: (index: number | null, progress?: number) => void;
  markReady: () => void;
  setShotIndex: (index: number) => void;
  beginEnding: () => void;
  finish: () => void;
}

export const useCinematicStore = create<CinematicState>()((set) => ({
  phase: 'idle',
  shotIndex: 0,
  debugShot: null,
  debugProgress: 0,

  start: () => set({ phase: 'preroll', shotIndex: 0 }),
  setDebugShot: (index, progress = 0) => set({ debugShot: index, debugProgress: progress }),
  markReady: () => set((state) => (state.phase === 'preroll' ? { phase: 'playing' } : state)),
  setShotIndex: (index) => set({ shotIndex: index }),
  beginEnding: () => set((state) => (state.phase === 'playing' ? { phase: 'ending' } : state)),
  finish: () => set({ phase: 'idle', shotIndex: 0 }),
}));

/**
 * Đồng hồ của cutscene — nguồn thời gian DUY NHẤT, do `useFrame` của
 * `CinematicCamera` cộng dồn. Lớp DOM (phụ đề, lớp phủ đen) đọc trực tiếp ở đây
 * trong vòng `requestAnimationFrame` của nó.
 *
 * Cố ý không đưa vào Zustand: nếu đẩy thời gian qua `set()` thì mỗi khung hình
 * sẽ re-render toàn bộ overlay. Đây là cùng pattern probe với `minimapProbe`
 * (`MinimapProbe.tsx`) và `cameraFocus` (`src/utils/cameraFocus.ts`).
 *
 * Chỉ có MỘT đồng hồ để phụ đề không bao giờ trôi lệch khỏi máy quay — hai vòng
 * lặp thời gian riêng (một trong Canvas, một trong DOM) chắc chắn sẽ lệch dần.
 */
export const cinematicClock = {
  shotIndex: 0,
  shotElapsedMs: 0,
  shotDurationMs: 1,
};

export function resetCinematicClock() {
  cinematicClock.shotIndex = 0;
  cinematicClock.shotElapsedMs = 0;
  cinematicClock.shotDurationMs = 1;
}

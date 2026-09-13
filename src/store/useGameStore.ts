import { create } from 'zustand';

import { persist } from 'zustand/middleware';

interface GameState {
  xp_langage: number;
  indice_biodiversite: number;
  lien_confiance: number;
  inventory: string[];
  isInteracting: boolean;
  currentChapter: number;
  isBotanicalBookOpen: boolean;
  /** Carnet de M. Dubois — checklist "X/Y loài đã tìm" theo từng zone (WORLD_SPECIES). */
  isDuboisNotebookOpen: boolean;
  hasSeenVillageIntro: boolean;
  /**
   * Đã xem cutscene mở màn Chương 1 chưa. Khác các cờ intro còn lại, cờ này CÓ
   * persist (xem `partialize` bên dưới): yêu cầu là intro chỉ chạy ở lần chơi
   * đầu tiên, không phải mỗi lần vào màn.
   */
  hasSeenChapter1Intro: boolean;
  /** Đã xem xong tutoriel hướng dẫn (contrôles, catalogue, boussole, mini-carte,
   * puis quête feu + villageois) chưa. Cùng ngoại lệ persist như
   * `hasSeenChapter1Intro` : ne doit s'afficher qu'une seule fois par joueur. */
  hasSeenChapter1Tutorial: boolean;
  /** Đã đủ điều kiện mở Chương 2 chưa. Điều kiện cụ thể sẽ được gắn vào chỗ
   * gọi `setChapter1Completed(true)` sau; store chỉ giữ cờ và chặn UI. */
  chapter1Completed: boolean;
  /** Vị trí nhân vật lúc rời khỏi mỗi thế giới (key = worldId, "forest" |
   * "village"), để reload/quay lại vào đúng chỗ đã dừng thay vì spawn mặc định.
   * Tách theo worldId vì hai thế giới dùng hệ toạ độ khác nhau. */
  playerPositions: Record<string, [number, number, number]>;

  setInteracting: (isInteracting: boolean) => void;
  addXP: (amount: number) => void;
  addBiodiversity: (amount: number) => void;
  addTrust: (amount: number) => void;
  addItem: (item: string) => void;
  setChapter: (chapter: number) => void;
  setBotanicalBookOpen: (isOpen: boolean) => void;
  setDuboisNotebookOpen: (isOpen: boolean) => void;
  setHasSeenVillageIntro: (seen: boolean) => void;
  setHasSeenChapter1Intro: (seen: boolean) => void;
  setHasSeenChapter1Tutorial: (seen: boolean) => void;
  setChapter1Completed: (completed: boolean) => void;
  setPlayerPosition: (worldId: string, position: [number, number, number]) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      xp_langage: 0,
      indice_biodiversite: 0,
      lien_confiance: 0,
      inventory: [],
      isInteracting: false,
      currentChapter: 1,
      isBotanicalBookOpen: false,
      isDuboisNotebookOpen: false,
      hasSeenVillageIntro: false,
      hasSeenChapter1Intro: false,
      hasSeenChapter1Tutorial: false,
      chapter1Completed: false,
      playerPositions: {},

      setInteracting: (isInteracting) => set({ isInteracting }),
      addXP: (amount) => set((state) => ({ xp_langage: Math.max(0, state.xp_langage + amount) })),
      addBiodiversity: (amount) => set((state) => ({ indice_biodiversite: Math.max(0, state.indice_biodiversite + amount) })),
      addTrust: (amount) => set((state) => ({ lien_confiance: Math.max(0, state.lien_confiance + amount) })),
      addItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
      setChapter: (chapter) => set({ currentChapter: chapter }),
      setBotanicalBookOpen: (isOpen) => set({ isBotanicalBookOpen: isOpen }),
      setDuboisNotebookOpen: (isOpen) => set({ isDuboisNotebookOpen: isOpen }),
      setHasSeenVillageIntro: (seen) => set({ hasSeenVillageIntro: seen }),
      setHasSeenChapter1Intro: (seen) => set({ hasSeenChapter1Intro: seen }),
      setHasSeenChapter1Tutorial: (seen) => set({ hasSeenChapter1Tutorial: seen }),
      setChapter1Completed: (completed) => set({ chapter1Completed: completed }),
      setPlayerPosition: (worldId, position) => set((state) => ({
        playerPositions: { ...state.playerPositions, [worldId]: position },
      })),
    }),
    {
      name: 'koudou-game-storage',
      // Cố ý KHÔNG persist `isInteracting`, `isBotanicalBookOpen` và các cờ modal:
      // không modal nào được sống lại từ localStorage.
      //
      // `hasSeenChapter1Intro` là ngoại lệ có chủ ý — nó không mở gì cả, nó CHẶN
      // một cutscene chỉ được chiếu một lần. Kẹt vĩnh viễn là không thể: cutscene
      // luôn có nút « Passer » và cờ chỉ được bật khi nó kết thúc.
      partialize: (state) => ({
        xp_langage: state.xp_langage,
        indice_biodiversite: state.indice_biodiversite,
        lien_confiance: state.lien_confiance,
        inventory: state.inventory,
        currentChapter: state.currentChapter,
        hasSeenChapter1Intro: state.hasSeenChapter1Intro,
        hasSeenChapter1Tutorial: state.hasSeenChapter1Tutorial,
        chapter1Completed: state.chapter1Completed,
        playerPositions: state.playerPositions,
      }),
    }
  )
);

import { create } from 'zustand';

/**
 * Alex có đang đứng trong tầm cổng Village de Koudou hay không.
 *
 * KHÔNG persist: giống `useVillagersDialogueStore`, đây là trạng thái vị trí
 * tức thời, sống lại từ localStorage thì prompt "ESPACE" sẽ hiện ra ngay khi
 * vào màn dù người chơi đang đứng ở đầu kia bản đồ.
 *
 * Cờ mở khoá KHÔNG nằm ở đây — nó đọc từ `useGameStore` qua
 * `isChapter2Unlocked()` (`src/config/chapter2Unlock.ts`), để menu chính và
 * cổng làng không bao giờ lệch nhau.
 */
interface VillageGateState {
  nearby: boolean;
  setNearby: (nearby: boolean) => void;
}

export const useVillageGateStore = create<VillageGateState>((set) => ({
  nearby: false,
  setNearby: (nearby) => set({ nearby }),
}));

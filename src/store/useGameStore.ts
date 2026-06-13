import { create } from 'zustand';

interface GameState {
  xp_langage: number;
  indice_biodiversite: number;
  lien_confiance: number;
  inventory: string[];
  isInteracting: boolean;
  currentChapter: number;
  isBotanicalBookOpen: boolean;
  hasSeenVillageIntro: boolean;
  
  setInteracting: (isInteracting: boolean) => void;
  addXP: (amount: number) => void;
  addBiodiversity: (amount: number) => void;
  addTrust: (amount: number) => void;
  addItem: (item: string) => void;
  setChapter: (chapter: number) => void;
  setBotanicalBookOpen: (isOpen: boolean) => void;
  setHasSeenVillageIntro: (seen: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  xp_langage: 0,
  indice_biodiversite: 0,
  lien_confiance: 0,
  inventory: [],
  isInteracting: false,
  currentChapter: 1,
  isBotanicalBookOpen: false,
  hasSeenVillageIntro: false,

  setInteracting: (isInteracting) => set({ isInteracting }),
  addXP: (amount) => set((state) => ({ xp_langage: state.xp_langage + amount })),
  addBiodiversity: (amount) => set((state) => ({ indice_biodiversite: state.indice_biodiversite + amount })),
  addTrust: (amount) => set((state) => ({ lien_confiance: state.lien_confiance + amount })),
  addItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  setChapter: (chapter) => set({ currentChapter: chapter }),
  setBotanicalBookOpen: (isOpen) => set({ isBotanicalBookOpen: isOpen }),
  setHasSeenVillageIntro: (seen) => set({ hasSeenVillageIntro: seen }),
}));

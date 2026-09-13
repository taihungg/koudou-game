import { create } from 'zustand';

interface VillagersDialogueState {
  /** Alex est dans le rayon d'écoute des deux habitants de `human_traces`. */
  nearby: boolean;
  isOpen: boolean;
  setNearby: (nearby: boolean) => void;
  open: () => void;
  close: () => void;
}

export const useVillagersDialogueStore = create<VillagersDialogueState>((set) => ({
  nearby: false,
  isOpen: false,
  setNearby: (nearby) => set({ nearby }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

import { create } from 'zustand';

/**
 * Rencontre avec le chef du village — Chapitre 2.
 *
 * NON persisté, comme `useVillagersDialogueStore` : `nearby` est une donnée de
 * position instantanée, et la ressusciter depuis localStorage afficherait le
 * prompt « ESPACE » dès le chargement de la carte, même à l'autre bout du
 * village.
 *
 * La progression, elle, est persistée ailleurs : `CHIEF_EXERCISE_ID` dans
 * `useLearningStore.completedExercises`.
 */
interface ChiefDialogueState {
  nearby: boolean;
  isOpen: boolean;
  setNearby: (nearby: boolean) => void;
  open: () => void;
  close: () => void;
}

export const useChiefDialogueStore = create<ChiefDialogueState>((set) => ({
  nearby: false,
  isOpen: false,
  setNearby: (nearby) => set({ nearby }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

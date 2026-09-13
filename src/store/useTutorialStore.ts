import { create } from 'zustand';

/**
 * État du tutoriel de découverte de Chapitre 1 (contrôles → catalogue →
 * boussole → mini-carte → chercher une plante → quête incendie → villageois).
 * Non persisté : seul `useGameStore.hasSeenChapter1Tutorial` retient "déjà vu"
 * entre les sessions, ici on ne garde que la progression de la séance en cours.
 */
interface TutorialState {
  active: boolean;
  stepIndex: number;

  start: () => void;
  advance: () => void;
  finish: () => void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  active: false,
  stepIndex: 0,

  start: () => set({ active: true, stepIndex: 0 }),
  advance: () => set({ stepIndex: get().stepIndex + 1 }),
  finish: () => set({ active: false }),
}));

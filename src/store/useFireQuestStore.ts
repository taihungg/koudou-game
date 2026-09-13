import { create } from 'zustand';
import { FIRE_QUEST_SCENE } from '@/config/world/chapter1';

const TREE_COUNT = FIRE_QUEST_SCENE.trees.length;

/**
 * Déroulé de la quête incendie :
 *
 *   idle → intro (boîte de dialogue en bas) → fighting (le joueur court
 *   remplir le seau et verse l'eau, un aller-retour par arbre) → doused
 *   ("Alex éteint le feu") → burned (💬 la brûlure) → matching (exercice
 *   d'association) → done.
 *
 * `pending_care` est la porte de sortie : fermer l'exercice n'annule pas la
 * quête, il rend la main au joueur et l'exercice se rouvre en revenant près
 * des arbres. Sans ça, une fermeture accidentelle perdrait définitivement le
 * contenu pédagogique de la quête.
 */
export type FireQuestPhase =
  | 'idle'
  | 'intro'
  | 'fighting'
  | 'doused'
  | 'burned'
  | 'matching'
  | 'pending_care'
  | 'done';

interface FireQuestState {
  phase: FireQuestPhase;
  /** Ligne de dialogue courante pendant `intro`. */
  introStep: number;
  /** Un booléen par arbre de `FIRE_QUEST_SCENE.trees`. */
  extinguished: boolean[];
  /** Alex porte un seau plein. */
  hasWater: boolean;

  /** Sondes de proximité écrites par `FireQuestScene`. */
  nearFire: boolean;
  nearWater: boolean;
  nearTree: number | null;

  discover: () => void;
  nextIntroLine: () => void;
  /** « Passer » : éteint tout et saute directement à la réplique de la brûlure. */
  skipToBurn: () => void;
  /** Quête déjà validée dans une session précédente : feu éteint, rien à jouer. */
  restoreCompleted: () => void;
  fillBucket: () => void;
  douseTree: (index: number) => void;
  setPhase: (phase: FireQuestPhase) => void;

  setNearFire: (near: boolean) => void;
  setNearWater: (near: boolean) => void;
  setNearTree: (index: number | null) => void;
}

export const useFireQuestStore = create<FireQuestState>((set, get) => ({
  phase: 'idle',
  introStep: 0,
  extinguished: Array(TREE_COUNT).fill(false),
  hasWater: false,
  nearFire: false,
  nearWater: false,
  nearTree: null,

  discover: () => {
    if (get().phase !== 'idle') return;
    set({ phase: 'intro', introStep: 0 });
  },

  nextIntroLine: () => set((state) => ({ introStep: state.introStep + 1 })),

  skipToBurn: () =>
    set({
      phase: 'burned',
      hasWater: false,
      extinguished: Array(TREE_COUNT).fill(true),
    }),

  restoreCompleted: () =>
    set({
      phase: 'done',
      hasWater: false,
      extinguished: Array(TREE_COUNT).fill(true),
    }),

  fillBucket: () => set({ hasWater: true }),

  douseTree: (index) => {
    const state = get();
    if (!state.hasWater || state.extinguished[index]) return;

    const extinguished = state.extinguished.map((out, i) => out || i === index);
    const allOut = extinguished.every(Boolean);
    set({
      extinguished,
      hasWater: false,
      // La suite du récit s'enchaîne toute seule dès le dernier arbre éteint.
      phase: allOut ? 'doused' : state.phase,
    });
  },

  setPhase: (phase) => set({ phase }),

  setNearFire: (nearFire) => set({ nearFire }),
  setNearWater: (nearWater) => set({ nearWater }),
  setNearTree: (nearTree) => set({ nearTree }),
}));

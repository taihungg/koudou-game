/**
 * Contenu de l'exercice d'écoute à trous (dictée) déclenché en écoutant en
 * secret les deux habitants de `human_traces` (voir
 * `src/config/world/chapter1.ts` → `VILLAGER_DIALOGUE_SCENE`). Contenu narratif
 * en code, pas en JSON — même convention que `kofiDialogue` dans
 * `useDialogueStore.ts`.
 */

export const VILLAGER_LISTENING_AUDIO = "/audio/dialogue_1.wav";

/** Clé stable dans `useLearningStore.completedExercises` pour ne créditer l'XP qu'une fois. */
export const VILLAGER_LISTENING_EXERCISE_ID = "human_traces_villagers_cloze";

export type ClozeSegment =
  | { type: "text"; content: string }
  | { type: "blank"; index: number };

export const VILLAGER_CLOZE_SEGMENTS: ClozeSegment[] = [
  { type: "text", content: "Hier, après une forte pluie, les habitants ont remarqué beaucoup de " },
  { type: "blank", index: 0 },
  {
    type: "text",
    content:
      " sur la route. La terre était descendue de la montagne. Une personne explique que, lorsqu'elle était enfant, il y avait davantage d'arbres dans la forêt. Les racines des arbres retenaient la terre et empêchaient l'eau de descendre trop vite. Mais cette année, plusieurs personnes ont ",
  },
  { type: "blank", index: 1 },
  {
    type: "text",
    content:
      " beaucoup d'arbres. Aujourd'hui, l'eau arrive donc plus rapidement dans le village et la rivière monte vite après la pluie. Heureusement, personne n'a été ",
  },
  { type: "blank", index: 2 },
  { type: "text", content: ", mais la situation devient inquiétante. Les habitants ont eu de la " },
  { type: "blank", index: 3 },
  { type: "text", content: " et pensent que le problème risque de devenir plus " },
  { type: "blank", index: 4 },
  { type: "text", content: "." },
];

/** Réponses correctes, dans l'ordre des blancs 0 à 4. */
export const VILLAGER_CLOZE_ANSWERS = ["boue", "coupé", "blessé", "chance", "grave"];

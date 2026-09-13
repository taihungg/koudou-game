/**
 * Contenu de la quête "incendie en forêt", déclenchée en s'approchant du feu
 * de `FIRE_QUEST_SCENE` (voir `src/config/world/chapter1.ts`). Contenu
 * narratif en code, pas en JSON — même convention que `kofiDialogue`
 * (`useDialogueStore.ts`) et `villagerListeningExercise.ts`.
 */

/** Clé stable dans `useLearningStore.completedExercises` pour ne créditer l'XP qu'une fois. */
export const FIRE_QUEST_EXERCISE_ID = "fire_quest_burn_remedy";

export const FIRE_QUEST_BANNER =
  "Vous êtes dans la forêt et vous découvrez un incendie. Sauvez le plus grand nombre de plantes possible !";

export const FIRE_QUEST_BUBBLE =
  "Oh non ! Je me suis brûlé ! J'ai besoin de trouver une plante qui pourrait soulager la brûlure. Je pense à trois plantes… Mais laquelle pourrait m'aider ?";

export interface FireQuestLine {
  speaker: string;
  text: string;
}

/** Répliques affichées à la découverte de l'incendie, avant de rendre la main. */
export const FIRE_QUEST_INTRO_LINES: FireQuestLine[] = [
  { speaker: "Quête", text: FIRE_QUEST_BANNER },
  {
    speaker: "Alex",
    text:
      "La rivière est juste au nord. Je remplis mon seau, je reviens, et je verse l'eau sur chaque arbre en flammes. Un seau par arbre !",
  },
];

/** Une fois le dernier arbre éteint. */
export const FIRE_QUEST_DOUSED_LINE: FireQuestLine = {
  speaker: "Quête",
  text: "Alex éteint le feu.",
};

/** La brûlure — c'est la réplique qui amène l'exercice d'association. */
export const FIRE_QUEST_BURNED_LINE: FireQuestLine = {
  speaker: "Alex",
  text: FIRE_QUEST_BUBBLE,
};

/** Suivi d'objectif affiché pendant la phase de jeu. */
export const FIRE_QUEST_OBJECTIVE_FILL = "Va puiser de l'eau à la rivière";
export const FIRE_QUEST_OBJECTIVE_POUR = "Verse l'eau sur un arbre en flammes";
export const FIRE_QUEST_OBJECTIVE_CARE = "Alex s'est brûlé — approche-toi pour l'aider";

/** Libellés des invites « ESPACE ». */
export const FIRE_QUEST_PROMPT_FILL = "Puiser de l'eau";
export const FIRE_QUEST_PROMPT_POUR = "Verser l'eau";
export const FIRE_QUEST_PROMPT_CARE = "Aider Alex";

export const FIRE_QUEST_MATCHING_PROMPT =
  "Associez chaque plante à son utilisation pour découvrir laquelle pourrait soulager la brûlure d'Alex !";

export interface FireQuestPlant {
  id: string;
  name: string;
  emoji: string;
  usage: string;
  isBurnRemedy: boolean;
}

/** Trois plantes à associer — une seule apaise vraiment les brûlures. */
export const FIRE_QUEST_PLANTS: FireQuestPlant[] = [
  {
    id: "aloe",
    name: "Aloès",
    emoji: "🌵",
    usage: "Calme et hydrate la peau abîmée par la chaleur.",
    isBurnRemedy: true,
  },
  {
    id: "quinquina",
    name: "Quinquina",
    emoji: "🌿",
    usage: "Fait baisser la fièvre.",
    isBurnRemedy: false,
  },
  {
    id: "plantain",
    name: "Plantain",
    emoji: "🍃",
    usage: "Referme les petites plaies et coupures.",
    isBurnRemedy: false,
  },
];

export const FIRE_QUEST_REVEAL =
  "C'est l'Aloès qui peut soulager la brûlure d'Alex ! Son gel rafraîchissant calme la peau échauffée.";

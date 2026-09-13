/**
 * Contenu de la rencontre avec le chef du village — première scène du
 * Chapitre 2 (`/village`). Contenu narratif en code, pas en JSON : même
 * convention que `villagerListeningExercise.ts` et `kofiDialogue`.
 *
 * ── Mécanique ────────────────────────────────────────────────────────────
 * Ce n'est PAS un QCM de compréhension habituel. Le chef parle (audio), et les
 * trois propositions sont des QUESTIONS, pas des réponses : Alex doit choisir
 * la question la plus pertinente à poser ensuite. L'exercice évalue donc la
 * capacité à relancer une conversation — compétence B1 « interaction orale » —
 * et pas seulement à repérer un mot dans l'enregistrement.
 *
 * Les deux distracteurs de chaque item suivent le même schéma volontaire :
 *   - une question hors sujet mais plausible (bon lexique, mauvais angle)
 *   - une question fermée / factuelle qui bloquerait la conversation
 * La bonne réponse est toujours la question OUVERTE qui fait avancer le récit.
 *
 * ── Position de la bonne réponse ─────────────────────────────────────────
 * Dans le brief d'origine, la bonne réponse était en A pour 4 items sur 5.
 * L'ordre d'affichage a été varié ici (indices 1, 2, 0, 2, 1) sans toucher au
 * texte : sinon le joueur obtient 100 % en cliquant toujours la première ligne,
 * sans écouter une seule seconde d'audio — ce qui vide l'exercice de son sens
 * dans un jeu dont l'écoute est l'objet même. La lettre d'origine est notée en
 * commentaire sur chaque item.
 */

/** Clé stable dans `useLearningStore.completedExercises` — l'XP n'est créditée qu'une fois. */
export const CHIEF_EXERCISE_ID = 'village_chief_listening';

/**
 * `public/audio/monologue-1.wav` … `monologue-5.wav` — TIRET, pas tiret bas.
 * (Le reste du dossier utilise le tiret bas, `dialogue_1.wav` ; ces cinq
 * fichiers-là sont nommés avec un tiret, c'est voulu.)
 *
 * Seul endroit du code qui construit ce chemin : si la convention change, un
 * seul point à modifier.
 */
export const chiefAudioPath = (index: number): string => `/audio/monologue-${index + 1}.wav`;

export interface ChiefQuestion {
  id: string;
  /** Ce qu'Alex vient d'entendre, en une ligne — repère visuel pendant l'écoute. */
  context: string;
  options: string[];
  correctAnswer: number;
  feedbackSuccess: string;
  feedbackFail: string;
}

export const CHIEF_QUESTIONS: ChiefQuestion[] = [
  {
    id: 'chief_q1',
    context: 'Le chef évoque les changements récents autour du village.',
    options: [
      'Est-ce que les habitants aiment encore vivre dans ce village ?',
      // Bonne réponse — A dans le brief d'origine.
      'Qu’est-ce qui explique tous ces changements dans l’environnement du village ?',
      'Combien d’animaux peut-on voir dans la forêt aujourd’hui ?',
    ],
    correctAnswer: 1,
    feedbackSuccess: 'Bien vu : une question ouverte qui demande une explication, pas un simple chiffre.',
    feedbackFail: 'Pas tout à fait. Cherche la question qui demande une EXPLICATION des changements.',
  },
  {
    id: 'chief_q2',
    context: 'Le chef parle des ressources que le village n’arrive plus à trouver.',
    options: [
      'Depuis combien d’années les habitants vivent-ils dans ce village ?',
      'Pourquoi les habitants doivent-ils aller de plus en plus loin pour trouver ces ressources ?',
      // Bonne réponse — B dans le brief d'origine.
      'Quelles ressources naturelles sont devenues plus difficiles à trouver ?',
    ],
    correctAnswer: 2,
    feedbackSuccess: 'Exact : il faut d’abord savoir DE QUELLES ressources on parle.',
    feedbackFail: 'Pas encore. Avant de demander pourquoi, demande de quelles ressources il s’agit.',
  },
  {
    id: 'chief_q3',
    context: 'Le chef décrit l’état de la rivière qui traverse le village.',
    options: [
      // Bonne réponse — A dans le brief d'origine.
      'Quelles conséquences la pollution de la rivière a-t-elle sur les habitants et les poissons ?',
      'Pourquoi les habitants ne veulent-ils plus utiliser l’eau de la rivière ?',
      'Est-ce que les poissons vivent seulement dans cette rivière ?',
    ],
    correctAnswer: 0,
    feedbackSuccess: 'Oui : tu demandes les conséquences, pour les gens ET pour le milieu naturel.',
    feedbackFail: 'Relis les propositions : une seule porte sur les CONSÉQUENCES de la pollution.',
  },
  {
    id: 'chief_q4',
    context: 'Le chef remarque que certains animaux ont quitté la région.',
    options: [
      'Quels animaux les villageois voient-ils tous les matins ?',
      'Pourquoi les habitants préfèrent-ils vivre loin des animaux ?',
      // Bonne réponse — A dans le brief d'origine.
      'Comment la disparition de la végétation peut-elle expliquer le départ de certains animaux ?',
    ],
    correctAnswer: 2,
    feedbackSuccess: 'Parfait : tu relies deux faits entre eux, la végétation et les animaux.',
    feedbackFail: 'Pas tout à fait. Cherche la question qui fait un LIEN entre la végétation et les animaux.',
  },
  {
    id: 'chief_q5',
    context: 'Le chef résume la situation générale du village.',
    options: [
      'Est-ce que les habitants ont toujours utilisé beaucoup de bois ?',
      // Bonne réponse — A dans le brief d'origine.
      'Si tous ces problèmes sont liés, quelles conséquences peuvent-ils avoir sur la vie du village ?',
      'Quand est-ce que la forêt a commencé à exister ?',
    ],
    correctAnswer: 1,
    feedbackSuccess: 'Excellent : tu rassembles tous les problèmes pour poser la vraie question.',
    feedbackFail: 'Presque. La bonne question relie TOUS les problèmes à l’avenir du village.',
  },
];

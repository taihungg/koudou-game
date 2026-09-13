import { FIRE_QUEST_SCENE, VILLAGER_DIALOGUE_SCENE } from '@/config/world/chapter1';

/**
 * Où pointe la flèche du tutoriel pour une étape donnée :
 *  - `none`            : pas de flèche, juste le texte.
 *  - `screen`           : coin fixe de l'écran (pour montrer un élément de HUD).
 *  - `world`            : coordonnées (x, z) du monde, la flèche suit le joueur.
 *  - `nearest-species`  : la plante non identifiée la plus proche — cible mouvante,
 *                          calculée en direct par `TutorialUI` (même logique que
 *                          `CompassHUD`), pas fixée ici.
 */
export type TutorialArrowSpec =
  | { type: 'none' }
  | { type: 'screen'; corner: 'top' | 'top-right' | 'bottom-right' }
  | { type: 'world'; target: [number, number] }
  | { type: 'nearest-species' };

export type TutorialAdvanceMode =
  | 'button'
  | 'nearby-entity'
  | 'fire-quest-done'
  | 'villagers-nearby';

export interface TutorialStep {
  id: string;
  title: string;
  text: string;
  arrow: TutorialArrowSpec;
  advance: TutorialAdvanceMode;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'controls',
    title: 'Se déplacer',
    text: "Flèches ou WASD pour marcher, Q pour courir, E pour sauter, F pour observer une espèce de plus près, Espace pour interagir.",
    arrow: { type: 'none' },
    advance: 'button',
  },
  {
    id: 'catalogue',
    title: 'Vos carnets',
    text: "En haut de l'écran : le Livre de botanique (espèces déjà identifiées) et le Carnet de M. Dubois (espèces encore à trouver). Ouvrez-les à tout moment.",
    arrow: { type: 'screen', corner: 'top' },
    advance: 'button',
  },
  {
    id: 'compass',
    title: 'La boussole',
    text: "En haut à droite, la boussole indique toujours la direction et la distance de la plante non identifiée la plus proche.",
    arrow: { type: 'screen', corner: 'top-right' },
    advance: 'button',
  },
  {
    id: 'minimap',
    title: 'La mini-carte',
    text: "En bas à droite, la mini-carte montre votre position et les espèces qu'il reste à découvrir (points jaunes).",
    arrow: { type: 'screen', corner: 'bottom-right' },
    advance: 'button',
  },
  {
    id: 'find-plant',
    title: 'À vous de jouer',
    text: "Suivez la boussole et partez à la recherche d'une plante à identifier.",
    arrow: { type: 'nearest-species' },
    advance: 'nearby-entity',
  },
  {
    id: 'fire-quest',
    title: 'Un incendie !',
    text: "Une fumée s'élève au loin... un feu de forêt fait rage ! Allez l'éteindre.",
    arrow: { type: 'world', target: FIRE_QUEST_SCENE.center },
    advance: 'fire-quest-done',
  },
  {
    id: 'villagers',
    title: 'Des voix dans la forêt',
    text: "Des habitants discutent un peu plus loin. Approchez-vous discrètement pour écouter leur conversation.",
    arrow: { type: 'world', target: VILLAGER_DIALOGUE_SCENE.sensor.position },
    advance: 'villagers-nearby',
  },
  {
    id: 'done',
    title: 'Bonne exploration',
    text: "Vous connaissez l'essentiel. Explorez la forêt, identifiez les plantes et percez les mystères de Koudou.",
    arrow: { type: 'none' },
    advance: 'button',
  },
];

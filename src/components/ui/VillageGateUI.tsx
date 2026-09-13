"use client";

import { useMemo } from "react";
import { Lock } from "lucide-react";
import {
  CHAPTER2_LOCKED_MESSAGE,
  CHAPTER2_LOCKED_TITLE,
  chapter2Progress,
  isVillageGateOpen,
} from "@/config/chapter2Unlock";
import { useGameStore } from "@/store/useGameStore";
import { useLearningStore } from "@/store/useLearningStore";
import { useVillageGateStore } from "@/store/useVillageGateStore";

/**
 * Panneau « portail fermé » du Village de Koudou.
 *
 * Il n'y a PAS de changement de scène : le village est un quartier de la carte
 * du Chapitre 1, pas une route séparée. Donc ce composant n'ouvre plus rien et
 * ne navigue nulle part — on entre au village en marchant, tout simplement.
 *
 * Il ne reste qu'un seul rôle : expliquer pourquoi ça ne passe pas quand le
 * portail est encore fermé. Le blocage lui-même est physique et visible (la
 * palissade barre l'ouverture — voir `GateBarrier` dans `Village.tsx`) ; ce
 * texte dit seulement ce qu'il manque pour l'ouvrir.
 *
 * Portail ouvert → ce composant ne rend rien du tout, pour ne pas coller un
 * encart à l'écran chaque fois que le joueur traverse le portail.
 */
export default function VillageGateUI() {
  const nearby = useVillageGateStore((s) => s.nearby);
  const xpLangage = useGameStore((s) => s.xp_langage);
  const completedExercises = useLearningStore((s) => s.completedExercises);

  // `useMemo` obligatoire : `chapter2Progress` construit un objet neuf à chaque
  // appel, l'utiliser tel quel dans un sélecteur bouclerait le rendu.
  const progress = useMemo(
    () => chapter2Progress({ xpLangage, completedExercises }),
    [xpLangage, completedExercises],
  );
  // Le portail suit `isVillageGateOpen`, pas `progress.unlocked` : l'interrupteur
  // de démo n'ouvre QUE le portail, jamais le menu principal.
  const open = isVillageGateOpen({ xpLangage, completedExercises });

  if (!nearby || open) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] pointer-events-none">
      <div className="bg-neutral-900/85 border-2 border-neutral-500/50 text-neutral-200 px-6 py-3 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.4)] backdrop-blur-sm flex items-center gap-3 font-story max-w-md">
        <Lock className="w-6 h-6 shrink-0 text-neutral-400" />
        <span className="leading-snug">
          <strong className="block text-neutral-100">{CHAPTER2_LOCKED_TITLE}</strong>
          <span className="block text-sm text-neutral-300/90 font-sans">
            {CHAPTER2_LOCKED_MESSAGE}
          </span>
          {/* Ce qui manque, chiffré. Un cadenas sans condition lisible laisse
              le joueur bloqué sans savoir quoi faire. */}
          <span className="mt-1 flex flex-wrap gap-x-4 text-sm font-sans">
            <span className={progress.speciesDone ? "text-emerald-400" : "text-amber-300"}>
              Catalogue : {progress.speciesFound}/{progress.speciesTotal}
            </span>
            <span className={progress.xpDone ? "text-emerald-400" : "text-amber-300"}>
              Français : {progress.xp}/{progress.xpRequired} XP
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}

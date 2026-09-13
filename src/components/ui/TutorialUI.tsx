"use client";

import { useEffect, useRef } from "react";
import { TUTORIAL_STEPS } from "@/config/tutorialSteps";
import { useTutorialStore } from "@/store/useTutorialStore";
import { useGameStore } from "@/store/useGameStore";
import { useCinematicStore } from "@/store/useCinematicStore";
import { useLearningStore } from "@/store/useLearningStore";
import { useFireQuestStore } from "@/store/useFireQuestStore";
import { useVillagersDialogueStore } from "@/store/useVillagersDialogueStore";
import { entityRadar, playerRadar } from "@/components/game/world/CompassRadar";
import { isoBearingDeg } from "@/utils/isoBearing";

/**
 * Tutoriel de découverte de Chapitre 1 : une bannière de texte en bas d'écran
 * + une flèche qui indique où aller, étape par étape (voir
 * `src/config/tutorialSteps.ts`). Ne se joue qu'une fois par joueur — cf.
 * `useGameStore.hasSeenChapter1Tutorial`, même exception de persistance que
 * `hasSeenChapter1Intro`.
 *
 * La flèche ne passe jamais par React state par frame : pour les cibles
 * "monde" (feu, villageois, plante la plus proche) l'angle est recalculé en
 * `requestAnimationFrame` et écrit directement dans le style, comme
 * `CompassHUD`/`Minimap`.
 */

/** Rotation fixe (deg, 0 = haut, horaire) pour les étapes qui montrent un
 *  élément du HUD plutôt qu'un point du monde. */
const SCREEN_CORNER_DEG: Record<"top" | "top-right" | "bottom-right", number> = {
  top: 0,
  "top-right": 45,
  "bottom-right": 135,
};

export default function TutorialUI() {
  const active = useTutorialStore((s) => s.active);
  const stepIndex = useTutorialStore((s) => s.stepIndex);
  const startTutorial = useTutorialStore((s) => s.start);
  const advanceTutorial = useTutorialStore((s) => s.advance);
  const finishTutorial = useTutorialStore((s) => s.finish);

  const hasSeenIntro = useGameStore((s) => s.hasSeenChapter1Intro);
  const hasSeenTutorial = useGameStore((s) => s.hasSeenChapter1Tutorial);
  const setHasSeenTutorial = useGameStore((s) => s.setHasSeenChapter1Tutorial);
  const isInteracting = useGameStore((s) => s.isInteracting);
  const cinematicPhase = useCinematicStore((s) => s.phase);

  const nearbyEntity = useLearningStore((s) => s.nearbyEntity);
  const fireQuestPhase = useFireQuestStore((s) => s.phase);
  const villagersNearby = useVillagersDialogueStore((s) => s.nearby);

  const arrowRef = useRef<HTMLDivElement>(null);
  const step = TUTORIAL_STEPS[stepIndex];

  // Démarre une seule fois, une fois le joueur rendu à la main (cutscene finie
  // ou déjà vue lors d'une session précédente).
  useEffect(() => {
    if (hasSeenTutorial || hasSeenIntro !== true || cinematicPhase !== "idle") return;
    startTutorial();
  }, [hasSeenIntro, hasSeenTutorial, cinematicPhase, startTutorial]);

  const closeForGood = () => {
    setHasSeenTutorial(true);
    finishTutorial();
  };

  const goNext = () => {
    if (stepIndex >= TUTORIAL_STEPS.length - 1) {
      closeForGood();
      return;
    }
    advanceTutorial();
  };

  // Avancement automatique des étapes "aller quelque part" — pas de bouton,
  // la flèche disparaît d'elle-même dès que l'objectif est atteint. Passe par
  // `getState()` pour ne dépendre que des valeurs qui déclenchent réellement
  // l'avancement, pas des actions/fonctions locales.
  useEffect(() => {
    if (!active || !step) return;
    const reached =
      (step.advance === "nearby-entity" && Boolean(nearbyEntity)) ||
      (step.advance === "fire-quest-done" && fireQuestPhase === "done") ||
      (step.advance === "villagers-nearby" && villagersNearby);
    if (!reached) return;

    if (useTutorialStore.getState().stepIndex >= TUTORIAL_STEPS.length - 1) {
      useGameStore.getState().setHasSeenChapter1Tutorial(true);
      useTutorialStore.getState().finish();
    } else {
      useTutorialStore.getState().advance();
    }
  }, [active, step, nearbyEntity, fireQuestPhase, villagersNearby]);

  // Flèche : rotation fixe pour les cibles écran, recalculée en continu pour
  // les cibles monde (le joueur se déplace).
  useEffect(() => {
    if (!active || !step || step.arrow.type === "none") return;

    if (step.arrow.type === "screen") {
      if (arrowRef.current) {
        arrowRef.current.style.transform = `rotate(${SCREEN_CORNER_DEG[step.arrow.corner]}deg)`;
      }
      return;
    }

    let raf = 0;
    const tick = () => {
      const px = playerRadar.x;
      const pz = playerRadar.z;
      let targetX: number | null = null;
      let targetZ: number | null = null;

      if (step.arrow.type === "world") {
        [targetX, targetZ] = step.arrow.target;
      } else {
        // nearest-species : même recherche que CompassHUD, faite ici en
        // direct pour ne pas dépendre du composant boussole.
        const completed = useLearningStore.getState().completedExercises;
        let nearestDist = Infinity;
        entityRadar.forEach((entry) => {
          if (completed.includes(entry.speciesId)) return;
          const dist = Math.hypot(entry.x - px, entry.z - pz);
          if (dist < nearestDist) {
            nearestDist = dist;
            targetX = entry.x;
            targetZ = entry.z;
          }
        });
      }

      if (arrowRef.current && targetX !== null && targetZ !== null) {
        const angleDeg = isoBearingDeg(targetX - px, targetZ - pz);
        arrowRef.current.style.transform = `rotate(${angleDeg}deg)`;
        arrowRef.current.style.visibility = "visible";
      } else if (arrowRef.current) {
        arrowRef.current.style.visibility = "hidden";
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, step]);

  // Masqué pendant les cutscenes, les cartes/dialogues (l'un d'eux se
  // superposerait sinon à la bannière), et une fois le tutoriel terminé.
  if (!active || !step || isInteracting) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-[95] flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-xl bg-emerald-950/90 border-4 border-emerald-600/80 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md pointer-events-auto font-story">
        <div className="flex items-start gap-4 px-5 py-4">
          {step.arrow.type !== "none" && (
            <div className="shrink-0 h-10 w-10 mt-0.5">
              <div ref={arrowRef} className="h-10 w-10 transition-transform duration-200 ease-out">
                <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]">
                  <path d="M12 2 L20 20 L12 15.5 L4 20 Z" fill="#34d399" stroke="#065f46" strokeWidth="1" />
                </svg>
              </div>
            </div>
          )}

          <div className="flex-1">
            <div className="text-[0.7rem] uppercase tracking-[0.2em] font-bold text-emerald-300">
              {step.title}
            </div>
            <p className="text-amber-50 text-base leading-relaxed mt-1">{step.text}</p>
          </div>
        </div>

        <div className="px-5 pb-4 flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={closeForGood}
            className="text-xs text-emerald-200/60 hover:text-emerald-100 transition-colors cursor-pointer"
          >
            Passer le tutoriel
          </button>

          {step.advance === "button" && (
            <button
              type="button"
              onClick={goNext}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-emerald-950 font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              {stepIndex >= TUTORIAL_STEPS.length - 1 ? "Terminer" : "Suivant"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

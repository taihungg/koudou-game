"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useFireQuestStore } from "@/store/useFireQuestStore";
import { useGameStore } from "@/store/useGameStore";
import { useLearningStore } from "@/store/useLearningStore";
import { FIRE_QUEST_SCENE } from "@/config/world/chapter1";
import {
  FIRE_QUEST_BURNED_LINE,
  FIRE_QUEST_DOUSED_LINE,
  FIRE_QUEST_EXERCISE_ID,
  FIRE_QUEST_INTRO_LINES,
  FIRE_QUEST_MATCHING_PROMPT,
  FIRE_QUEST_OBJECTIVE_CARE,
  FIRE_QUEST_OBJECTIVE_FILL,
  FIRE_QUEST_OBJECTIVE_POUR,
  FIRE_QUEST_PLANTS,
  FIRE_QUEST_PROMPT_CARE,
  FIRE_QUEST_PROMPT_FILL,
  FIRE_QUEST_PROMPT_POUR,
  FIRE_QUEST_REVEAL,
  type FireQuestLine,
} from "@/data/fireQuestExercise";

type FloatingText = { id: number; text: string; type: "bonus" | "fail" };

/**
 * Ordre des cartes « utilisation » — volontairement différent de
 * `FIRE_QUEST_PLANTS` (sinon associer la carte n dans les deux colonnes
 * suffirait, sans lire le texte). Les ids restent ceux des plantes : une carte
 * « utilisation » partage l'id de SA plante, c'est ce qui définit la bonne paire.
 */
const SHUFFLED_USAGE_IDS = [FIRE_QUEST_PLANTS[1].id, FIRE_QUEST_PLANTS[2].id, FIRE_QUEST_PLANTS[0].id];

const TREE_COUNT = FIRE_QUEST_SCENE.trees.length;

/** Invite « ESPACE » du bas d'écran, même gabarit que DialogueUI/LearningCardUI. */
function KeyPrompt({ label }: { label: string }) {
  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[80] pointer-events-none">
      <div className="bg-amber-950/80 border-2 border-orange-500/60 text-amber-100 px-6 py-3 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-sm flex items-center gap-3 animate-bounce font-bold font-story">
        <kbd className="bg-amber-100 text-amber-950 px-3 py-1 rounded shadow-sm font-mono border-b-2 border-amber-300">
          ESPACE
        </kbd>
        <span>{label}</span>
      </div>
    </div>
  );
}

export default function FireQuestUI() {
  const phase = useFireQuestStore((s) => s.phase);
  const introStep = useFireQuestStore((s) => s.introStep);
  const extinguished = useFireQuestStore((s) => s.extinguished);
  const hasWater = useFireQuestStore((s) => s.hasWater);
  const nearFire = useFireQuestStore((s) => s.nearFire);
  const nearWater = useFireQuestStore((s) => s.nearWater);
  const nearTree = useFireQuestStore((s) => s.nearTree);
  const setPhase = useFireQuestStore((s) => s.setPhase);
  const skipToBurn = useFireQuestStore((s) => s.skipToBurn);
  const nextIntroLine = useFireQuestStore((s) => s.nextIntroLine);
  const discover = useFireQuestStore((s) => s.discover);
  const restoreCompleted = useFireQuestStore((s) => s.restoreCompleted);

  const setInteracting = useGameStore((s) => s.setInteracting);
  const addXP = useGameStore((s) => s.addXP);
  const addBiodiversity = useGameStore((s) => s.addBiodiversity);
  const { completedExercises, markExerciseCompleted } = useLearningStore();
  const isCompleted = completedExercises.includes(FIRE_QUEST_EXERCISE_ID);

  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ plantId: string; usageId: string } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const nextFloatId = useRef(0);
  const wasNearFire = useRef(false);
  const wasFrozen = useRef(false);

  // Quête déjà faite lors d'une session précédente (`completedExercises` est
  // persisté) : le feu doit être éteint dès l'arrivée, sinon on laisserait des
  // arbres en flammes que plus rien ne permet d'éteindre.
  useEffect(() => {
    if (isCompleted && useFireQuestStore.getState().phase === "idle") restoreCompleted();
  }, [isCompleted, restoreCompleted]);

  // Découverte « soudaine » : la quête démarre au premier passage dans le
  // rayon, sans appuyer sur ESPACE — Alex ne s'attend pas à un incendie.
  useEffect(() => {
    if (nearFire && !wasNearFire.current) discover();
    wasNearFire.current = nearFire;
  }, [nearFire, discover]);

  // Gel du joueur : seulement pendant les répliques et l'exercice. La phase
  // `fighting` doit évidemment rendre la main, c'est là qu'on court chercher
  // l'eau. On n'écrit le drapeau QUE sur changement, pour ne pas dégeler un
  // autre panneau (fiche espèce, dialogue) qui l'aurait posé de son côté.
  const frozen = phase === "intro" || phase === "doused" || phase === "burned" || phase === "matching";
  useEffect(() => {
    if (frozen === wasFrozen.current) return;
    wasFrozen.current = frozen;
    setInteracting(frozen);
  }, [frozen, setInteracting]);

  // Une seule fois au démontage : ne jamais laisser le joueur figé.
  useEffect(
    () => () => {
      if (wasFrozen.current) useGameStore.getState().setInteracting(false);
    },
    [],
  );

  const pushFloating = useCallback((texts: Omit<FloatingText, "id">[]) => {
    const withIds = texts.map((t) => ({ ...t, id: ++nextFloatId.current }));
    setFloatingTexts((prev) => [...prev, ...withIds]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((f) => !withIds.find((w) => w.id === f.id)));
    }, 2000);
  }, []);

  // Tout passe par `getState()` : le gestionnaire n'a aucune dépendance, donc
  // il n'est posé qu'une fois au lieu d'être remplacé à chaque frappe.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // L'auto-répétition du clavier enchaînerait plusieurs répliques d'un
      // seul appui maintenu.
      if (e.repeat) return;

      const s = useFireQuestStore.getState();

      if (e.code === "Escape") {
        if (s.phase === "matching") s.setPhase("pending_care");
        return;
      }
      if (e.code !== "Space") return;

      switch (s.phase) {
        case "intro":
          if (s.introStep < FIRE_QUEST_INTRO_LINES.length - 1) s.nextIntroLine();
          else s.setPhase("fighting");
          break;
        case "fighting":
          if (s.hasWater && s.nearTree !== null && !s.extinguished[s.nearTree]) s.douseTree(s.nearTree);
          else if (!s.hasWater && s.nearWater) s.fillBucket();
          break;
        case "doused":
          s.setPhase("burned");
          break;
        case "burned":
          s.setPhase("matching");
          break;
        case "pending_care":
          if (s.nearFire) s.setPhase("matching");
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (phase === "idle" || phase === "done") return null;

  const savedCount = extinguished.filter(Boolean).length;
  const canPour = hasWater && nearTree !== null && !extinguished[nearTree];

  const line: FireQuestLine | null =
    phase === "intro"
      ? FIRE_QUEST_INTRO_LINES[introStep]
      : phase === "doused"
        ? FIRE_QUEST_DOUSED_LINE
        : phase === "burned"
          ? FIRE_QUEST_BURNED_LINE
          : null;

  const advanceLine = () => {
    if (phase === "intro") {
      if (introStep < FIRE_QUEST_INTRO_LINES.length - 1) nextIntroLine();
      else setPhase("fighting");
    } else if (phase === "doused") {
      setPhase("burned");
    } else if (phase === "burned") {
      setPhase("matching");
    }
  };

  const handlePlantClick = (plantId: string) => {
    if (matchedIds.includes(plantId)) return;
    setSelectedPlantId(plantId);
    setWrongPair(null);
  };

  const handleUsageClick = (usageId: string) => {
    if (matchedIds.includes(usageId) || !selectedPlantId) return;

    if (selectedPlantId === usageId) {
      const next = [...matchedIds, usageId];
      setMatchedIds(next);
      setSelectedPlantId(null);
      if (next.length === FIRE_QUEST_PLANTS.length) {
        setRevealed(true);
        if (!isCompleted) {
          markExerciseCompleted(FIRE_QUEST_EXERCISE_ID);
        }
        addXP(5);
        addBiodiversity(5);
        pushFloating([
          { text: "+5 XP", type: "bonus" },
          { text: "+5 ODD 15", type: "bonus" },
        ]);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#4ade80", "#fbbf24", "#f87171", "#60a5fa"],
        });
      }
    } else {
      setWrongPair({ plantId: selectedPlantId, usageId });
      setSelectedPlantId(null);
      addXP(-2);
      pushFloating([{ text: "-2 XP", type: "fail" }]);
      setTimeout(() => setWrongPair(null), 700);
    }
  };

  return (
    <>
      {/* FLOATING TEXTS */}
      <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col items-center justify-center gap-2">
        {floatingTexts.map((f) => (
          <div
            key={f.id}
            className={`text-5xl font-black drop-shadow-xl ${f.type === "bonus" ? "text-green-400 animate-float-up" : "text-red-500 animate-drop-fade"}`}
          >
            {f.text}
          </div>
        ))}
      </div>

      {/* SUIVI D'OBJECTIF */}
      {(phase === "fighting" || phase === "pending_care") && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[80] pointer-events-none">
          <div className="bg-amber-950/85 border-2 border-orange-600/70 rounded-2xl px-6 py-3 backdrop-blur-sm shadow-[0_6px_20px_rgba(0,0,0,0.5)] text-center font-story text-amber-50">
            <div className="text-[0.7rem] uppercase tracking-[0.2em] font-bold text-orange-300">
              🔥 Incendie en forêt
            </div>
            {phase === "fighting" ? (
              <>
                <div className="text-lg font-bold">
                  {savedCount}/{TREE_COUNT} arbres sauvés
                </div>
                <div className="text-sm text-amber-200/85 font-sans">
                  {hasWater ? FIRE_QUEST_OBJECTIVE_POUR : FIRE_QUEST_OBJECTIVE_FILL}
                </div>
                <div className="text-xs mt-1 font-sans text-amber-300/80">
                  {hasWater ? "💧 Seau plein" : "🪣 Seau vide"}
                </div>
              </>
            ) : (
              <div className="text-sm text-amber-200/85 font-sans">{FIRE_QUEST_OBJECTIVE_CARE}</div>
            )}
          </div>
        </div>
      )}

      {/* INVITES */}
      {phase === "fighting" && canPour && <KeyPrompt label={FIRE_QUEST_PROMPT_POUR} />}
      {phase === "fighting" && !canPour && !hasWater && nearWater && <KeyPrompt label={FIRE_QUEST_PROMPT_FILL} />}
      {phase === "pending_care" && nearFire && <KeyPrompt label={FIRE_QUEST_PROMPT_CARE} />}

      {/* BOÎTE DE DIALOGUE EN BAS D'ÉCRAN */}
      {line && (
        <div className="fixed inset-0 z-[90] flex flex-col justify-end items-center pb-8 px-4 pointer-events-none">
          <div className="w-full max-w-4xl bg-amber-950/95 border-4 border-orange-600 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden pointer-events-auto">
            <div className="px-6 pt-4">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-bold text-orange-200 bg-orange-900/60 border border-orange-600/60 rounded-full px-3 py-1 font-story">
                {phase === "burned" ? "💬" : "🔥"} {line.speaker}
              </span>
            </div>

            <div className="px-6 py-4 min-h-[90px] flex items-center">
              <p className="text-xl text-amber-50 font-story leading-relaxed whitespace-pre-wrap drop-shadow-md">
                {line.text}
              </p>
            </div>

            <div className="px-6 py-3 bg-amber-900/30 border-t-2 border-amber-800/50 flex justify-end items-center gap-3">
              {phase === "intro" && (
                <button
                  onClick={skipToBurn}
                  className="px-5 py-2 rounded-lg border border-amber-200/25 text-amber-100/70 hover:text-amber-50 hover:border-amber-200/60 transition-colors cursor-pointer font-story"
                >
                  Passer
                </button>
              )}
              <button
                onClick={advanceLine}
                className="px-6 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-orange-950 font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer font-story flex items-center gap-3"
              >
                {phase === "burned" ? "Chercher une plante" : "Continuer"}
                <kbd className="bg-orange-950/30 text-orange-950 px-2 py-0.5 rounded text-xs font-mono">ESPACE</kbd>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXERCICE D'ASSOCIATION */}
      {phase === "matching" && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPhase("pending_care")} />

          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#3a1408]/95 via-[#2a0f08]/95 to-[#1c0a06]/95 border-4 border-orange-700/80 rounded-[24px] p-7 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)] text-orange-50 font-story">
            <button
              onClick={() => setPhase("pending_care")}
              className="absolute -top-5 -right-5 bg-red-600/90 hover:bg-red-500 text-white w-10 h-10 rounded-full font-bold shadow-lg transition-transform hover:scale-110 flex items-center justify-center border-2 border-red-300 cursor-pointer"
              aria-label="Fermer"
            >
              ✕
            </button>

            <h3 className="text-xl md:text-2xl font-bold text-orange-200 tracking-wide text-center mb-5">
              {FIRE_QUEST_MATCHING_PROMPT}
            </h3>

            {!revealed ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {FIRE_QUEST_PLANTS.map((plant) => {
                      const matched = matchedIds.includes(plant.id);
                      const selected = selectedPlantId === plant.id;
                      const wrong = wrongPair?.plantId === plant.id;
                      return (
                        <button
                          key={plant.id}
                          onClick={() => handlePlantClick(plant.id)}
                          disabled={matched}
                          className={`w-full text-left px-4 py-3 rounded-xl border-2 font-sans font-bold transition-colors cursor-pointer disabled:cursor-default flex items-center gap-2 ${
                            matched
                              ? "bg-green-700/40 border-green-400 text-green-100"
                              : wrong
                                ? "bg-red-700/50 border-red-400 text-red-100 animate-shake-fail"
                                : selected
                                  ? "bg-orange-600/50 border-orange-300 text-orange-50"
                                  : "bg-black/30 border-orange-700/50 text-orange-100 hover:border-orange-400"
                          }`}
                        >
                          <span className="text-xl">{plant.emoji}</span>
                          {plant.name}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    {SHUFFLED_USAGE_IDS.map((usageId) => {
                      const plant = FIRE_QUEST_PLANTS.find((p) => p.id === usageId)!;
                      const matched = matchedIds.includes(usageId);
                      const wrong = wrongPair?.usageId === usageId;
                      return (
                        <button
                          key={usageId}
                          onClick={() => handleUsageClick(usageId)}
                          disabled={matched}
                          className={`w-full text-left px-4 py-3 rounded-xl border-2 font-sans text-sm transition-colors cursor-pointer disabled:cursor-default ${
                            matched
                              ? "bg-green-700/40 border-green-400 text-green-100"
                              : wrong
                                ? "bg-red-700/50 border-red-400 text-red-100 animate-shake-fail"
                                : "bg-black/30 border-orange-700/50 text-orange-100 hover:border-orange-400"
                          }`}
                        >
                          {plant.usage}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-center text-orange-300/70 text-sm font-sans italic mt-5">
                  Cliquez une plante puis son utilisation pour les associer.
                </p>
              </>
            ) : (
              <div className="space-y-6 text-center">
                <p className="text-orange-100 leading-relaxed font-sans text-lg">{FIRE_QUEST_REVEAL}</p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => {
                      setMatchedIds([]);
                      setSelectedPlantId(null);
                      setRevealed(false);
                    }}
                    className="bg-orange-800/80 hover:bg-orange-700 text-orange-100 font-bold px-6 py-3 rounded-xl border border-orange-600 transition-transform hover:scale-105 cursor-pointer"
                  >
                    🔄 Recommencer l’association
                  </button>
                  <button
                    onClick={() => setPhase("done")}
                    className="bg-orange-600 hover:bg-orange-500 text-orange-950 font-bold px-8 py-3 rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

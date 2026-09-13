"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, Pause } from "lucide-react";
import confetti from "canvas-confetti";
import { useChiefDialogueStore } from "@/store/useChiefDialogueStore";
import { useGameStore } from "@/store/useGameStore";
import { useLearningStore } from "@/store/useLearningStore";
import { backgroundMusicPlayer } from "@/lib/loopingMusicPlayer";
import {
  CHIEF_EXERCISE_ID,
  CHIEF_QUESTIONS,
  chiefAudioPath,
} from "@/data/chiefListeningExercise";

/**
 * Rencontre avec le chef du village — exercice d'écoute en 5 temps.
 *
 * À chaque item : Alex écoute le chef (audio `monologue_N`), puis choisit la
 * QUESTION la plus pertinente à poser. Voir `chiefListeningExercise.ts` pour le
 * pourquoi de cette mécanique.
 *
 * Barème repris tel quel des autres dialogues du jeu (`DialogueUI`) : bonne
 * réponse = +5 XP et +5 ODD 16 « lien de confiance », mauvaise = −2 XP et on
 * refait l'item. Le malus ne s'applique QUE tant que l'exercice n'a pas encore
 * été validé une première fois, sinon rejouer la scène pour réécouter le
 * français ferait perdre des points — l'inverse de ce qu'on veut encourager.
 */

/** Vitesse de fondu (secondes) en ducking/rétablissant la musique de fond. */
const MUSIC_DUCK_RAMP = 0.4;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type FloatingText = { id: number; text: string; type: "bonus" | "fail" };
type Stage = "intro" | "quiz" | "done";

export default function ChiefDialogueUI() {
  const { nearby, isOpen, open, close } = useChiefDialogueStore();
  const { setInteracting, addXP, addTrust } = useGameStore();
  const { completedExercises, markExerciseCompleted } = useLearningStore();
  const isCompleted = completedExercises.includes(CHIEF_EXERCISE_ID);

  const [stage, setStage] = useState<Stage>("intro");
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextFloatId = useRef(0);

  useEffect(() => {
    setInteracting(isOpen);
  }, [isOpen, setInteracting]);

  // Tắt hẳn tiếng nhạc nền trong suốt thời gian mở bài tập với trưởng làng
  useEffect(() => {
    if (isOpen) {
      backgroundMusicPlayer.duck(0, 0);
      return () => {
        backgroundMusicPlayer.unduck(MUSIC_DUCK_RAMP);
      };
    }
  }, [isOpen]);

  // Remise à zéro dans les handlers d'ouverture/fermeture, pas dans un effet qui
  // réagit à `isOpen` : un effet provoquerait un rendu en cascade juste pour
  // réinitialiser l'état (règle `react-hooks/set-state-in-effect`).
  const startExercise = useCallback(() => {
    setStage("intro");
    setStep(0);
    setPicked(null);
    setFeedback(null);
    open();
  }, [open]);

  const stopExercise = useCallback(() => {
    audioRef.current?.pause();
    close();
  }, [close]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "KeyE") && nearby && !isOpen) {
        e.preventDefault();
        startExercise();
      }
      if (e.code === "Escape" && isOpen) {
        stopExercise();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nearby, isOpen, startExercise, stopExercise]);

  if (!isOpen && !nearby) return null;

  const question = CHIEF_QUESTIONS[step];

  const pushFloating = (texts: Omit<FloatingText, "id">[]) => {
    const withIds = texts.map((t) => ({ ...t, id: ++nextFloatId.current }));
    setFloatingTexts((prev) => [...prev, ...withIds]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((f) => !withIds.some((w) => w.id === f.id)));
    }, 2000);
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      backgroundMusicPlayer.duck(0, 0.1);
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const seekAudio = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
  };

  const goToStep = (next: number) => {
    audioRef.current?.pause();
    setStep(next);
    setPicked(null);
    setFeedback(null);
    setCurrentTime(0);
    setDuration(0);
  };

  const handlePick = (index: number) => {
    if (picked !== null) return;
    setPicked(index);

    if (index === question.correctAnswer) {
      setFeedback({ text: question.feedbackSuccess, ok: true });
      addXP(5);
      addTrust(5);
      pushFloating([
        { text: "+5 XP", type: "bonus" },
        { text: "+5 ODD 16", type: "bonus" },
      ]);

      const last = step === CHIEF_QUESTIONS.length - 1;
      setTimeout(() => {
        if (last) {
          audioRef.current?.pause();
          setStage("done");
          confetti({
            particleCount: 160,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#4ade80", "#fbbf24", "#f87171", "#60a5fa"],
          });
          if (!isCompleted) markExerciseCompleted(CHIEF_EXERCISE_ID);
        } else {
          goToStep(step + 1);
        }
      }, 1600);
    } else {
      setFeedback({ text: question.feedbackFail, ok: false });
      addXP(-2);
      pushFloating([{ text: "-2 XP", type: "fail" }]);
      // On laisse le mauvais choix visible un instant, puis on rouvre l'item :
      // réécouter et réessayer fait partie de l'exercice.
      setTimeout(() => {
        setPicked(null);
        setFeedback(null);
      }, 1800);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={chiefAudioPath(step)}
        preload="auto"
        onPlay={() => {
          setIsPlaying(true);
          backgroundMusicPlayer.duck(0, 0.1);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      />

      {/* FLOATING TEXTS */}
      <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col items-center justify-center gap-2">
        {floatingTexts.map((f) => (
          <div
            key={f.id}
            className={`text-5xl font-black drop-shadow-xl ${
              f.type === "bonus" ? "text-green-400 animate-float-up" : "text-red-500 animate-drop-fade"
            }`}
          >
            {f.text}
          </div>
        ))}
      </div>

      {/* INTERACTION PROMPT */}
      {nearby && !isOpen && (
        <div
          onClick={startExercise}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] cursor-pointer group select-none"
        >
          <div className="bg-amber-950/85 border-2 border-amber-500/60 text-amber-100 px-6 py-3 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.35)] backdrop-blur-sm flex items-center gap-3 animate-bounce font-bold font-story group-hover:scale-105 group-hover:bg-amber-900/90 transition-all">
            <kbd className="bg-amber-100 text-amber-950 px-3 py-1 rounded shadow-sm font-mono border-b-2 border-amber-300">
              ESPACE
            </kbd>
            <span>Parler au chef du village</span>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={stopExercise} />

          <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#3a1f11]/95 via-[#2c160b]/95 to-[#221008]/95 border-4 border-amber-700/80 rounded-[24px] p-7 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)] text-amber-50 font-story">
            <button
              onClick={stopExercise}
              className="absolute -top-5 -right-5 bg-red-600/90 hover:bg-red-500 text-white w-10 h-10 rounded-full font-bold shadow-lg transition-transform hover:scale-110 flex items-center justify-center border-2 border-red-300 cursor-pointer"
              aria-label="Fermer"
            >
              ✕
            </button>

            {stage === "intro" && (
              <div className="space-y-6 text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-amber-200 tracking-wide">
                  Le chef du village
                </h3>
                <p className="text-amber-100/90 leading-relaxed font-sans">
                  Le chef accepte de recevoir Alex. Il va parler de ce qui a changé autour du
                  village. Écoutez-le à chaque étape, puis choisissez la question la plus
                  pertinente à lui poser pour faire avancer la conversation.
                </p>
                <p className="text-amber-300/80 text-sm font-sans italic">
                  {CHIEF_QUESTIONS.length} échanges · vous pouvez réécouter autant de fois que
                  nécessaire
                </p>
                <div>
                  <button
                    onClick={() => setStage("quiz")}
                    className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    Commencer la conversation →
                  </button>
                </div>
              </div>
            )}

            {stage === "quiz" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-amber-200 tracking-wide">
                    Échange {step + 1} / {CHIEF_QUESTIONS.length}
                  </h3>
                  <button
                    onClick={toggleAudio}
                    aria-label={isPlaying ? "Mettre en pause" : "Écouter"}
                    className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-full border transition-colors cursor-pointer ${
                      isPlaying
                        ? "bg-amber-500 border-amber-300 text-amber-950"
                        : "bg-amber-900/60 border-amber-600/60 text-amber-200 hover:bg-amber-800"
                    }`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Barre de progression de l'audio */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-amber-300/80 font-mono w-9 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <div
                    className="flex-1 h-2 bg-amber-950/70 rounded-full cursor-pointer overflow-hidden border border-amber-700/50"
                    onClick={seekAudio}
                  >
                    <div
                      className="h-full bg-amber-400 transition-[width] duration-150"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-amber-300/80 font-mono w-9">
                    {formatTime(duration)}
                  </span>
                </div>

                <p className="text-center text-amber-300/80 text-sm font-sans italic">
                  {question.context}
                </p>

                <p className="text-center text-amber-100 font-sans">
                  Quelle question poser au chef ?
                </p>

                <div className="space-y-3">
                  {question.options.map((option, i) => {
                    const isPicked = picked === i;
                    const isRight = i === question.correctAnswer;
                    let tone =
                      "bg-amber-900/50 border-amber-700/60 hover:bg-amber-800/70 hover:border-amber-500";
                    if (isPicked && isRight) tone = "bg-green-700/70 border-green-400";
                    else if (isPicked && !isRight) tone = "bg-red-800/70 border-red-400 animate-shake-fail";

                    return (
                      <button
                        key={option}
                        onClick={() => handlePick(i)}
                        disabled={picked !== null}
                        className={`w-full text-left px-5 py-3 rounded-xl border-2 transition-colors font-sans leading-snug disabled:cursor-default cursor-pointer ${tone}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {feedback && (
                  <p
                    className={`text-center font-bold font-sans ${
                      feedback.ok ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {feedback.text}
                  </p>
                )}
              </div>
            )}

            {stage === "done" && (
              <div className="space-y-6 text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-amber-200 tracking-wide">
                  Le chef vous fait confiance
                </h3>
                <p className="text-amber-100/90 leading-relaxed font-sans">
                  Alex a compris l’essentiel : la déforestation, la rivière polluée et le départ
                  des animaux sont un seul et même problème. Le chef est prêt à travailler avec
                  Alex pour trouver des solutions.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setStage("quiz");
                      setStep(0);
                      setPicked(null);
                      setFeedback(null);
                      setCurrentTime(0);
                      setDuration(0);
                    }}
                    className="bg-amber-800/80 hover:bg-amber-700 text-amber-100 font-bold px-6 py-3 rounded-xl border border-amber-600 transition-transform hover:scale-105 cursor-pointer"
                  >
                    🔄 Recommencer l’exercice
                  </button>
                  <button
                    onClick={stopExercise}
                    className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    Continuer l’exploration
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

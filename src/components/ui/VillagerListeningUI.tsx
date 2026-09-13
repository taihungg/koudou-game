"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useVillagersDialogueStore } from "@/store/useVillagersDialogueStore";
import { useGameStore } from "@/store/useGameStore";
import { useLearningStore } from "@/store/useLearningStore";
import { backgroundMusicPlayer } from "@/lib/loopingMusicPlayer";
import {
  VILLAGER_CLOZE_ANSWERS,
  VILLAGER_CLOZE_SEGMENTS,
  VILLAGER_LISTENING_AUDIO,
  VILLAGER_LISTENING_EXERCISE_ID,
} from "@/data/villagerListeningExercise";

const BLANK_COUNT = VILLAGER_CLOZE_ANSWERS.length;
/** Vitesse de fondu (secondes) en ducking/rétablissant la musique de fond. */
const MUSIC_DUCK_RAMP = 0.4;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function normalize(word: string): string {
  return word.trim().toLowerCase();
}

type FloatingText = { id: number; text: string; type: "bonus" | "fail" };

export default function VillagerListeningUI() {
  const { nearby, isOpen, open, close } = useVillagersDialogueStore();
  const { setInteracting, addXP, addBiodiversity } = useGameStore();
  const { completedExercises, markExerciseCompleted } = useLearningStore();
  const isCompleted = completedExercises.includes(VILLAGER_LISTENING_EXERCISE_ID);

  const [stage, setStage] = useState<"listen" | "quiz">("listen");
  const [answers, setAnswers] = useState<string[]>(Array(BLANK_COUNT).fill(""));
  const [locked, setLocked] = useState<boolean[]>(Array(BLANK_COUNT).fill(false));
  const [wrong, setWrong] = useState<boolean[]>(Array(BLANK_COUNT).fill(false));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const nextFloatId = useRef(0);

  useEffect(() => {
    setInteracting(isOpen);
  }, [isOpen, setInteracting]);

  useEffect(() => {
    if (isOpen) {
      backgroundMusicPlayer.duck(0, 0);
      return () => {
        backgroundMusicPlayer.unduck(MUSIC_DUCK_RAMP);
      };
    }
  }, [isOpen]);

  // Réinitialise l'exercice au moment même de l'ouverture/fermeture (dans les
  // handlers, pas dans un effet qui réagit à `isOpen`) pour éviter un rendu en
  // cascade juste pour remettre l'état à zéro. On coupe aussi la musique de
  // fond pendant tout exercice d'écoute pour ne pas couvrir l'audio à étudier.
  const startExercise = useCallback(() => {
    setStage("listen");
    setAnswers(Array(BLANK_COUNT).fill(""));
    setLocked(Array(BLANK_COUNT).fill(false));
    setWrong(Array(BLANK_COUNT).fill(false));
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

  const allFilled = answers.every((a) => a.trim().length > 0);

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

  const handleAnswerChange = (idx: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
    if (wrong[idx]) setWrong((prev) => prev.map((w, i) => (i === idx ? false : w)));
    setFeedback(null);
  };

  const handleAnswerKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = inputRefs.current.find((el, i) => i > idx && el && !locked[i]);
      next?.focus();
    }
  };

  const pushFloating = (texts: Omit<FloatingText, "id">[]) => {
    const withIds = texts.map((t) => ({ ...t, id: ++nextFloatId.current }));
    setFloatingTexts((prev) => [...prev, ...withIds]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((f) => !withIds.find((w) => w.id === f.id)));
    }, 2000);
  };

  const handleVerify = () => {
    const evalCorrectNow = answers.map((a, i) => normalize(a) === VILLAGER_CLOZE_ANSWERS[i]);
    const evalWrong = answers.map((a, i) => a.trim().length > 0 && !evalCorrectNow[i]);
    const allCorrect = evalCorrectNow.every(Boolean);

    setWrong(evalWrong);
    setLocked((prev) => prev.map((l, i) => l || evalCorrectNow[i]));

    if (allCorrect) {
      setFeedback("Parfait ! Tu as bien compris la conversation des habitants.");
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#4ade80", "#fbbf24", "#f87171", "#60a5fa"] });
      if (!isCompleted) {
        markExerciseCompleted(VILLAGER_LISTENING_EXERCISE_ID);
      }
      addXP(5);
      addBiodiversity(5);
      pushFloating([
        { text: "+5 XP", type: "bonus" },
        { text: "+5 ODD 15", type: "bonus" },
      ]);
    } else {
      setFeedback("Pas tout à fait. Réécoute la conversation et relis le sens de la phrase.");
      addXP(-2);
      pushFloating([{ text: "-2 XP", type: "fail" }]);
      setTimeout(() => {
        setAnswers((prev) => prev.map((a, i) => (evalWrong[i] ? "" : a)));
        setWrong(Array(BLANK_COUNT).fill(false));
      }, 1200);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={VILLAGER_LISTENING_AUDIO}
        preload="auto"
        onPlay={() => {
          setIsPlaying(true);
          backgroundMusicPlayer.duck(0, 0.1);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          const audio = e.currentTarget;
          setCurrentTime(audio.currentTime);
          setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
        }}
      />

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

      {/* INTERACTION PROMPT */}
      {nearby && !isOpen && (
        <div
          onClick={startExercise}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[80] cursor-pointer group select-none"
        >
          <div className="bg-amber-950/85 border-2 border-amber-500/60 text-amber-100 px-6 py-3 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.35)] backdrop-blur-sm flex items-center gap-3 animate-bounce font-bold font-story group-hover:scale-105 group-hover:bg-amber-900/90 transition-all">
            <kbd className="bg-amber-100 text-amber-950 px-3 py-1 rounded shadow-sm font-mono border-b-2 border-amber-300">ESPACE</kbd>
            <span>Écouter en secret</span>
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

            {stage === "listen" ? (
              <div className="space-y-6 text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-amber-200 tracking-wide">
                  Alex écoute en cachette
                </h3>
                <p className="text-amber-100/90 leading-relaxed font-sans">
                  Caché derrière un arbre, Alex entend deux habitants du village parler d&apos;un problème
                  récent. Écoute bien leur conversation avant de continuer.
                </p>
                <div>
                  <button
                    onClick={() => setStage("quiz")}
                    className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    Continuer vers l&apos;exercice →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-amber-200 tracking-wide">
                    Texte à trous
                  </h3>
                  <button
                    onClick={toggleAudio}
                    aria-label={isPlaying ? "Mettre en pause" : "Écouter"}
                    className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-full border transition-colors cursor-pointer ${
                      isPlaying
                        ? "bg-amber-500 border-amber-300 text-amber-950 animate-pulse"
                        : "bg-amber-800/60 hover:bg-amber-700/70 border-amber-500/50 text-amber-100"
                    }`}
                  >
                    <Volume2 size={20} />
                  </button>
                </div>

                {/* Barre de progression audio */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-amber-300/80 font-mono w-9 text-right">{formatTime(currentTime)}</span>
                  <div
                    className="flex-1 h-2 bg-amber-950/70 rounded-full cursor-pointer overflow-hidden border border-amber-700/50"
                    onClick={seekAudio}
                  >
                    <div
                      className="h-full bg-amber-400 transition-[width] duration-150"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-amber-300/80 font-mono w-9">{formatTime(duration)}</span>
                </div>

                <p className="text-center text-amber-300/80 text-sm font-sans italic">
                  Écoute la conversation et écris le mot qui manque dans chaque espace.
                </p>

                <p className="text-amber-100/90 leading-loose text-lg font-sans">
                  {VILLAGER_CLOZE_SEGMENTS.map((seg, i) =>
                    seg.type === "text" ? (
                      <span key={i}>{seg.content}</span>
                    ) : (
                      <input
                        key={i}
                        ref={(el) => {
                          inputRefs.current[seg.index] = el;
                        }}
                        type="text"
                        value={answers[seg.index]}
                        onChange={(e) => handleAnswerChange(seg.index, e.target.value)}
                        onKeyDown={(e) => handleAnswerKeyDown(seg.index, e)}
                        disabled={locked[seg.index]}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        maxLength={20}
                        className={`inline-block w-24 mx-1 px-2 py-0.5 rounded-md border-b-2 text-center font-bold align-baseline bg-transparent focus:outline-none transition-colors ${
                          locked[seg.index]
                            ? "bg-green-700/40 border-green-400 text-green-100"
                            : wrong[seg.index]
                              ? "bg-red-700/50 border-red-400 text-red-100"
                              : "bg-amber-950/50 border-amber-500/60 text-amber-50 focus:border-amber-300"
                        }`}
                      />
                    ),
                  )}
                </p>

                {feedback && (
                  <p className="text-center font-bold text-amber-200 font-sans">{feedback}</p>
                )}

                <div className="flex justify-center gap-3 pt-2">
                  {(locked.some(Boolean) || answers.some((a) => a.length > 0)) && (
                    <button
                      onClick={() => {
                        setAnswers(Array(BLANK_COUNT).fill(""));
                        setLocked(Array(BLANK_COUNT).fill(false));
                        setWrong(Array(BLANK_COUNT).fill(false));
                        setFeedback(null);
                      }}
                      className="bg-amber-800/80 hover:bg-amber-700 text-amber-100 font-bold px-6 py-3 rounded-xl border border-amber-600 transition-transform hover:scale-105 cursor-pointer"
                    >
                      🔄 Recommencer
                    </button>
                  )}
                  <button
                    onClick={handleVerify}
                    disabled={!allFilled}
                    className="bg-amber-600 hover:bg-amber-500 disabled:bg-amber-900/50 disabled:text-amber-100/40 disabled:cursor-not-allowed text-amber-950 font-bold px-8 py-3 rounded-xl shadow-lg transition-transform enabled:hover:scale-105 cursor-pointer"
                  >
                    Vérifier
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

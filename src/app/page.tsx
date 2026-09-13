"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Lock } from "lucide-react";
import { chapter2Progress } from "@/config/chapter2Unlock";
import { useGameStore } from "@/store/useGameStore";
import { useLearningStore } from "@/store/useLearningStore";

const emptySubscribe = () => () => {};

export default function MainMenu() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const setChapter = useGameStore((s) => s.setChapter);
  const xpLangage = useGameStore((s) => s.xp_langage);
  const completedExercises = useLearningStore((s) => s.completedExercises);

  // Cùng một phép kiểm tra với cổng làng trong /forest — xem
  // `src/config/chapter2Unlock.ts`. `chapter2Progress` renvoie un objet neuf à
  // chaque appel, d'où le `useMemo` : l'appeler dans un sélecteur Zustand
  // rerendrait le composant en boucle.
  const progress = useMemo(
    () => chapter2Progress({ xpLangage, completedExercises }),
    [xpLangage, completedExercises],
  );
  const unlocked = progress.unlocked;

  if (!mounted) return null;

  return (
    <main className="w-screen h-screen relative bg-amber-950 flex flex-col items-center justify-center font-story overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
      
      {/* Title Section */}
      <div className="relative z-10 flex flex-col items-center mb-16 animate-in slide-in-from-top-10 duration-1000">
        <h1 className="text-8xl font-black text-amber-400 tracking-widest drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] uppercase">
          KOUDOU
        </h1>
        <p className="text-2xl text-amber-100 mt-4 tracking-wider italic bg-black/40 px-6 py-2 rounded-full border border-amber-500/30">
          Gardien de Forêt
        </p>
      </div>

      {/* Menu Options */}
      <div className="relative z-10 flex flex-col gap-6 w-full max-w-md animate-in fade-in zoom-in duration-1000 delay-300">
        
        <Link
          href="/forest"
          // KHÔNG reset cờ intro ở đây: cutscene mở màn chỉ chạy ở lần chơi đầu
          // tiên (`hasSeenChapter1Intro` được persist). Muốn xem lại thì dùng
          // nút « Revoir l'introduction » bên dưới.
          onClick={() => setChapter(1)}
          className="group relative flex items-center justify-center p-6 bg-amber-900/80 hover:bg-amber-700/90 border-4 border-amber-600 hover:border-amber-400 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 transform hover:scale-105 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <span className="text-2xl font-bold text-amber-50 uppercase tracking-wide">
            Chapitre 1 : L&apos;Arrivée
          </span>
        </Link>

        {unlocked ? (
          <Link
            href="/village"
            onClick={() => {
              setChapter(2);
              useGameStore.getState().setHasSeenVillageIntro(false);
            }}
            className="group relative flex items-center justify-center p-6 bg-emerald-900/80 hover:bg-emerald-700/90 border-4 border-emerald-600 hover:border-emerald-400 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 transform hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="text-2xl font-bold text-emerald-50 uppercase tracking-wide">
              Chapitre 2 : Le Village
            </span>
          </Link>
        ) : (
          <div
            aria-disabled="true"
            className="relative flex flex-col items-center gap-3 p-6 bg-neutral-800/70 border-4 border-neutral-600/60 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-not-allowed overflow-hidden select-none"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-neutral-400" />
              <span className="text-2xl font-bold text-neutral-400 uppercase tracking-wide">
                Chapitre 2 : Le Village
              </span>
            </div>
            {/* Afficher CE QUI MANQUE, pas seulement « verrouillé » : sinon le
                joueur n'a aucun moyen de savoir quoi faire pour ouvrir. */}
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm font-sans">
              <span className={progress.speciesDone ? "text-emerald-400" : "text-neutral-400"}>
                Catalogue : {progress.speciesFound}/{progress.speciesTotal} espèces
              </span>
              <span className={progress.xpDone ? "text-emerald-400" : "text-neutral-400"}>
                Français : {progress.xp}/{progress.xpRequired} XP
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => useGameStore.getState().setHasSeenChapter1Intro(false)}
          className="self-center text-sm tracking-widest uppercase text-amber-200/50 hover:text-amber-100 transition-colors"
        >
          Revoir l&apos;introduction
        </button>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 z-10 text-amber-200/50 text-sm">
        Hackathon Jeu Parle Français 2026 - OIF
      </div>
    </main>
  );
}

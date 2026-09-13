"use client";

import { useGameStore } from "@/store/useGameStore";

export default function HUD() {
  const { xp_langage, indice_biodiversite, lien_confiance } = useGameStore();

  return (
    <div className="absolute top-0 left-0 w-full p-4 md:p-5 lg:p-6 pointer-events-none flex justify-between items-start z-10">

      {/* SCOREBOARD - Adventure / Notebook Vibe (~25% smaller than the original w-80/p-6 baseline) */}
      <div className="bg-[#fdf6e3] backdrop-blur-md p-4 md:p-4.5 lg:p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-4 border-amber-800/80 pointer-events-auto w-52 md:w-56 lg:w-60 relative overflow-hidden">

        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

        <h1 className="text-2xl md:text-2xl lg:text-3xl font-extrabold text-amber-900 mb-4 lg:mb-5 tracking-widest font-story drop-shadow-sm border-b-2 border-amber-800/30 pb-2 text-center">
          KOUDOU
        </h1>

        <div className="flex flex-col gap-3 lg:gap-3.5 relative z-10">

          {/* XP Langage */}
          <div className="relative mt-2">
            <div className="flex items-center justify-between bg-blue-50 p-2 lg:p-2.5 rounded-lg border-2 border-blue-200 shadow-sm">
              <span className="font-bold text-blue-800 flex items-center gap-1.5 text-sm lg:text-base">
                <span>🗣️</span> Langage (FR)
              </span>
              <span className="text-base lg:text-lg font-black text-blue-900">{xp_langage} <span className="text-[10px] font-bold opacity-70">XP</span></span>
            </div>
            {/* Niveau Badge hanging off */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-800 text-blue-50 text-[9px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full shadow-md border-2 border-[#fdf6e3]">
              Niveau A2
            </div>
          </div>

          {/* ODD 15 */}
          <div className="relative mt-2">
            <div className="flex items-center justify-between bg-green-50 p-2 lg:p-2.5 rounded-lg border-2 border-green-200 shadow-sm">
              <span className="font-bold text-green-800 flex items-center gap-1.5 text-sm lg:text-base">
                <span>🌿</span> Biodiversité
              </span>
              <span className="text-base lg:text-lg font-black text-green-900">{indice_biodiversite} <span className="text-[10px] font-bold opacity-70">PT</span></span>
            </div>
            {/* ODD Badge hanging off */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-700 text-green-50 text-[9px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full shadow-md border-2 border-[#fdf6e3]">
              ODD 15
            </div>
          </div>

          {/* ODD 16 */}
          <div className="relative mt-2">
            <div className="flex items-center justify-between bg-amber-50 p-2 lg:p-2.5 rounded-lg border-2 border-amber-200 shadow-sm">
              <span className="font-bold text-amber-800 flex items-center gap-1.5 text-sm lg:text-base">
                <span>🤝</span> Confiance
              </span>
              <span className="text-base lg:text-lg font-black text-amber-900">{lien_confiance} <span className="text-[10px] font-bold opacity-70">PT</span></span>
            </div>
            {/* ODD Badge hanging off */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-50 text-[9px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full shadow-md border-2 border-[#fdf6e3]">
              ODD 16
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

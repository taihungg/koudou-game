"use client";

import { useGameStore } from "@/store/useGameStore";

export default function HUD() {
  const { xp_langage, indice_biodiversite, lien_confiance } = useGameStore();

  return (
    <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start z-10">
      
      {/* SCOREBOARD - Adventure / Notebook Vibe */}
      <div className="bg-[#fdf6e3] backdrop-blur-md p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-4 border-amber-800/80 pointer-events-auto w-80 relative overflow-hidden">
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

        <h1 className="text-4xl font-extrabold text-amber-900 mb-6 tracking-widest font-story drop-shadow-sm border-b-2 border-amber-800/30 pb-3 text-center">
          KOUDOU
        </h1>
        
        <div className="flex flex-col gap-4 relative z-10">
          
          {/* XP Langage */}
          <div className="relative mt-2">
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border-2 border-blue-200 shadow-sm">
              <span className="font-bold text-blue-800 flex items-center gap-2">
                <span>🗣️</span> Langage (FR)
              </span>
              <span className="text-xl font-black text-blue-900">{xp_langage} <span className="text-xs font-bold opacity-70">XP</span></span>
            </div>
            {/* Niveau Badge hanging off */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-800 text-blue-50 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-md border-2 border-[#fdf6e3]">
              Niveau A2
            </div>
          </div>

          {/* ODD 15 */}
          <div className="relative mt-2">
            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border-2 border-green-200 shadow-sm">
              <span className="font-bold text-green-800 flex items-center gap-2">
                <span>🌿</span> Biodiversité
              </span>
              <span className="text-xl font-black text-green-900">{indice_biodiversite} <span className="text-xs font-bold opacity-70">PT</span></span>
            </div>
            {/* ODD Badge hanging off */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-700 text-green-50 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-md border-2 border-[#fdf6e3]">
              ODD 15
            </div>
          </div>

          {/* ODD 16 */}
          <div className="relative mt-2">
            <div className="flex items-center justify-between bg-amber-50 p-3 rounded-lg border-2 border-amber-200 shadow-sm">
              <span className="font-bold text-amber-800 flex items-center gap-2">
                <span>🤝</span> Confiance
              </span>
              <span className="text-xl font-black text-amber-900">{lien_confiance} <span className="text-xs font-bold opacity-70">PT</span></span>
            </div>
            {/* ODD Badge hanging off */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-50 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-md border-2 border-[#fdf6e3]">
              ODD 16
            </div>
          </div>

        </div>
      </div>

      {/* Quick controls hint */}
      <div className="bg-amber-900/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border-2 border-amber-700/50 text-sm font-bold text-amber-50 pointer-events-auto">
        WASD / Flèches pour bouger
      </div>
    </div>
  );
}

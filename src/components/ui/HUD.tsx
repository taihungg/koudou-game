"use client";

import { useGameStore } from "@/store/useGameStore";

export default function HUD() {
  const { xp_langage, indice_biodiversite, lien_confiance } = useGameStore();

  return (
    <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start z-10">
      <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/50 pointer-events-auto">
        <h1 className="text-3xl font-extrabold text-green-900 mb-4 tracking-tight">KOUDOU</h1>
        <div className="flex flex-col gap-3 text-sm font-semibold text-gray-800">
          <div className="flex items-center justify-between gap-6">
            <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200">
              XP Langage (FR)
            </span>
            <span className="text-lg">{xp_langage}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg border border-green-200">
              Biodiversité (ODD 15)
            </span>
            <span className="text-lg">{indice_biodiversite}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200">
              Confiance (ODD 16)
            </span>
            <span className="text-lg">{lien_confiance}</span>
          </div>
        </div>
      </div>

      {/* Quick controls hint */}
      <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white/50 text-sm font-bold text-gray-700 pointer-events-auto">
        WASD / Arrows to Move
      </div>
    </div>
  );
}

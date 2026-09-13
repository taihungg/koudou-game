"use client";

import { useEffect, useState } from "react";
import { HelpCircle, X } from "lucide-react";

const CONTROLS = [
  { keys: "Flèches / WASD", desc: "Se déplacer" },
  { keys: "Q", desc: "Courir (sprint)" },
  { keys: "E", desc: "Sauter" },
  { keys: "F", desc: "Mode Observation (loupe)" },
  { keys: "Espace", desc: "Interagir / parler" },
  { keys: "Échap", desc: "Fermer une fenêtre" },
];

export default function HelpUI() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Aide"
        className="fixed top-4 right-4 md:top-6 md:right-6 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-900/90 hover:bg-amber-700 border-2 border-amber-300/50 shadow-lg flex items-center justify-center pointer-events-auto transition-all duration-200 hover:scale-110"
      >
        <HelpCircle className="w-6 h-6 md:w-7 md:h-7 text-amber-100" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 pointer-events-auto">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[#fdf3d8] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-[10px] md:border-[12px] border-amber-950 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-amber-900 text-amber-50 py-3 px-5 flex justify-between items-center shadow-md border-b-4 border-amber-950">
              <h2 className="text-xl md:text-2xl font-black font-serif tracking-widest text-amber-200 drop-shadow-md">
                Comment jouer
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-red-700 hover:bg-red-600 rounded-full flex items-center justify-center shadow-inner transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-2">
              {CONTROLS.map((c) => (
                <div
                  key={c.keys}
                  className="flex items-center justify-between bg-amber-50/80 border-2 border-amber-700/40 rounded-lg px-3 py-2"
                >
                  <span className="font-bold text-amber-900 text-sm">{c.desc}</span>
                  <kbd className="text-xs font-black text-amber-800 bg-amber-200 border border-amber-700/40 rounded px-2 py-1">
                    {c.keys}
                  </kbd>
                </div>
              ))}

              <p className="text-xs text-amber-900/80 mt-2 leading-snug">
                Les deux boutons en haut de l&apos;écran ouvrent le <strong>Livre de botanique</strong>{" "}
                (espèces découvertes) et le <strong>Carnet de M. Dubois</strong> (liste des espèces à trouver).
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

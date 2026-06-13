"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";

export default function MainMenu() {
  const [mounted, setMounted] = useState(false);
  const { setChapter } = useGameStore();

  useEffect(() => {
    setMounted(true);
  }, []);

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
          onClick={() => setChapter(1)}
          className="group relative flex items-center justify-center p-6 bg-amber-900/80 hover:bg-amber-700/90 border-4 border-amber-600 hover:border-amber-400 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 transform hover:scale-105 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <span className="text-2xl font-bold text-amber-50 uppercase tracking-wide">
            Chapitre 1 : L'Arrivée
          </span>
        </Link>

        <Link 
          href="/village"
          onClick={() => setChapter(2)}
          className="group relative flex items-center justify-center p-6 bg-emerald-900/80 hover:bg-emerald-700/90 border-4 border-emerald-600 hover:border-emerald-400 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 transform hover:scale-105 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <span className="text-2xl font-bold text-emerald-50 uppercase tracking-wide">
            Chapitre 2 : Le Village
          </span>
        </Link>
        
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 z-10 text-amber-200/50 text-sm">
        Hackathon Jeu Parle Français 2026 - OIF
      </div>
    </main>
  );
}

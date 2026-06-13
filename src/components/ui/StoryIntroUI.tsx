"use client";

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';

export default function StoryIntroUI() {
  const { hasSeenVillageIntro, setHasSeenVillageIntro, setInteracting } = useGameStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show intro only once when entering village
    if (!hasSeenVillageIntro) {
      setIsVisible(true);
      setInteracting(true);
    }
  }, [hasSeenVillageIntro, setInteracting]);

  const handleClose = () => {
    setIsVisible(false);
    setHasSeenVillageIntro(true);
    setInteracting(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
      {/* Dimmed background */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>

      {/* Story Board */}
      <div className="relative w-full max-w-2xl bg-amber-900/95 border-4 border-amber-700 rounded-2xl p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-amber-50 backdrop-blur-lg animate-in fade-in zoom-in duration-500 font-story">
        
        <h2 className="text-4xl font-black text-amber-300 mb-6 border-b-2 border-amber-800 pb-4 text-center tracking-wide">
          Chapitre 2 : Le Village
        </h2>
        
        <div className="text-xl font-medium mb-8 leading-relaxed space-y-4">
          <p>
            En explorant la forêt tropicale, Alex a fait une découverte inquiétante : de nombreux arbres coupés et des traces de machines. Les signes de déforestation sont évidents.
          </p>
          <p>
            Tout porte à croire que les habitants du village voisin pourraient être impliqués.
          </p>
          <p className="text-amber-200 italic font-bold">
            "Je dois trouver quelqu'un du village et lui parler pour découvrir la vérité."
          </p>
        </div>

        <button 
          onClick={handleClose}
          className="w-full mt-4 bg-amber-700 hover:bg-amber-600 text-amber-50 font-bold py-4 px-6 rounded-lg shadow-md border-2 border-amber-500 transition-transform transform hover:scale-105 flex items-center justify-center gap-3 text-2xl tracking-widest uppercase"
        >
          <span>Commencer</span>
        </button>
      </div>
    </div>
  );
}

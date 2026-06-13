"use client";

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';

export default function ForestIntroUI() {
  const { hasSeenForestIntro, setHasSeenForestIntro, setInteracting } = useGameStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!hasSeenForestIntro) {
      setIsVisible(true);
      setInteracting(true);
    }
  }, [hasSeenForestIntro, setInteracting]);

  const handleClose = () => {
    setIsVisible(false);
    setHasSeenForestIntro(true);
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
          Chapitre 1 : L'Arrivée
        </h2>
        
        <div className="text-xl font-medium mb-8 leading-relaxed space-y-4">
          <p>
            Alex est un étudiant vietnamien en botanique, en stage dans une organisation de conservation francophone en Afrique centrale.
          </p>
          <p>
            Lors d'une expédition dans une vaste forêt nouvellement découverte, Alex s'est égaré loin de son groupe.
          </p>
          <p className="text-amber-200 italic font-bold">
            "Perdu dans la nature, je dois maintenant explorer les environs, identifier la flore locale pour survivre, et découvrir les mystères de cette forêt."
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

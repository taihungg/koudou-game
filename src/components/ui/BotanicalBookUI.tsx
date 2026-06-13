"use client";

import React, { useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useLearningStore } from '@/store/useLearningStore';
import data from '@/data/learningEntities.json';
import { X, Lock } from 'lucide-react';

export default function BotanicalBookUI() {
  const { isBotanicalBookOpen, setBotanicalBookOpen } = useGameStore();
  const { completedExercises } = useLearningStore();

  const flowers = useMemo(() => data.flowers || [], []);

  if (!isBotanicalBookOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 pointer-events-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={() => setBotanicalBookOpen(false)}
      ></div>

      {/* Book Container */}
      <div className="relative w-full max-w-6xl h-full max-h-[85vh] bg-[#fdf3d8] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-[16px] border-amber-950 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-amber-900 text-amber-50 py-4 px-8 flex justify-between items-center shadow-md z-10 border-b-4 border-amber-950">
          <h2 className="text-3xl font-black font-serif tracking-widest text-amber-200 drop-shadow-md">
            Encyclopédie Botanique
          </h2>
          <button 
            onClick={() => setBotanicalBookOpen(false)}
            className="w-10 h-10 bg-red-700 hover:bg-red-600 rounded-full flex items-center justify-center shadow-inner transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content Area - Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-8 bg-texture-paper">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flowers.map((flower) => {
              const isUnlocked = completedExercises.includes(flower.id) || !flower.exercise;

              return (
                <div 
                  key={flower.id} 
                  className={`relative flex flex-row items-center border-2 rounded-lg p-3 transition-all ${
                    isUnlocked 
                      ? 'bg-amber-50/80 border-amber-700 shadow-md hover:shadow-lg' 
                      : 'bg-gray-200/50 border-gray-400 opacity-80 grayscale'
                  }`}
                >
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-white/50 rounded-md overflow-hidden flex items-center justify-center border border-amber-900/20 mr-4 relative shadow-inner">
                    <img 
                      src={`/assets/flowers_2d/${flower.modelPath.split('/').pop()?.replace('.glb', '.png')}`} 
                      alt="Flower" 
                      className={`w-full h-full object-contain ${!isUnlocked ? 'brightness-50' : ''}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/card/SilverCard.png'; // Fallback
                      }}
                    />
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-gray-800 drop-shadow-md" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {isUnlocked ? (
                      <>
                        <h4 className="text-lg font-bold text-amber-950 truncate font-story">
                          {flower.frenchName}
                        </h4>
                        <p className="text-xs italic text-amber-800 truncate border-b border-amber-900/10 pb-1 mb-1">
                          {flower.scientificName}
                        </p>
                        <p className="text-xs text-amber-900/80 line-clamp-2 leading-tight">
                          {flower.description}
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-col justify-center h-full">
                        <h4 className="text-lg font-bold text-gray-600 font-story">
                          ???
                        </h4>
                        <p className="text-xs text-gray-500 italic mt-1">
                          Espèce non identifiée
                        </p>
                        <p className="text-xs text-gray-500 mt-2 font-semibold">
                          Explorez pour la découvrir !
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

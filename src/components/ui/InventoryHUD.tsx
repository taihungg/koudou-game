"use client";

import React, { useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useLearningStore } from '@/store/useLearningStore';
import data from '@/data/learningEntities.json';
import { BookOpen, NotebookText } from 'lucide-react';

export default function InventoryHUD() {
  const { setBotanicalBookOpen, setDuboisNotebookOpen } = useGameStore();
  const completedExercises = useLearningStore((s) => s.completedExercises);

  const discoveredFlowerCount = useMemo(() => {
    const completedSet = new Set(completedExercises);
    let count = 0;
    for (const flower of data.flowers || []) {
      if (completedSet.has(flower.id)) {
        count++;
      }
    }
    return count;
  }, [completedExercises]);

  const icons = [
    {
      id: "botanical",
      name: "Livre de botanique",
      icon: <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-amber-100" />,
      onClick: () => setBotanicalBookOpen(true),
      bg: "bg-green-800",
      badge: discoveredFlowerCount
    },
    {
      id: "dubois",
      name: "Carnet de M. Dubois",
      icon: <NotebookText className="w-6 h-6 md:w-7 md:h-7 text-amber-100" />,
      onClick: () => setDuboisNotebookOpen(true),
      bg: "bg-blue-800"
    }
  ];

  return (
    <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 flex gap-4 md:gap-6 z-20 pointer-events-auto">
      {icons.map((item) => (
        <div key={item.id} className="relative group">
          {/* Tooltip */}
          <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 bg-amber-950/90 text-amber-100 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-amber-700 pointer-events-none`}>
            {item.name}
          </div>

          {/* Button */}
          <button
            onClick={item.onClick}
            aria-label={item.name}
            className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full ${item.bg} border-2 border-amber-300/50 shadow-lg flex items-center justify-center transform transition-all duration-200 hover:scale-110 hover:shadow-xl hover:border-amber-300`}
          >
            {item.icon}
            {item.badge !== undefined && (
              <span className="absolute -bottom-1 -right-1 min-w-[20px] md:min-w-[22px] h-5 md:h-[22px] px-1 bg-amber-950/95 border-2 border-amber-300 text-amber-100 text-[11px] md:text-xs font-bold rounded-full flex items-center justify-center shadow-md leading-none select-none">
                {item.badge}
              </span>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}


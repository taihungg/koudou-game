"use client";

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { BookOpen, NotebookText } from 'lucide-react';

export default function InventoryHUD() {
  const { setBotanicalBookOpen, setDuboisNotebookOpen } = useGameStore();

  const icons = [
    {
      id: "botanical",
      name: "Livre de botanique",
      icon: <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-amber-100" />,
      onClick: () => setBotanicalBookOpen(true),
      bg: "bg-green-800"
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
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${item.bg} border-2 border-amber-300/50 shadow-lg flex items-center justify-center transform transition-all duration-200 hover:scale-110 hover:shadow-xl hover:border-amber-300`}
          >
            {item.icon}
          </button>
        </div>
      ))}
    </div>
  );
}

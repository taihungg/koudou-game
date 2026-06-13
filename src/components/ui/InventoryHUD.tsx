"use client";

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { BookOpen, NotebookText, HeartPulse, BookDashed } from 'lucide-react';

export default function InventoryHUD() {
  const { setBotanicalBookOpen } = useGameStore();
  const [hovered, setHovered] = useState<string | null>(null);

  const icons = [
    {
      id: "botanical",
      name: "Sách tra cứu thực vật học",
      icon: <BookOpen className="w-8 h-8 text-amber-100" />,
      onClick: () => setBotanicalBookOpen(true),
      bg: "bg-green-800"
    },
    {
      id: "dubois",
      name: "Carnet de M. Dubois",
      icon: <NotebookText className="w-8 h-8 text-amber-100" />,
      onClick: () => alert("Sổ tay của M. Dubois (Chưa khả dụng)"),
      bg: "bg-blue-800"
    },
    {
      id: "firstaid",
      name: "Trousse de premiers secours",
      icon: <HeartPulse className="w-8 h-8 text-amber-100" />,
      onClick: () => alert("Bộ sơ cứu (Chưa khả dụng)"),
      bg: "bg-red-800"
    },
    {
      id: "diary",
      name: "Journal intime",
      icon: <BookDashed className="w-8 h-8 text-amber-100" />,
      onClick: () => alert("Nhật ký (Chưa khả dụng)"),
      bg: "bg-amber-800"
    }
  ];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 flex gap-6 z-[100] pointer-events-auto">
      {icons.map((item) => (
        <div key={item.id} className="relative group">
          {/* Tooltip */}
          <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 bg-amber-950/90 text-amber-100 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-amber-700 pointer-events-none`}>
            {item.name}
          </div>
          
          {/* Button */}
          <button
            onClick={item.onClick}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            className={`w-14 h-14 rounded-full ${item.bg} border-2 border-amber-300/50 shadow-lg flex items-center justify-center transform transition-all duration-200 hover:scale-110 hover:shadow-xl hover:border-amber-300`}
          >
            {item.icon}
          </button>
        </div>
      ))}
    </div>
  );
}

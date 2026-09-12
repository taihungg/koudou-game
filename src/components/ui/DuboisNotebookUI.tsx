"use client";

import React, { useMemo } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useLearningStore } from "@/store/useLearningStore";
import { ZONES } from "@/config/world/chapter1";
import { WORLD_SPECIES } from "@/config/world/species";
import data from "@/data/learningEntities.json";
import { X, CheckCircle2, Lock } from "lucide-react";

/**
 * Carnet de M. Dubois — checklist "X/Y loài đã tìm" theo từng zone của bản đồ
 * Chapter 1 (WORLD_SPECIES, đặt tay theo zone — xem species.ts). Khác
 * BotanicalBookUI (liệt kê CẢ 59 loài trong learningEntities.json, không phân
 * biệt loài nào thực sự xuất hiện trong map), carnet này chỉ theo dõi đúng 19
 * điểm đã thật sự đặt trong thế giới — trả lời câu "tôi đã tìm hết Bosquet
 * médicinal chưa" mà cuốn sách tra cứu chung không trả lời được.
 *
 * Chỉ đọc `speciesId`/`zoneId` (đã ổn định từ P2/P3) và `frenchName` — CỐ Ý
 * không đụng tới các trường mô tả khác (scientificName, description...) vì
 * nội dung thẻ sẽ còn được chỉnh tiếp, danh sách species/zoneId mới là phần
 * không đổi.
 */

const SPECIES_NAME = new Map<string, string>(
  ((data.flowers ?? []) as { id: string; frenchName: string }[]).map((f) => [f.id, f.frenchName]),
);

interface ZoneProgress {
  zoneId: string;
  zoneName: string;
  found: number;
  total: number;
  entries: { id: string; speciesId: string; name: string; found: boolean }[];
}

export default function DuboisNotebookUI() {
  const { isDuboisNotebookOpen, setDuboisNotebookOpen } = useGameStore();
  const completedExercises = useLearningStore((s) => s.completedExercises);

  const zoneProgress = useMemo<ZoneProgress[]>(() => {
    const byZone = new Map<string, typeof WORLD_SPECIES>();
    for (const sp of WORLD_SPECIES) {
      if (!byZone.has(sp.zoneId)) byZone.set(sp.zoneId, []);
      byZone.get(sp.zoneId)!.push(sp);
    }

    // Giữ đúng thứ tự zone như trong chapter1.ts, bỏ qua zone không có loài nào.
    return ZONES.filter((z) => byZone.has(z.id)).map((z) => {
      const placements = byZone.get(z.id)!;
      const entries = placements.map((sp) => ({
        id: sp.id,
        speciesId: sp.speciesId,
        name: SPECIES_NAME.get(sp.speciesId) ?? "???",
        found: completedExercises.includes(sp.speciesId),
      }));
      return {
        zoneId: z.id,
        zoneName: z.name,
        found: entries.filter((e) => e.found).length,
        total: entries.length,
        entries,
      };
    });
  }, [completedExercises]);

  const totalFound = zoneProgress.reduce((sum, z) => sum + z.found, 0);
  const totalSpecies = WORLD_SPECIES.length;

  if (!isDuboisNotebookOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setDuboisNotebookOpen(false)}
      />

      <div className="relative w-full max-w-4xl h-full max-h-[85vh] bg-[#eef4fb] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-[16px] border-blue-950 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-blue-900 text-blue-50 py-4 px-8 flex justify-between items-center shadow-md z-10 border-b-4 border-blue-950">
          <div>
            <h2 className="text-3xl font-black font-serif tracking-widest text-blue-200 drop-shadow-md">
              Carnet de M. Dubois
            </h2>
            <p className="text-sm text-blue-300 font-bold mt-1">
              Espèces répertoriées : {totalFound} / {totalSpecies}
            </p>
          </div>
          <button
            onClick={() => setDuboisNotebookOpen(false)}
            className="w-10 h-10 bg-red-700 hover:bg-red-600 rounded-full flex items-center justify-center shadow-inner transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {zoneProgress.map((zone) => (
            <div key={zone.zoneId} className="bg-white/70 border-2 border-blue-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-blue-950 font-story">{zone.zoneName}</h3>
                <span className="text-sm font-black text-blue-800">
                  {zone.found} / {zone.total}
                </span>
              </div>

              <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${zone.total > 0 ? (zone.found / zone.total) * 100 : 0}%` }}
                />
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {zone.entries.map((entry) => (
                  <li
                    key={entry.id}
                    className={`flex items-center gap-2 text-sm ${
                      entry.found ? "text-blue-950 font-semibold" : "text-gray-400 italic"
                    }`}
                  >
                    {entry.found ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                    <span className="truncate">{entry.found ? entry.name : "???"}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

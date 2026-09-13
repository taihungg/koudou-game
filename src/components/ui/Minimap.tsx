"use client";

import React, { useEffect, useRef } from "react";
import {
  BIOME_GROUND,
  PATHS,
  PATH_GROUND,
  PLAYABLE_HALF,
  RIVER_HALF_WIDTH,
  WATER_GROUND,
  WORLD_HALF,
  ZONES,
} from "@/config/world/chapter1";
import { RIVER_SAMPLES } from "@/config/world/river";
import { WORLD_SPECIES } from "@/config/world/species";
import type { BiomeId } from "@/config/world/types";
import { sampleBiome } from "@/utils/worldSampling";
import { minimapProbe } from "@/components/game/world/MinimapProbe";
import { useLearningStore } from "@/store/useLearningStore";

/**
 * Minimap góc dưới phải — tổng quan bản đồ hữu hạn (kou-dou.md) + chấm vị trí
 * người chơi cập nhật liên tục.
 *
 * Nền tĩnh (zone/lối mòn/sông/vành biên) build MỘT LẦN từ chính config đã
 * dùng để dựng thế giới thật (`chapter1.ts`, `river.ts`) — không phải ảnh vẽ
 * tay riêng, nên sửa bố cục world ở đâu thì minimap tự khớp theo đó, khỏi bảo
 * trì hai nguồn sự thật song song.
 *
 * Chấm người chơi KHÔNG qua React state: đọc trực tiếp `minimapProbe` (module
 * nối từ trong Canvas ra, xem MinimapProbe.tsx) qua vòng lặp
 * requestAnimationFrame rồi mutate style trực tiếp — cùng kỹ thuật
 * WorldDebugHUD.tsx đã dùng, để một chấm đổi vị trí 60 lần/giây không kéo
 * theo re-render cây React DOM.
 */

const VIEW = WORLD_HALF * 2; // world (-WORLD_HALF..WORLD_HALF) -> viewBox (0..VIEW)
const OFFSET = WORLD_HALF;

function wx(x: number) {
  return x + OFFSET;
}
function wz(z: number) {
  return z + OFFSET;
}

/** Tên hiển thị theo biome, suy từ chính ZONES (mỗi zone ứng với một biome). */
const BIOME_LABEL: Partial<Record<BiomeId, string>> = Object.fromEntries(
  ZONES.map((z) => [z.biome, z.name]),
);

function labelAt(x: number, z: number): string {
  const sample = sampleBiome(x, z);
  if (sample.belt) return "Confins de la forêt";
  return BIOME_LABEL[sample.dominant] ?? "Forêt profonde";
}

/**
 * Lớp nền tĩnh — bọc React.memo không props nên mount một lần rồi không bao
 * giờ tính lại, kể cả khi component cha re-render theo chấm người chơi.
 */
const StaticMapLayer = React.memo(function StaticMapLayer() {
  const riverPoints = RIVER_SAMPLES.map(([x, z]) => `${wx(x)},${wz(z)}`).join(" ");

  return (
    <>
      <rect x={0} y={0} width={VIEW} height={VIEW} fill={BIOME_GROUND.deep_canopy} />

      {ZONES.map((zone) => {
        if (zone.shape.type === "circle") {
          const [cx, cz] = zone.shape.center;
          return (
            <circle
              key={zone.id}
              cx={wx(cx)}
              cy={wz(cz)}
              r={zone.shape.radius}
              fill={BIOME_GROUND[zone.biome]}
              opacity={0.85}
            />
          );
        }
        if (zone.shape.type === "rect") {
          const [minX, minZ] = zone.shape.min;
          const [maxX, maxZ] = zone.shape.max;
          return (
            <rect
              key={zone.id}
              x={wx(minX)}
              y={wz(minZ)}
              width={maxX - minX}
              height={maxZ - minZ}
              fill={BIOME_GROUND[zone.biome]}
              opacity={0.85}
            />
          );
        }
        // path (rivière): dải bùn ven bờ, mặt nước thật vẽ sắc nét đè lên sau.
        return (
          <polyline
            key={zone.id}
            points={riverPoints}
            fill="none"
            stroke={BIOME_GROUND[zone.biome]}
            strokeWidth={zone.shape.halfWidth * 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
        );
      })}

      {PATHS.map((path) => (
        <polyline
          key={path.id}
          points={path.points.map(([x, z]) => `${wx(x)},${wz(z)}`).join(" ")}
          fill="none"
          stroke={PATH_GROUND}
          strokeWidth={path.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
      ))}

      <polyline
        points={riverPoints}
        fill="none"
        stroke={WATER_GROUND}
        strokeWidth={RIVER_HALF_WIDTH * 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Vành chắn biên: tô tối phần ngoài PLAYABLE_HALF để đọc ngay "đây là ranh giới đi được". */}
      <path
        d={`M0,0 H${VIEW} V${VIEW} H0 Z M${wx(-PLAYABLE_HALF)},${wz(-PLAYABLE_HALF)} V${wz(PLAYABLE_HALF)} H${wx(PLAYABLE_HALF)} V${wz(-PLAYABLE_HALF)} Z`}
        fill="rgba(0,0,0,0.4)"
        fillRule="evenodd"
      />

      <rect x={0.5} y={0.5} width={VIEW - 1} height={VIEW - 1} fill="none" stroke="#3a2c17" strokeWidth={2} />
    </>
  );
});

export default function Minimap() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const completedExercises = useLearningStore((s) => s.completedExercises);

  useEffect(() => {
    let raf = 0;
    let lastLabel = "";

    const tick = () => {
      const leftPct = (wx(minimapProbe.x) / VIEW) * 100;
      const topPct = (wz(minimapProbe.z) / VIEW) * 100;
      if (dotRef.current) {
        dotRef.current.style.left = `${leftPct}%`;
        dotRef.current.style.top = `${topPct}%`;
      }

      const label = labelAt(minimapProbe.x, minimapProbe.z);
      if (label !== lastLabel && labelRef.current) {
        labelRef.current.textContent = label;
        lastLabel = label;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Chỉ hiển thị chấm vàng cho những cây/loài CHƯA hoàn thành bài tập
  const activeTargets = React.useMemo(() => {
    return WORLD_SPECIES.filter((sp) => !completedExercises.includes(sp.speciesId));
  }, [completedExercises]);

  return (
    <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-10 flex flex-col items-center pointer-events-none">
      <div className="relative h-28 w-28 md:h-36 md:w-36 lg:h-40 lg:w-40 overflow-hidden rounded-xl border-4 border-amber-800/80 bg-[#fdf6e3] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
        <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="h-full w-full">
          <StaticMapLayer />
          {/* Chấm vàng mục tiêu học tập — tự biến mất khi làm đúng bài tập */}
          {activeTargets.map((sp) => (
            <circle
              key={sp.id}
              cx={wx(sp.position[0])}
              cy={wz(sp.position[1])}
              r={4}
              fill="#f5c451"
              stroke="#5c3a12"
              strokeWidth={1.5}
            />
          ))}
        </svg>

        <div
          ref={dotRef}
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ring-2 ring-white shadow-md"
          style={{ left: "50%", top: "50%" }}
        />
      </div>

      <span
        ref={labelRef}
        className="mt-1.5 rounded-full border-2 border-amber-800/60 bg-amber-900/90 px-3 py-1 text-[11px] font-bold text-amber-50 shadow-md"
      >
        Forêt profonde
      </span>
    </div>
  );
}

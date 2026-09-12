"use client";

import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { BIOME_PALETTES } from "@/config/world/biomes";
import { generateChunkVegetation } from "@/utils/vegetationSampling";
import InstancedClutter from "./InstancedClutter";
import VegetationPrimitive from "./VegetationPrimitive";

// Preload mọi model xuất hiện trong palette một lần duy nhất ở module scope —
// đây chính là điều giữ cho việc nạp chunk mới không bị giật hình (CLAUDE.md
// "Assets" + kou-dou.md §22).
const ALL_PALETTE_MODELS = new Set<string>();
for (const palette of Object.values(BIOME_PALETTES)) {
  for (const entry of Object.values(palette)) {
    for (const path of entry.models) ALL_PALETTE_MODELS.add(path);
  }
}
ALL_PALETTE_MODELS.forEach((path) => useGLTF.preload(path));

/** Thực vật của một chunk — truy vấn zone/biome, không random độc lập từng ô. */
export const ChunkVegetation = React.memo(function ChunkVegetation({
  chunkX,
  chunkZ,
}: {
  chunkX: number;
  chunkZ: number;
}) {
  const items = useMemo(() => generateChunkVegetation(chunkX, chunkZ), [chunkX, chunkZ]);

  const clutter = useMemo(() => items.filter((i) => i.category === "clutter"), [items]);
  const individual = useMemo(() => items.filter((i) => i.category !== "clutter"), [items]);

  return (
    <group>
      {individual.map((item) => (
        <VegetationPrimitive key={item.id} item={item} />
      ))}
      <InstancedClutter items={clutter} />
    </group>
  );
});

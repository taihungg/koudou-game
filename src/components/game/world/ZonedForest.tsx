"use client";

import { useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useSearchParams } from "next/navigation";
import { CHUNK_SIZE, RENDER_DISTANCE, TERRAIN_RENDER_DISTANCE, WORLD_HALF } from "@/config/world/chapter1";
import { ISO_CAMERA_OFFSET } from "@/constants/camera";
import { ChunkTerrain } from "./TerrainTiles";
import { ChunkVegetation } from "./ChunkVegetation";
import Bridge from "./Bridge";
import Landmarks from "./Landmarks";
import River from "./River";
import RiverWalls from "./RiverWalls";
import WorldBounds from "./WorldBounds";
import WorldSpecies from "./WorldSpecies";
import { WorldDebugProbe } from "./WorldDebugHUD";

/**
 * Rừng có biên, dựng theo zone (thay cho InfiniteForest ở /forest).
 *
 * Vẫn stream theo chunk như cũ — đó là cơ chế cull rẻ nhất — nhưng nội dung mỗi
 * chunk là TRUY VẤN vào bố cục zone đã author, chứ không phải quay xúc xắc từng
 * vật thể. Chunk nằm ngoài bản đồ thì không dựng gì cả.
 *
 * Terrain và thực vật dùng HAI bán kính chunk khác nhau (xem
 * TERRAIN_RENDER_DISTANCE) — mặt đất rẻ nên trải xa hơn, tránh cảnh cây/bụi
 * hiện ra trước khi có nền dưới chân.
 */

/** Số chunk tính từ tâm ra tới mép bản đồ. */
const MAX_CHUNK = Math.ceil(WORLD_HALF / CHUNK_SIZE);

function chunkRing(centerX: number, centerZ: number, radius: number) {
  const out: { x: number; z: number }[] = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      const x = centerX + dx;
      const z = centerZ + dz;
      if (Math.abs(x) > MAX_CHUNK || Math.abs(z) > MAX_CHUNK) continue;
      out.push({ x, z });
    }
  }
  return out;
}

export default function ZonedForest() {
  const [center, setCenter] = useState({ x: 0, z: 0 });
  const debug = useSearchParams().get("debug") === "1";

  useFrame((state) => {
    // Player đặt camera tại player + ISO_CAMERA_OFFSET trên cả ba trục nên có
    // thể suy ngược ra vị trí người chơi mà không cần truyền ref xuống đây.
    const playerX = state.camera.position.x - ISO_CAMERA_OFFSET;
    const playerZ = state.camera.position.z - ISO_CAMERA_OFFSET;

    const cx = Math.round(playerX / CHUNK_SIZE);
    const cz = Math.round(playerZ / CHUNK_SIZE);

    if (cx !== center.x || cz !== center.z) setCenter({ x: cx, z: cz });
  });

  const terrainChunks = useMemo(
    () => chunkRing(center.x, center.z, TERRAIN_RENDER_DISTANCE),
    [center.x, center.z],
  );
  const vegetationChunks = useMemo(
    () => chunkRing(center.x, center.z, RENDER_DISTANCE),
    [center.x, center.z],
  );

  return (
    <group>
      <WorldBounds />
      <RiverWalls />
      <River />
      <Bridge />
      <Landmarks />
      <WorldSpecies />
      {terrainChunks.map((c) => (
        <ChunkTerrain key={`${c.x}_${c.z}`} chunkX={c.x} chunkZ={c.z} />
      ))}
      {vegetationChunks.map((c) => (
        <ChunkVegetation key={`veg_${c.x}_${c.z}`} chunkX={c.x} chunkZ={c.z} />
      ))}
      {debug && <WorldDebugProbe />}
    </group>
  );
}

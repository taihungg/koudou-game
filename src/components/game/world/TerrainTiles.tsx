"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import {
  BIOME_GROUND,
  CHUNK_SIZE,
  PATH_GROUND,
  TILE,
  WATER_GROUND,
} from "@/config/world/chapter1";
import { sampleBiome } from "@/utils/worldSampling";
import type { BiomeId } from "@/config/world/types";

/**
 * Mặt đất của một chunk.
 *
 * Thay vì lát từng ô tile rời (sẽ lộ đường kẻ ô vuông), mỗi chunk là MỘT lưới
 * duy nhất tô màu theo đỉnh. Màu tại mỗi đỉnh là hàm thuần của toạ độ thế giới
 * nên hai chunk cạnh nhau tự khớp màu ở mép chung, không cần khâu thủ công.
 *
 * Nội suy màu giữa các đỉnh chính là dải chuyển tiếp biome — ranh giới mềm,
 * không bao giờ là một đường thẳng.
 */

const SEGMENTS = CHUNK_SIZE / TILE; // 8 ô mỗi cạnh

// Chuyển màu hex sang linear-space một lần duy nhất lúc nạp module.
const BIOME_COLORS = Object.fromEntries(
  Object.entries(BIOME_GROUND).map(([k, v]) => [k, new THREE.Color(v)]),
) as Record<BiomeId, THREE.Color>;
const PATH_COLOR = new THREE.Color(PATH_GROUND);
const WATER_COLOR = new THREE.Color(WATER_GROUND);

const scratch = new THREE.Color();

function groundColorAt(x: number, z: number, out: THREE.Color): THREE.Color {
  const sample = sampleBiome(x, z);

  let r = 0;
  let g = 0;
  let b = 0;
  for (const key of Object.keys(sample.weights) as BiomeId[]) {
    const w = sample.weights[key]!;
    scratch.copy(BIOME_COLORS[key] ?? BIOME_COLORS.deep_canopy);
    r += scratch.r * w;
    g += scratch.g * w;
    b += scratch.b * w;
  }
  out.setRGB(r, g, b);

  // Lối mòn: đất lộ dần ra khi tiến về tim đường.
  if (sample.path > 0) out.lerp(PATH_COLOR, sample.path * 0.85);
  // Mặt nước đè lên tất cả.
  if (sample.water) out.lerp(WATER_COLOR, 0.9);

  return out;
}

export const ChunkTerrain = React.memo(function ChunkTerrain({
  chunkX,
  chunkZ,
}: {
  chunkX: number;
  chunkZ: number;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, SEGMENTS, SEGMENTS);
    geo.rotateX(-Math.PI / 2);

    const originX = chunkX * CHUNK_SIZE;
    const originZ = chunkZ * CHUNK_SIZE;
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      groundColorAt(originX + pos.getX(i), originZ + pos.getZ(i), color);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [chunkX, chunkZ]);

  // Huỷ geometry khi chunk rời khỏi vùng render, nếu không sẽ rò VRAM khi đi xa.
  React.useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      geometry={geometry}
      position={[chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE]}
      receiveShadow
    >
      <meshStandardMaterial vertexColors flatShading={false} />
    </mesh>
  );
});

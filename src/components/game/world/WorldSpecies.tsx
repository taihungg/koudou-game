"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { WORLD_SPECIES } from "@/config/world/species";
import type { LearningEntityData } from "@/store/useLearningStore";
import { LearningEntity, type LearningItem } from "../LearningEntity";
import { scaleToHeight, TARGET_HEIGHT } from "@/constants/assetScale";
import learningData from "@/data/learningEntities.json";

/**
 * Loài học đặt tay cho vertical slice P1 — cầu nối giữa WORLD_SPECIES (toạ độ
 * + tham chiếu id) và component LearningEntity đã có sẵn (glow ring, sensor,
 * dispatch GLTF/FBX). Không tự vẽ lại — tái dùng nguyên hiện trạng để hành vi
 * tương tác (phím Space, LearningCardUI, XP) giống hệt các loài cũ.
 *
 * Không chunk-stream: chỉ 8 điểm cố định, rẻ hơn nhiều so với hàng trăm vật
 * thể trang trí, nên render một lần duy nhất — giống Landmarks.tsx.
 */

const SPECIES_BY_ID = new Map<string, LearningEntityData>(
  ((learningData.flowers ?? []) as LearningEntityData[]).map((f) => [f.id, f]),
);

const SENSOR_RADIUS = 1.2;

export default function WorldSpecies() {
  const items = useMemo<LearningItem[]>(() => {
    const out: LearningItem[] = [];
    for (const placement of WORLD_SPECIES) {
      const data = SPECIES_BY_ID.get(placement.speciesId);
      if (!data) {
        console.error(`WORLD_SPECIES "${placement.id}": không tìm thấy speciesId "${placement.speciesId}" trong learningEntities.json`);
        continue;
      }
      out.push({
        id: placement.id,
        entityData: data,
        position: [placement.position[0], 0, placement.position[1]],
        rotation: [0, 0, 0],
        scale: scaleToHeight(data.modelPath, TARGET_HEIGHT.LEARNING_ENTITY),
        category: "flower",
        sensorRadius: SENSOR_RADIUS,
      });
    }
    return out;
  }, []);

  return (
    <>
      {items.map((item) => (
        <LearningEntity key={item.id} item={item} />
      ))}
    </>
  );
}

WORLD_SPECIES.forEach((p) => {
  const data = SPECIES_BY_ID.get(p.speciesId);
  if (data) useGLTF.preload(data.modelPath);
});

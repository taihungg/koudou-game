"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import type { GLTF } from "three-stdlib";
import { GAME_ASSETS } from "@/constants/assets";
import { getAssetScale } from "@/constants/assetScale";
import { BRIDGE_NORMAL, BRIDGE_POINT } from "@/config/world/river";

/**
 * Mặt cầu vật lý thật tại BRIDGE_POINT (P3) — trước đây chỗ cầu chỉ là một
 * khoảng hở lội qua được trên tường nước (RiverWalls.tsx), không có sàn gỗ
 * nào để đi trên khô.
 *
 * Mỗi tấm CÓ collider dạng hull (xem BridgeTile bên dưới) — model naturekit có
 * gốc (y=0) nằm ở ĐÁY, mặt ván đi lại nằm cao hơn hẳn y=0 (khớp bờ dốc của tấm
 * "side"), trong khi sàn phẳng của WorldBounds cũng ở y=0. Nếu tấm cầu chỉ là
 * mesh hiển thị không collider, nhân vật vẫn đi trên sàn phẳng y=0 bên dưới,
 * tức là "chìm" dưới mặt ván — đã gặp bug này, sửa bằng cách thêm hull collider
 * để nhân vật thật sự đứng/leo dốc lên trên ván.
 *
 * Ghép 6 tấm theo bộ tile naturekit (kiểu Kenney): side–center×4–side, xếp dọc
 * theo BRIDGE_NORMAL (hướng băng qua sông, vuông góc dòng chảy — đo tại chính
 * BRIDGE_POINT bằng cùng công thức pháp tuyến RiverWalls.tsx đã dùng để xoay
 * tường). Tổng chiều dài 6×5=30 m, dư hẳn so với bề rộng nước 18 m
 * (2×RIVER_HALF_WIDTH) để hai đầu cầu luôn chạm đất khô ở cả hai bờ dù đường
 * cong sông đổi sau này — đã thử 4 tấm (20 m) trước, đầu xa vẫn còn ngập nước
 * ở khúc cua tại BRIDGE_POINT nên tăng lên 6.
 */

const TILE_LEN = 5; // đo thật ~1 unit × scale naturekit (5) — xem assetScale.ts
const M = GAME_ASSETS.MODELS.NATUREKIT;

const TILE_LAYOUT: { model: string; offset: number; flip: boolean }[] = [
  { model: M.BRIDGE_SIDE_WOOD, offset: -2.5, flip: true },
  { model: M.BRIDGE_CENTER_WOOD, offset: -1.5, flip: false },
  { model: M.BRIDGE_CENTER_WOOD, offset: -0.5, flip: false },
  { model: M.BRIDGE_CENTER_WOOD, offset: 0.5, flip: false },
  { model: M.BRIDGE_CENTER_WOOD, offset: 1.5, flip: false },
  { model: M.BRIDGE_SIDE_WOOD, offset: 2.5, flip: false },
];

function BridgeTile({ modelPath, position, rotationY }: { modelPath: string; position: [number, number, number]; rotationY: number }) {
  const { scene } = useGLTF(modelPath) as GLTF;
  const cloned = useMemo(() => scene.clone(), [scene]);
  const scale = getAssetScale(modelPath);

  return (
    // Cùng công thức "rock" trong InfiniteForest.tsx: colliders="hull" tự dựng
    // hình va chạm khớp lưới thật (mặt cầu + dốc lên ở hai đầu tấm "side"), bọc
    // trong <group scale> để hull ra đúng kích thước. BẮT BUỘC phải có collider
    // ở đây — trước đây tấm cầu chỉ là mesh hiển thị, sàn vật lý thật vẫn là mặt
    // đất phẳng bên dưới, nên nhân vật đi lên cầu bị "chìm" dưới mặt ván thay vì
    // đứng trên nó.
    <RigidBody type="fixed" position={position} rotation={[0, rotationY, 0]} colliders="hull">
      <group scale={scale}>
        <primitive object={cloned} castShadow receiveShadow />
      </group>
    </RigidBody>
  );
}

export default function Bridge() {
  // Cùng quy ước z-forward với Player.tsx/RiverWalls.tsx (rotation = atan2(x, z)).
  const baseAngle = Math.atan2(BRIDGE_NORMAL[0], BRIDGE_NORMAL[1]);

  const tiles = useMemo(
    () =>
      TILE_LAYOUT.map((t, i) => {
        const x = BRIDGE_POINT[0] + BRIDGE_NORMAL[0] * t.offset * TILE_LEN;
        const z = BRIDGE_POINT[1] + BRIDGE_NORMAL[1] * t.offset * TILE_LEN;
        return {
          key: `bridge_${i}`,
          modelPath: t.model,
          position: [x, 0, z] as [number, number, number],
          rotationY: t.flip ? baseAngle + Math.PI : baseAngle,
        };
      }),
    [baseAngle],
  );

  return (
    <>
      {tiles.map((t) => (
        <BridgeTile key={t.key} modelPath={t.modelPath} position={t.position} rotationY={t.rotationY} />
      ))}
    </>
  );
}

useGLTF.preload(GAME_ASSETS.MODELS.NATUREKIT.BRIDGE_SIDE_WOOD);
useGLTF.preload(GAME_ASSETS.MODELS.NATUREKIT.BRIDGE_CENTER_WOOD);

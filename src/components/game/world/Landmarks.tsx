"use client";

import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { GLTF } from "three-stdlib";
import { LANDMARKS } from "@/config/world/chapter1";
import type { LandmarkConfig } from "@/config/world/types";

/**
 * Landmark tác giả đặt tay — kou-dou.md §5 Layer 4: mỗi zone quan trọng cần
 * một thứ đáng nhớ để người chơi định vị bằng thị giác, không phải toạ độ.
 *
 * Collider là một hộp bao quanh clearance, không theo đúng hình dạng thật
 * (thân cây đổ nằm chéo, tảng đá bất định hình…) — đơn giản hoá có chủ đích ở
 * P1, đủ để chặn người chơi đi xuyên landmark; tinh chỉnh theo hình dạng thật
 * để dành cho P3 nếu cần.
 */
const LandmarkModel = React.memo(function LandmarkModel({ landmark }: { landmark: LandmarkConfig }) {
  const { scene } = useGLTF(landmark.modelPath) as GLTF;
  const cloned = useMemo(() => scene.clone(), [scene]);
  const half = landmark.clearance * 0.5;

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[landmark.position[0], 0, landmark.position[1]]}
    >
      <CuboidCollider args={[half, 2, half]} position={[0, 2, 0]} />
      <group scale={landmark.scale} rotation={[landmark.rotationX ?? 0, landmark.rotationY ?? 0, 0]}>
        <primitive object={cloned} castShadow receiveShadow />
      </group>
    </RigidBody>
  );
});

export default function Landmarks() {
  return (
    <>
      {LANDMARKS.map((lm) => (
        <LandmarkModel key={lm.id} landmark={lm} />
      ))}
    </>
  );
}

LANDMARKS.forEach((lm) => useGLTF.preload(lm.modelPath));

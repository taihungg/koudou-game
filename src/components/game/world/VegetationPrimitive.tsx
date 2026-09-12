"use client";

import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { CylinderCollider, RigidBody } from "@react-three/rapier";
import type { GLTF } from "three-stdlib";
import type { VegetationItem } from "@/utils/vegetationSampling";

/**
 * Một cây/bụi/prop KHÔNG nằm trong nhóm clutter được instance hoá — số lượng
 * ít hơn nhiều (canopy/understory/shrub/props), nên clone riêng từng cái vẫn
 * rẻ, và cây cần collider nên không hợp instancing đơn giản.
 *
 * Collider trụ đơn giản hoá, không theo đúng hình dạng tán — giống cách
 * InfiniteForest đã làm cho BIG_TREES: "hand-tuned trunk-only collider" rẻ hơn
 * nhiều so với hull theo mesh thật, và người chơi chỉ cần không xuyên qua thân.
 */
const TRUNK_COLLIDER: Partial<Record<VegetationItem["category"], { halfHeight: number; radiusFactor: number }>> = {
  canopy: { halfHeight: 1.8, radiusFactor: 0.32 },
  understory: { halfHeight: 1.2, radiusFactor: 0.28 },
};

const VegetationPrimitive = React.memo(function VegetationPrimitive({ item }: { item: VegetationItem }) {
  const { scene } = useGLTF(item.modelPath) as GLTF;
  const cloned = useMemo(() => scene.clone(), [scene]);
  const trunk = TRUNK_COLLIDER[item.category];

  const model = (
    <group scale={item.scale}>
      <primitive object={cloned} castShadow receiveShadow />
    </group>
  );

  if (!trunk) {
    // Bụi/props: không collider, đúng khuyến nghị hiệu năng của kou-dou.md §22
    // ("ambient clutter generally should not" have colliders).
    return (
      <group position={item.position} rotation={[0, item.rotationY, 0]}>
        {model}
      </group>
    );
  }

  return (
    <RigidBody type="fixed" colliders={false} position={item.position} rotation={[0, item.rotationY, 0]}>
      <CylinderCollider
        args={[trunk.halfHeight, trunk.radiusFactor * item.scale]}
        position={[0, trunk.halfHeight, 0]}
      />
      {model}
    </RigidBody>
  );
});

export default VegetationPrimitive;

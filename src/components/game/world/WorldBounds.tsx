"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { BIOME_GROUND, WORLD_HALF } from "@/config/world/chapter1";

/**
 * Biên vật lý của bản đồ hữu hạn.
 *
 * Tường vô hình đặt SÁT mép ngoài, còn thứ người chơi thật sự nhìn thấy là vành
 * canopy dày 40 m dựng ở P1. Mục tiêu theo kou-dou.md §5: để cây cối truyền đạt
 * ranh giới, đừng để người chơi cảm thấy mình đâm vào kính.
 *
 * Cũng đặt luôn sàn đỡ: InfiniteForest dùng hộp 10000 × 10000 kéo dài vô tận,
 * ở bản đồ có biên thì chỉ cần phủ vừa hết thế giới.
 */

const WALL_HEIGHT = 30;
const WALL_THICKNESS = 4;
const FLOOR_SIZE = WORLD_HALF * 2 + 40;

export default function WorldBounds() {
  const edge = WORLD_HALF - WALL_THICKNESS / 2;

  return (
    <>
      {/* Sàn đỡ, nằm ngay dưới lớp terrain để không bao giờ rơi xuyên. */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[FLOOR_SIZE / 2, 0.5, FLOOR_SIZE / 2]} position={[0, -0.5, 0]} />
        <mesh position={[0, -0.55, 0]} receiveShadow>
          <boxGeometry args={[FLOOR_SIZE, 1, FLOOR_SIZE]} />
          <meshStandardMaterial color={BIOME_GROUND.deep_canopy} />
        </mesh>
      </RigidBody>

      {/* Bốn tường vô hình. */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[WORLD_HALF, WALL_HEIGHT / 2, WALL_THICKNESS / 2]}
          position={[0, WALL_HEIGHT / 2, -edge]}
        />
        <CuboidCollider
          args={[WORLD_HALF, WALL_HEIGHT / 2, WALL_THICKNESS / 2]}
          position={[0, WALL_HEIGHT / 2, edge]}
        />
        <CuboidCollider
          args={[WALL_THICKNESS / 2, WALL_HEIGHT / 2, WORLD_HALF]}
          position={[-edge, WALL_HEIGHT / 2, 0]}
        />
        <CuboidCollider
          args={[WALL_THICKNESS / 2, WALL_HEIGHT / 2, WORLD_HALF]}
          position={[edge, WALL_HEIGHT / 2, 0]}
        />
      </RigidBody>
    </>
  );
}

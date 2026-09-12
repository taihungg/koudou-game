"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { BRIDGE_WIDTH, RIVER_HALF_WIDTH } from "@/config/world/chapter1";
import { BRIDGE_POINT, RIVER_SAMPLES } from "@/config/world/river";

/**
 * Tường vô hình bám theo đường cong của sông (river.ts), chừa một khoảng hở
 * duy nhất ở BRIDGE_POINT.
 *
 * Không thể dùng 2 hộp dài như hồi sông còn thẳng — sông giờ uốn lượn nên tường
 * phải là một chuỗi đoạn ngắn nối theo từng cặp điểm mẫu của đường cong, mỗi
 * đoạn xoay đúng theo hướng cục bộ tại đó.
 */

const WALL_HEIGHT = 4;
const WALL_THICKNESS = 2;
/** Chồng nhẹ lên độ dài từng đoạn để không hở khe ở chỗ nối giữa hai đoạn. */
const OVERLAP = 0.3;

interface WallSegment {
  x: number;
  z: number;
  length: number;
  angle: number;
}

/** `side`: +1 là bờ bên phải hướng đi của sông, -1 là bờ bên trái. */
function buildBankSegments(side: 1 | -1): WallSegment[] {
  const segments: WallSegment[] = [];

  for (let i = 0; i < RIVER_SAMPLES.length - 1; i++) {
    const [ax, az] = RIVER_SAMPLES[i];
    const [bx, bz] = RIVER_SAMPLES[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const length = Math.hypot(dx, dz);
    if (length < 1e-4) continue;

    // Pháp tuyến đơn vị, vuông góc hướng đi của đoạn — dùng để đẩy tường ra
    // hai bên bờ cách tim sông đúng RIVER_HALF_WIDTH.
    const nx = (-dz / length) * side;
    const nz = (dx / length) * side;
    const midX = (ax + bx) / 2 + nx * RIVER_HALF_WIDTH;
    const midZ = (az + bz) / 2 + nz * RIVER_HALF_WIDTH;

    if (Math.hypot(midX - BRIDGE_POINT[0], midZ - BRIDGE_POINT[1]) < BRIDGE_WIDTH / 2) continue;

    // Cùng quy ước z-forward với Player.tsx (rotationRef = atan2(x, z)).
    segments.push({ x: midX, z: midZ, length, angle: Math.atan2(dx, dz) });
  }

  return segments;
}

export default function RiverWalls() {
  const segments = [...buildBankSegments(1), ...buildBankSegments(-1)];

  return (
    <RigidBody type="fixed" colliders={false}>
      {segments.map((s, i) => (
        <CuboidCollider
          key={i}
          args={[WALL_THICKNESS / 2, WALL_HEIGHT / 2, s.length / 2 + OVERLAP]}
          position={[s.x, WALL_HEIGHT / 2, s.z]}
          rotation={[0, s.angle, 0]}
        />
      ))}
    </RigidBody>
  );
}

"use client";

import { RigidBody } from "@react-three/rapier";
import InfiniteForest from "./InfiniteForest";

export default function Environment() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Infinite Chunk-based Forest */}
      <InfiniteForest />
    </>
  );
}

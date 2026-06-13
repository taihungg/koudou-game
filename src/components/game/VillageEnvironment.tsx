"use client";

import { RigidBody } from "@react-three/rapier";
import InfiniteForest from "./InfiniteForest";
import StaticVillage from "./StaticVillage";

export default function VillageEnvironment() {
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

      {/* Static Village at center */}
      <StaticVillage />

      {/* Infinite Chunk-based Forest, with a clear radius of 80 for the village */}
      <InfiniteForest clearRadius={80} />
    </>
  );
}

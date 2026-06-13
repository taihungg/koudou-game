"use client";

import React, { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CylinderCollider } from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";
import { GAME_ASSETS } from "@/constants/assets";
import { hashCoordinates, mulberry32 } from "@/utils/random";

const CHUNK_SIZE = 40;
const RENDER_DISTANCE = 2; // Render 2 chunks in each direction (5x5 chunks total)
const ITEMS_PER_CHUNK = 100; // Density of items per chunk

// Categorize assets dynamically
const BIG_TREES = [
  ...Object.values(GAME_ASSETS.MODELS.FOREST1).filter(p => p.includes('/Tree_1') || p.includes('/Tree_2') || p.includes('/Tree_3') || p.includes('/Tree_4')),
];

const BUSHES = [
  ...Object.values(GAME_ASSETS.MODELS.FOREST).filter(p => p.includes('/Bush')),
  ...Object.values(GAME_ASSETS.MODELS.FOREST1).filter(p => p.includes('/Bush')),
  ...Object.values(GAME_ASSETS.MODELS.TREES).filter(p => p.includes('/_bush')),
];

const ROCKS = [
  ...Object.values(GAME_ASSETS.MODELS.FOREST).filter(p => p.includes('/Rock')),
  ...Object.values(GAME_ASSETS.MODELS.FOREST1).filter(p => p.includes('/Rock')),
  ...Object.values(GAME_ASSETS.MODELS.TREES).filter(p => p.includes('/_stone')),
];

const FOLIAGE = [
  ...Object.values(GAME_ASSETS.MODELS.FOREST).filter(p => p.includes('/Flower') || p.includes('/Grass') || p.includes('/Mushroom')),
  ...Object.values(GAME_ASSETS.MODELS.FOREST1).filter(p => p.includes('/Grass')),
  ...Object.values(GAME_ASSETS.MODELS.TREES).filter(p => p.includes('/_flower') || p.includes('/_grass') || p.includes('/_mashroom')),
];

// Preload all used models to prevent lag spikes when new chunks load
[...BIG_TREES, ...BUSHES, ...ROCKS, ...FOLIAGE].forEach((url) => {
  useGLTF.preload(url);
});

// A single item in the forest
const ForestItem = React.memo(({ item }: { item: any }) => {
  const { scene } = useGLTF(item.path) as any;
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  if (item.type === "tree") {
    return (
      <RigidBody type="fixed" position={item.position} rotation={item.rotation} colliders={false}>
        {/* Optimize tree collision: Only collide with the trunk, ignore leaves. Args: [halfHeight, radius] */}
        <CylinderCollider args={[2.0, 0.4 * item.scale]} position={[0, 2.0, 0]} />
        <group scale={item.scale}>
          <primitive object={clonedScene} castShadow receiveShadow />
        </group>
      </RigidBody>
    );
  }

  if (item.type === "rock") {
    return (
      <RigidBody type="fixed" position={item.position} rotation={item.rotation} colliders="hull">
        {/* Wrap primitive in scaled group so Rapier generates the correct hull size */}
        <group scale={item.scale}>
          <primitive object={clonedScene} castShadow receiveShadow />
        </group>
      </RigidBody>
    );
  }

  // Foliage and bushes don't have physics colliders to save performance
  return (
    <primitive 
      object={clonedScene} 
      position={item.position} 
      rotation={item.rotation} 
      scale={item.scale} 
      castShadow 
      receiveShadow 
    />
  );
});
ForestItem.displayName = "ForestItem";

// A Chunk of the forest
const ForestChunk = React.memo(({ chunkX, chunkZ }: { chunkX: number; chunkZ: number }) => {
  const items = useMemo(() => {
    const chunkSeed = hashCoordinates(chunkX, chunkZ, 12345);
    const rng = mulberry32(chunkSeed);
    const generatedItems = [];

    const startX = chunkX * CHUNK_SIZE;
    const startZ = chunkZ * CHUNK_SIZE;

    for (let i = 0; i < ITEMS_PER_CHUNK; i++) {
      // Random position within chunk
      const x = startX + (rng() - 0.5) * CHUNK_SIZE;
      const z = startZ + (rng() - 0.5) * CHUNK_SIZE;

      // Keep center (spawn area) relatively clear
      if (Math.abs(x) < 5 && Math.abs(z) < 5 && chunkX === 0 && chunkZ === 0) continue;

      const randType = rng();
      let categoryArray;
      let type;
      let scaleRange = [0.8, 1.3];

      if (randType < 0.2) {
        categoryArray = BIG_TREES;
        type = "tree";
        scaleRange = [1.0, 1.8];
      } else if (randType < 0.35) {
        categoryArray = ROCKS;
        type = "rock";
        scaleRange = [0.5, 2.0];
      } else if (randType < 0.5) {
        categoryArray = BUSHES;
        type = "bush";
        scaleRange = [0.7, 1.4];
      } else {
        categoryArray = FOLIAGE;
        type = "foliage";
        scaleRange = [0.5, 1.2];
      }

      if (categoryArray.length === 0) continue;

      const path = categoryArray[Math.floor(rng() * categoryArray.length)];
      const rotation = [0, rng() * Math.PI * 2, 0] as [number, number, number];
      const scale = scaleRange[0] + rng() * (scaleRange[1] - scaleRange[0]);

      generatedItems.push({
        id: `${chunkX}_${chunkZ}_${i}`,
        path,
        position: [x, 0, z] as [number, number, number],
        rotation,
        scale,
        type
      });
    }

    return generatedItems;
  }, [chunkX, chunkZ]);

  return (
    <group>
      {items.map((item) => (
        <ForestItem key={item.id} item={item} />
      ))}
    </group>
  );
});
ForestChunk.displayName = "ForestChunk";

export default function InfiniteForest() {
  const [currentChunk, setCurrentChunk] = useState({ x: 0, z: 0 });

  useFrame((state) => {
    // Determine player's current chunk based on camera target / player position
    // Since we don't have direct access to the player's rigid body here easily, 
    // we can use the camera's looking target or position (camera is offset by +20, +20, +20 from player)
    const playerX = state.camera.position.x - 20;
    const playerZ = state.camera.position.z - 20;

    const chunkX = Math.round(playerX / CHUNK_SIZE);
    const chunkZ = Math.round(playerZ / CHUNK_SIZE);

    if (chunkX !== currentChunk.x || chunkZ !== currentChunk.z) {
      setCurrentChunk({ x: chunkX, z: chunkZ });
    }
  });

  const chunksToRender = useMemo(() => {
    const chunks = [];
    for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
      for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
        chunks.push({ x: currentChunk.x + x, z: currentChunk.z + z });
      }
    }
    return chunks;
  }, [currentChunk.x, currentChunk.z]);

  return (
    <group>
      {/* Infinite Floor (Extremely large to prevent falling off) */}
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[10000, 1, 10000]} />
          <meshStandardMaterial color="#2d4a22" /> {/* Deep forest green */}
        </mesh>
      </RigidBody>

      {/* Render Chunks */}
      {chunksToRender.map((chunk) => (
        <ForestChunk key={`${chunk.x}_${chunk.z}`} chunkX={chunk.x} chunkZ={chunk.z} />
      ))}
    </group>
  );
}

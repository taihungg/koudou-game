"use client";

import { RigidBody } from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";

import { GAME_ASSETS } from "@/constants/assets";

// Wrapper component to load and clone the Tree GLTF
function TreeModel({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF(GAME_ASSETS.MODELS.FOREST1.TREE_1_A_COLOR1);
  return (
    <RigidBody type="fixed" position={position} colliders="hull">
      <primitive object={scene.clone()} castShadow receiveShadow />
    </RigidBody>
  );
}

// Wrapper component for a Rock
function RockModel({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF(GAME_ASSETS.MODELS.FOREST1.ROCK_1_A_COLOR1);
  return (
    <RigidBody type="fixed" position={position} colliders="hull">
      <primitive object={scene.clone()} castShadow receiveShadow />
    </RigidBody>
  );
}

// Wrapper component for a Bush
function BushModel({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF(GAME_ASSETS.MODELS.FOREST1.BUSH_1_A_COLOR1);
  return (
    <RigidBody type="fixed" position={position} colliders="hull">
      <primitive object={scene.clone()} castShadow receiveShadow />
    </RigidBody>
  );
}


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

      {/* Ground (keeping the simple green box for the floor for now) */}
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[50, 1, 50]} />
          <meshStandardMaterial color="#86efac" /> {/* Lighter tailwind green */}
        </mesh>
      </RigidBody>

      {/* Scattered Nature Models from KayKit */}
      <TreeModel position={[5, 0, -5]} />
      <TreeModel position={[-8, 0, -3]} />
      <TreeModel position={[4, 0, 8]} />

      <RockModel position={[-3, 0, 2]} />
      <RockModel position={[7, 0, -2]} />

      <BushModel position={[-5, 0, -6]} />
      <BushModel position={[2, 0, 5]} />
    </>
  );
}

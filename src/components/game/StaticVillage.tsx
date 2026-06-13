import React, { useMemo } from "react";
import { RigidBody, CylinderCollider, CuboidCollider } from "@react-three/rapier";
import { useGLTF, useAnimations } from "@react-three/drei";
import { GAME_ASSETS } from "@/constants/assets";
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { useDialogueStore } from "@/store/useDialogueStore";

const NUM_HOUSES = 20;

// Reusable NPC Component
interface NPCProps {
  modelUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

function NPCCharacter({ modelUrl, position, rotation }: NPCProps) {
  const characterGltf = useGLTF(modelUrl);
  const generalAnimations = useGLTF(GAME_ASSETS.MODELS.CHARACTERS.ANIMATIONS_RIG_MEDIUM_GENERAL);
  
  const character = useMemo(() => {
    const clone = SkeletonUtils.clone(characterGltf.scene);
    clone.traverse((node: any) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    // Scale up NPC slightly if needed, but houses are what was requested to scale up.
    return clone;
  }, [characterGltf.scene]);

  const groupRef = React.useRef<THREE.Group>(null);
  const { actions } = useAnimations(generalAnimations.animations, groupRef);

  React.useEffect(() => {
    if (actions && actions["Idle_A"]) {
      actions["Idle_A"].reset().fadeIn(0.2).play();
    }
  }, [actions]);

  return (
    <RigidBody type="fixed" position={position} rotation={rotation} colliders={false}>
      <CylinderCollider args={[0.8, 0.4]} position={[0, 0.8, 0]} />
      <group ref={groupRef} position={[0, 0, 0]}>
        <primitive object={character} />
      </group>
    </RigidBody>
  );
}

// Interactable NPC Component
function InteractableNPC({ modelUrl, position, rotation, npcId }: NPCProps & { npcId: string }) {
  const { setNearbyNPCId } = useDialogueStore();
  const characterGltf = useGLTF(modelUrl);
  const generalAnimations = useGLTF(GAME_ASSETS.MODELS.CHARACTERS.ANIMATIONS_RIG_MEDIUM_GENERAL);
  
  const character = useMemo(() => {
    const clone = SkeletonUtils.clone(characterGltf.scene);
    clone.traverse((node: any) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return clone;
  }, [characterGltf.scene]);

  const groupRef = React.useRef<THREE.Group>(null);
  const { actions } = useAnimations(generalAnimations.animations, groupRef);

  React.useEffect(() => {
    if (actions && actions["Idle_A"]) {
      actions["Idle_A"].reset().fadeIn(0.2).play();
    }
  }, [actions]);

  const handleEnter = () => {
    setNearbyNPCId(npcId);
  };

  const handleExit = () => {
    setNearbyNPCId(null);
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Fake glowing aura */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[4.0, 8, 8]} />
        <meshBasicMaterial color="#ffeb3b" transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.8, 0.4]} position={[0, 0.8, 0]} />
        <group ref={groupRef} position={[0, 0, 0]}>
          <primitive object={character} />
        </group>
      </RigidBody>
      
      <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleEnter} onIntersectionExit={handleExit}>
        <CylinderCollider args={[2.0, 5.0]} position={[0, 1.0, 0]} />
      </RigidBody>
    </group>
  );
}

// Preload models
useGLTF.preload(GAME_ASSETS.MODELS.OBJECTS.HOUSE);
useGLTF.preload(GAME_ASSETS.MODELS.OBJECTS.WELL);
useGLTF.preload(GAME_ASSETS.MODELS.OBJECTS.MARKET);
useGLTF.preload(GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_BARBARIAN);
useGLTF.preload(GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_KNIGHT);
useGLTF.preload(GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_MAGE);
useGLTF.preload(GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_RANGER);
useGLTF.preload(GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_ROGUE_HOODED);
useGLTF.preload(GAME_ASSETS.MODELS.OBJECTS.FARM_PLOT);
useGLTF.preload(GAME_ASSETS.MODELS.OBJECTS.LUMBERMILL);
useGLTF.preload(GAME_ASSETS.MODELS.OBJECTS.WATCHTOWER);

// Village building Component
function VillageBuilding({ url, position, rotation, scale = 1, colliderArgs = [2, 2, 2] }: any) {
  const { scene } = useGLTF(url) as any;
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return (
    <RigidBody type="fixed" position={position} rotation={rotation} colliders={false}>
      <CuboidCollider args={colliderArgs} position={[0, colliderArgs[1], 0]} />
      <group scale={scale}>
        <primitive object={clonedScene} />
      </group>
    </RigidBody>
  );
}

export default function StaticVillage() {
  const houses = useMemo(() => {
    const arr = [];
    const positions = [
      // Grid cells to place houses, skipping center [0,0] and inner cross
      [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2],
      [-2, -1], [2, -1],
      [-2,  0], [2,  0],
      [-2,  1], [2,  1],
      [-2,  2], [-1,  2], [0,  2], [1,  2], [2,  2],
      // Add a few more in inner spots
      [-1, -1], [1, -1], [-1, 1], [1, 1],
      // Add 2 more houses
      [0, -1], [0, 1]
    ]; // 22 spots total

    const cellSize = 30; // 30 units between houses

    positions.forEach((pos, i) => {
      const x = pos[0] * cellSize + (Math.random() * 8 - 4);
      const z = pos[1] * cellSize + (Math.random() * 8 - 4);
      // Houses loosely face the origin (center plaza)
      const rotY = Math.atan2(x, z) + Math.PI + (Math.random() * 0.4 - 0.2);

      arr.push({
        id: `house_${i}`,
        position: [x, 0, z] as [number, number, number],
        rotation: [0, rotY, 0] as [number, number, number],
      });
    });
    return arr;
  }, []);

  const npcs = useMemo(() => {
    const npcModels = [
      GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_BARBARIAN,
      GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_KNIGHT,
      GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_MAGE,
      GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_RANGER,
      GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_ROGUE_HOODED,
    ];

    return npcModels.map((model, i) => {
      const house = houses[i * 4]; // Spread them out among the houses
      const dist = 6;
      const hx = house.position[0];
      const hz = house.position[2];
      const len = Math.sqrt(hx*hx + hz*hz);
      const nx = hx - (hx/len) * dist;
      const nz = hz - (hz/len) * dist;

      return {
        id: `npc_${i}`,
        modelUrl: model,
        position: [nx, 0, nz] as [number, number, number],
        rotation: [0, house.rotation[1], 0] as [number, number, number],
      };
    });
  }, [houses]);

  return (
    <group>
      {/* Centerpiece: A Well */}
      <VillageBuilding 
        url={GAME_ASSETS.MODELS.OBJECTS.WELL} 
        position={[0, 0, 0]} 
        rotation={[0, 0, 0]} 
        scale={4.0}
        colliderArgs={[3, 2, 3]}
      />

      {/* A Market to the side of the well */}
      <VillageBuilding 
        url={GAME_ASSETS.MODELS.OBJECTS.MARKET} 
        position={[15, 0, 0]} 
        rotation={[0, -Math.PI / 2, 0]} 
        scale={3.5}
        colliderArgs={[5, 4, 4]}
      />

      {/* NPC standing next to the Market (Interactable Kofi) */}
      <InteractableNPC
        npcId="kofi"
        modelUrl={GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_MAGE}
        position={[10, 0, 3]}
        rotation={[0, Math.PI / 4, 0]}
      />

      {/* Decorations */}
      <VillageBuilding 
        url={GAME_ASSETS.MODELS.OBJECTS.FARM_PLOT} 
        position={[-15, 0, 15]} 
        rotation={[0, 0, 0]} 
        scale={3.0}
        colliderArgs={[6, 1, 6]}
      />
      <VillageBuilding 
        url={GAME_ASSETS.MODELS.OBJECTS.LUMBERMILL} 
        position={[-20, 0, -10]} 
        rotation={[0, Math.PI / 3, 0]} 
        scale={3.0}
        colliderArgs={[6, 4, 6]}
      />
      <VillageBuilding 
        url={GAME_ASSETS.MODELS.OBJECTS.WATCHTOWER} 
        position={[0, 0, -25]} 
        rotation={[0, 0, 0]} 
        scale={3.0}
        colliderArgs={[3, 10, 3]}
      />

      {/* Houses */}
      {houses.map((house) => (
        <VillageBuilding
          key={house.id}
          url={GAME_ASSETS.MODELS.OBJECTS.HOUSE}
          position={house.position}
          rotation={house.rotation}
          scale={3.5}
          colliderArgs={[6, 6, 6]}
        />
      ))}

      {/* NPCs */}
      {npcs.map((npc) => (
        <NPCCharacter
          key={npc.id}
          modelUrl={npc.modelUrl}
          position={npc.position}
          rotation={npc.rotation}
        />
      ))}
    </group>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RigidBody, CylinderCollider } from "@react-three/rapier";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { GAME_ASSETS } from "@/constants/assets";
import { VILLAGER_DIALOGUE_SCENE, type VillagerNPCConfig } from "@/config/world/chapter1";
import { useVillagersDialogueStore } from "@/store/useVillagersDialogueStore";

/**
 * Deux habitants figés en pleine discussion — même recette clone-et-joue-
 * Idle_A que `NPCCharacter` dans `StaticVillage.tsx`, réutilisée ici pour
 * `/forest`. Pas de branche de dialogue : ils sont juste un point d'écoute
 * qui ouvre `VillagerListeningUI`.
 */
function Villager({ modelUrl, position, rotationY }: Pick<VillagerNPCConfig, "modelUrl" | "position" | "rotationY">) {
  const characterGltf = useGLTF(modelUrl);
  const rig = useGLTF(GAME_ASSETS.MODELS.CHARACTERS.ANIMATIONS_RIG_MEDIUM_GENERAL);

  const character = useMemo(() => {
    const clone = SkeletonUtils.clone(characterGltf.scene);
    clone.traverse((node: THREE.Object3D) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return clone;
  }, [characterGltf.scene]);

  const groupRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(rig.animations, groupRef);

  useEffect(() => {
    actions?.["Idle_A"]?.reset().fadeIn(0.2).play();
  }, [actions]);

  return (
    <RigidBody type="fixed" position={[position[0], 0, position[1]]} rotation={[0, rotationY, 0]} colliders={false}>
      <CylinderCollider args={[0.8, 0.4]} position={[0, 0.8, 0]} />
      <group ref={groupRef}>
        <primitive object={character} />
      </group>
    </RigidBody>
  );
}

export default function VillagersDialogueScene() {
  const setNearby = useVillagersDialogueStore((s) => s.setNearby);
  const { npcs, sensor } = VILLAGER_DIALOGUE_SCENE;

  // Scène fixe, jamais démontée (pas de chunk streaming) — pas de garde par id
  // comme LearningEntity/InteractableNPC en ont besoin, juste un reset au cas
  // où le composant serait démonté (HMR, changement de route).
  useEffect(() => () => setNearby(false), [setNearby]);

  return (
    <group>
      {npcs.map((npc) => (
        <Villager key={npc.id} modelUrl={npc.modelUrl} position={npc.position} rotationY={npc.rotationY} />
      ))}

      {/* Marqueur discret pour signaler la zone d'écoute sans dupliquer les
          halos jaunes déjà utilisés par LearningEntity/InteractableNPC. */}
      <mesh position={[sensor.position[0], 1.4, sensor.position[1]]}>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshBasicMaterial color="#9be564" transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <RigidBody
        type="fixed"
        colliders={false}
        sensor
        position={[sensor.position[0], 1, sensor.position[1]]}
        onIntersectionEnter={() => setNearby(true)}
        onIntersectionExit={() => setNearby(false)}
      >
        <CylinderCollider args={[3, sensor.radius]} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload(GAME_ASSETS.MODELS.CHARACTERS.ANIMATIONS_RIG_MEDIUM_GENERAL);
VILLAGER_DIALOGUE_SCENE.npcs.forEach((n) => useGLTF.preload(n.modelUrl));

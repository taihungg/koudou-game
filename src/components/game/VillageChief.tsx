"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CylinderCollider, RigidBody } from "@react-three/rapier";
import { useAnimations, useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { GAME_ASSETS } from "@/constants/assets";
import { VILLAGE_CHIEF } from "@/config/world/village";
import { useChiefDialogueStore } from "@/store/useChiefDialogueStore";

/**
 * Le chef du Village de Koudou.
 *
 * Il vit DANS la carte du Chapitre 1, sur la place au bout de la rue
 * principale — il n'y a pas de changement de scène : le quartier construit à
 * l'est de la carte EST le village. Position et orientation viennent de
 * `VILLAGE_CHIEF` (`src/config/world/village.ts`), avec le reste du plan du
 * village, pour qu'un seul fichier décrive où se trouve quoi.
 *
 * Le halo doré reprend celui d'`InteractableNPC` dans `StaticVillage.tsx` —
 * c'est déjà, dans ce jeu, le signe « on peut parler à celui-ci ».
 *
 * Même recette clone-et-joue-Idle_A que les autres PNJ. `SkeletonUtils.clone`
 * est obligatoire : un `.clone()` normal casse le binding des os.
 */

export default function VillageChief() {
  const setNearby = useChiefDialogueStore((s) => s.setNearby);

  const characterGltf = useGLTF(GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_ROGUE_HOODED);
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

  // Scène fixe, jamais streamée par chunk — pas besoin de garde par id comme
  // LearningEntity, juste une remise à zéro si le composant est démonté
  // (changement de route, HMR) pour ne pas laisser le prompt collé à l'écran.
  useEffect(() => () => setNearby(false), [setNearby]);

  const [x, z] = VILLAGE_CHIEF.position;

  return (
    <group position={[x, 0, z]} rotation={[0, VILLAGE_CHIEF.rotationY, 0]}>
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[4, 8, 8]} />
        <meshBasicMaterial
          color="#ffeb3b"
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.8, 0.4]} position={[0, 0.8, 0]} />
        <group ref={groupRef}>
          <primitive object={character} />
        </group>
      </RigidBody>

      <RigidBody
        type="fixed"
        colliders={false}
        sensor
        onIntersectionEnter={() => setNearby(true)}
        onIntersectionExit={() => setNearby(false)}
      >
        <CylinderCollider args={[2, VILLAGE_CHIEF.sensorRadius]} position={[0, 1, 0]} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload(GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_ROGUE_HOODED);
useGLTF.preload(GAME_ASSETS.MODELS.CHARACTERS.ANIMATIONS_RIG_MEDIUM_GENERAL);

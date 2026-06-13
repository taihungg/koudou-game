import React, { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CylinderCollider } from "@react-three/rapier";
import { useGLTF, useFBX, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useLearningStore, LearningEntityData } from "@/store/useLearningStore";

interface LearningItem {
  id: string; // The instance id
  entityData: LearningEntityData; // The data from json
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  category: "flower" | "animal";
  sensorRadius: number;
}

const LearningGLTF = ({ item }: { item: LearningItem }) => {
  const { scene } = useGLTF(item.entityData.modelPath) as any;
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const { setNearbyEntity } = useLearningStore();

  const handleEnter = () => {
    setNearbyEntity(item.entityData);
  };

  useEffect(() => {
    return () => {
      if (useLearningStore.getState().nearbyEntity?.id === item.entityData.id) {
        useLearningStore.getState().setNearbyEntity(null);
      }
    };
  }, [item.entityData.id]);

  const handleExit = () => {
    setNearbyEntity(null);
  };

  return (
    <group position={item.position} rotation={item.rotation} scale={item.scale}>
      {/* Fake glowing aura (optimized, no real light) */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[item.sensorRadius * 0.8, 8, 8]} />
        <meshBasicMaterial color="#ffeb3b" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Bright ring on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[item.sensorRadius * 0.8, item.sensorRadius, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} depthWrite={false} />
      </mesh>

      <primitive object={clonedScene} castShadow receiveShadow />
      <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleEnter} onIntersectionExit={handleExit}>
        <CylinderCollider args={[2.0, item.sensorRadius]} position={[0, 1.0, 0]} />
      </RigidBody>
    </group>
  );
};

const LearningFBX = ({ item }: { item: LearningItem }) => {
  const fbx = useFBX(item.entityData.modelPath);
  const clonedScene = useMemo(() => fbx.clone(), [fbx]);
  const groupRef = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(fbx.animations, groupRef);
  const { setNearbyEntity } = useLearningStore();

  useEffect(() => {
    // Play idle animation if available
    const idleAnimName = names?.find(n => n.toLowerCase().includes('idle')) || names?.[0];
    if (idleAnimName && actions[idleAnimName]) {
      actions[idleAnimName].play();
    }
  }, [actions, names]);

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  const handleEnter = () => {
    setNearbyEntity(item.entityData);
  };

  useEffect(() => {
    return () => {
      if (useLearningStore.getState().nearbyEntity?.id === item.entityData.id) {
        useLearningStore.getState().setNearbyEntity(null);
      }
    };
  }, [item.entityData.id]);

  const handleExit = () => {
    setNearbyEntity(null);
  };

  return (
    <group position={item.position} rotation={item.rotation} scale={item.scale}>
      <group ref={groupRef}>
        {/* Scale down FBX because they are usually huge */}
        <primitive object={clonedScene} scale={0.01} />
      </group>
      <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleEnter} onIntersectionExit={handleExit}>
        <CylinderCollider args={[5.0, item.sensorRadius]} position={[0, 2.5, 0]} />
      </RigidBody>
    </group>
  );
};

export const LearningEntity = React.memo(({ item }: { item: LearningItem }) => {
  const isFbx = item.entityData.modelPath.toLowerCase().endsWith('.fbx');

  if (isFbx) {
    return <LearningFBX item={item} />;
  }
  return <LearningGLTF item={item} />;
});

LearningEntity.displayName = "LearningEntity";

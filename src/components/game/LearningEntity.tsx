import React, { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CylinderCollider } from "@react-three/rapier";
import { useGLTF, useFBX, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useLearningStore, LearningEntityData } from "@/store/useLearningStore";
import { registerRadarEntity, unregisterRadarEntity } from "@/components/game/world/CompassRadar";

export interface LearningItem {
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
  const setNearbyEntity = useLearningStore((s) => s.setNearbyEntity);
  const isCompleted = useLearningStore((s) => s.completedExercises.includes(item.entityData.id));

  const handleEnter = () => {
    if (!isCompleted) {
      setNearbyEntity(item.entityData);
    }
  };

  const handleExit = () => {
    const state = useLearningStore.getState();
    // Không xoá nếu tab card đang mở cho thực thể này
    if (state.activeEntity?.id === item.entityData.id) return;
    if (state.nearbyEntity?.id === item.entityData.id) {
      state.setNearbyEntity(null);
    }
  };

  useEffect(() => {
    return () => {
      if (useLearningStore.getState().nearbyEntity?.id === item.entityData.id) {
        useLearningStore.getState().setNearbyEntity(null);
      }
    };
  }, [item.entityData.id]);

  useEffect(() => {
    if (isCompleted) {
      unregisterRadarEntity(item.id);
      return;
    }
    registerRadarEntity(item.id, item.position[0], item.position[2], item.entityData.id, item.entityData.frenchName);
    return () => unregisterRadarEntity(item.id);
  }, [item.id, item.position, item.entityData.id, item.entityData.frenchName, isCompleted]);

  return (
    <group position={item.position} rotation={item.rotation}>
      {/* Chỉ MODEL mới nhận item.scale */}
      <group scale={item.scale}>
        <primitive object={clonedScene} castShadow receiveShadow />
      </group>

      {/* Dấu hiệu nhận biết nổi bật và sensor: biến mất hoàn toàn khi ĐÃ HOÀN THÀNH */}
      {!isCompleted && (
        <>
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

          <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleEnter} onIntersectionExit={handleExit}>
            <CylinderCollider args={[2.0, item.sensorRadius]} position={[0, 1.0, 0]} />
          </RigidBody>
        </>
      )}
    </group>
  );
};

const LearningFBX = ({ item }: { item: LearningItem }) => {
  const fbx = useFBX(item.entityData.modelPath);
  const clonedScene = useMemo(() => fbx.clone(), [fbx]);
  const groupRef = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(fbx.animations, groupRef);
  const setNearbyEntity = useLearningStore((s) => s.setNearbyEntity);
  const isCompleted = useLearningStore((s) => s.completedExercises.includes(item.entityData.id));

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
    if (!isCompleted) {
      setNearbyEntity(item.entityData);
    }
  };

  const handleExit = () => {
    const state = useLearningStore.getState();
    if (state.activeEntity?.id === item.entityData.id) return;
    if (state.nearbyEntity?.id === item.entityData.id) {
      state.setNearbyEntity(null);
    }
  };

  useEffect(() => {
    return () => {
      if (useLearningStore.getState().nearbyEntity?.id === item.entityData.id) {
        useLearningStore.getState().setNearbyEntity(null);
      }
    };
  }, [item.entityData.id]);

  useEffect(() => {
    if (isCompleted) {
      unregisterRadarEntity(item.id);
      return;
    }
    registerRadarEntity(item.id, item.position[0], item.position[2], item.entityData.id, item.entityData.frenchName);
    return () => unregisterRadarEntity(item.id);
  }, [item.id, item.position, item.entityData.id, item.entityData.frenchName, isCompleted]);

  return (
    <group position={item.position} rotation={item.rotation} scale={item.scale}>
      <group ref={groupRef}>
        {/* Scale down FBX because they are usually huge */}
        <primitive object={clonedScene} scale={0.01} />
      </group>
      {!isCompleted && (
        <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleEnter} onIntersectionExit={handleExit}>
          <CylinderCollider args={[5.0, item.sensorRadius]} position={[0, 2.5, 0]} />
        </RigidBody>
      )}
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

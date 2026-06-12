"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";

export default function Player() {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls();
  const { isInteracting } = useGameStore();

  const speed = 5;
  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();

  useFrame((state) => {
    if (!rigidBodyRef.current || isInteracting) return;

    const { forward, backward, left, right } = get();

    // Calculate movement vector
    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);

    direction.subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed);
    
    // Apply isometric rotation (45 degrees / PI/4) so movement feels natural
    // relative to the camera angle
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);

    rigidBodyRef.current.setLinvel(
      { x: direction.x, y: rigidBodyRef.current.linvel().y, z: direction.z },
      true
    );
  });

  return (
    <RigidBody 
      ref={rigidBodyRef} 
      position={[0, 2, 0]} 
      colliders="hull" 
      enabledRotations={[false, false, false]}
    >
      <mesh castShadow>
        <capsuleGeometry args={[0.4, 1, 4, 16]} />
        <meshStandardMaterial color="#3b82f6" /> {/* Tailwind blue-500 */}
      </mesh>
    </RigidBody>
  );
}

import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF, useAnimations } from "@react-three/drei";
import { RigidBody, RapierRigidBody, CapsuleCollider } from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";
import { SkeletonUtils } from 'three-stdlib';
import { GAME_ASSETS } from "@/constants/assets";

// -----------------------------------------------------------------------------
// AnimatedCharacter Component
// Handles the 3D model, materials, and animation mixer.
// Separating this from the Physics player allows us to cleanly swap characters 
// using React's `key` prop without breaking the AnimationMixer during HMR.
// -----------------------------------------------------------------------------
interface AnimatedCharacterProps {
  modelUrl: string;
  animationState: string;
  rotationRef: React.RefObject<number>;
}

function AnimatedCharacter({ modelUrl, animationState, rotationRef }: AnimatedCharacterProps) {
  const characterRef = useRef<THREE.Group>(null);

  const characterGltf = useGLTF(modelUrl);
  const generalAnimations = useGLTF(GAME_ASSETS.MODELS.CHARACTERS.ANIMATIONS_RIG_MEDIUM_GENERAL);
  const movementAnimations = useGLTF(GAME_ASSETS.MODELS.CHARACTERS.ANIMATIONS_RIG_MEDIUM_MOVEMENTBASIC);

  const allAnimations = useMemo(() => {
    return [...generalAnimations.animations, ...movementAnimations.animations];
  }, [generalAnimations, movementAnimations]);

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

  const { actions } = useAnimations(allAnimations, characterRef);

  // Sync rotation from physics logic to visual mesh
  useFrame((_, delta) => {
    if (characterRef.current) {
      // Smooth interpolation for rotation
      let currentAngle = characterRef.current.rotation.y;
      const targetAngle = rotationRef.current;
      while (currentAngle <= targetAngle - Math.PI) currentAngle += Math.PI * 2;
      while (currentAngle > targetAngle + Math.PI) currentAngle -= Math.PI * 2;
      characterRef.current.rotation.y = THREE.MathUtils.lerp(currentAngle, targetAngle, 10 * delta);
    }
  });

  useEffect(() => {
    if (actions && actions[animationState]) {
      actions[animationState].reset().fadeIn(0.2).play();
      return () => {
        actions[animationState]?.fadeOut(0.2);
      };
    }
  }, [animationState, actions]);

  return (
    <group ref={characterRef} position={[0, 0, 0]}>
      <primitive object={character} />
    </group>
  );
}

// -----------------------------------------------------------------------------
// Player Component
// Handles physics, keyboard input, and state machine.
// -----------------------------------------------------------------------------
export default function Player() {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const rotationRef = useRef<number>(0);
  const [, get] = useKeyboardControls();
  const { isInteracting } = useGameStore();

  const speed = 5;
  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();

  const [animation, setAnimation] = useState("Idle_A");

  // Here is where you can change the character! (Knight, Rogue, Mage, etc.)
  const currentCharacterUrl = GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_ROGUE;

  useFrame((state, delta) => {
    if (!rigidBodyRef.current || isInteracting) {
      if (animation !== "Idle_A") setAnimation("Idle_A");
      return;
    }

    const { forward, backward, left, right } = get();

    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);

    direction.subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed);

    const isMoving = direction.length() > 0.1;
    if (isMoving && animation !== "Running_A") setAnimation("Running_A");
    if (!isMoving && animation !== "Idle_A") setAnimation("Idle_A");

    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);

    rigidBodyRef.current.setLinvel(
      { x: direction.x, y: rigidBodyRef.current.linvel().y, z: direction.z },
      true
    );

    if (isMoving) {
      rotationRef.current = Math.atan2(direction.x, direction.z);
    }
    // Camera Follow Logic (Isometric view)
    const pos = rigidBodyRef.current.translation();
    state.camera.position.set(pos.x + 20, pos.y + 20, pos.z + 20);
    state.camera.lookAt(pos.x, pos.y, pos.z);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      mass={1}
      type="dynamic"
      position={[0, 5, 0]}
      enabledRotations={[false, false, false]}
      ccd={true}
    >
      <CapsuleCollider args={[0.5, 0.4]} />
      <group position={[0, 0.9, 0]}>
        <AnimatedCharacter
          key={currentCharacterUrl}
          modelUrl={currentCharacterUrl}
          animationState={animation}
          rotationRef={rotationRef}
        />
      </group>
    </RigidBody>
  );
}

useGLTF.preload(GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_ROGUE);
useGLTF.preload(GAME_ASSETS.MODELS.CHARACTERS.ANIMATIONS_RIG_MEDIUM_GENERAL);
useGLTF.preload(GAME_ASSETS.MODELS.CHARACTERS.ANIMATIONS_RIG_MEDIUM_MOVEMENTBASIC);

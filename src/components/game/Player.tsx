import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF, useAnimations } from "@react-three/drei";
import { RigidBody, RapierRigidBody, CapsuleCollider } from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";
import { SkeletonUtils } from 'three-stdlib';
import { GAME_ASSETS } from "@/constants/assets";
import { ISO_CAMERA_OFFSET } from "@/constants/camera";
import { playerRadar, findNearestRadarBySpecies } from "@/components/game/world/CompassRadar";
import { sceneBridge, lensProbe } from "@/components/game/world/ObserveLens";
import { useLearningStore } from "@/store/useLearningStore";

import { useCinematicStore } from "@/store/useCinematicStore";

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
    clone.traverse((node: THREE.Object3D) => {
      if ((node as THREE.Mesh).isMesh) {
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
/**
 * `spawn` cho phép mỗi màn đặt điểm xuất hiện riêng; mặc định giữ như cũ.
 * `worldId` phân biệt hệ toạ độ để lưu/khôi phục đúng vị trí — forest (Ch1)
 * và village (Ch2) không dùng chung một hệ toạ độ nên không thể gộp chung.
 */
export default function Player({
  spawn = [0, 5, 0],
  worldId = "forest",
}: { spawn?: [number, number, number]; worldId?: string } = {}) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const rotationRef = useRef<number>(0);
  const orbitAzimuthRef = useRef<number>(Math.PI / 4);
  const orbitTiltRef = useRef<number>(Math.PI / 6);
  const [, get] = useKeyboardControls();
  const { isInteracting } = useGameStore();
  const nearbyEntity = useLearningStore((s) => s.nearbyEntity);

  // Đọc vị trí đã lưu (localStorage rehydrate xong trước render đầu tiên, xem
  // useGameStore.ts) MỘT LẦN lúc mount — RigidBody chỉ áp dụng prop `position`
  // lúc khởi tạo, đổi prop sau đó không tự dịch chuyển vật lý.
  const [initialSpawn] = useState<[number, number, number]>(() => {
    return useGameStore.getState().playerPositions[worldId] ?? spawn;
  });

  // Định kỳ ghi vị trí hiện tại vào store (không ghi mỗi khung hình để khỏi
  // spam re-render/lưu session) + ghi lần cuối khi rời trang hoặc unmount, để
  // SessionSync (subscribe + debounce) luôn có toạ độ mới nhất lúc lưu.
  useEffect(() => {
    const flush = () => {
      const body = rigidBodyRef.current;
      if (!body) return;
      // Ở thời điểm cleanup lúc unmount, thứ tự dọn dẹp giữa <Physics> và effect
      // này không được đảm bảo — handle Rust phía sau `body` có thể đã bị giải
      // phóng dù ref JS chưa null, khiến `.translation()` ném lỗi "null pointer
      // passed to rust". Lưu vị trí là best-effort nên nuốt lỗi ở đây là an toàn.
      try {
        const t = body.translation();
        useGameStore.getState().setPlayerPosition(worldId, [t.x, t.y, t.z]);
      } catch {
        // Body đã bị huỷ — bỏ qua, lần lưu định kỳ trước đó vẫn còn giá trị.
      }
    };
    const interval = setInterval(flush, 2000);
    window.addEventListener("beforeunload", flush);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, [worldId]);

  const speed = 5;
  const sprintMultiplier = 1.8;
  const jumpForce = 6;
  const DEFAULT_ZOOM = 40;
  const OBSERVE_ZOOM = 75;
  const ORBIT_RADIUS = 5;
  const ORBIT_SPEED = 2; // rad/s
  const TILT_MIN = 0; // ngang tầm vật
  const TILT_MAX = Math.PI / 2; // thẳng đỉnh đầu — chỉ cho quét đúng 1/4 vòng (90°) để luôn thấy rõ vật
  // Hai vector đơn vị "màn hình lên"/"màn hình phải" quy ra toạ độ thế giới —
  // suy từ ĐÚNG phép quay Math.PI/4 dùng để căn phím WASD với góc nhìn
  // isometric cố định (xem khối tính `direction` bên dưới). Nhờ camera không
  // bao giờ đổi góc, quy đổi con trỏ chuột sang điểm thế giới có thể tính
  // thẳng bằng lượng giác, khỏi cần Raycaster (vốn phụ thuộc `camera.matrixWorld`
  // được cập nhật trễ một khung hình so với `camera.position.set()` vừa gọi).
  const SCREEN_UP_X = -Math.SQRT1_2;
  const SCREEN_UP_Z = -Math.SQRT1_2;
  const SCREEN_RIGHT_X = Math.SQRT1_2;
  const SCREEN_RIGHT_Z = -Math.SQRT1_2;
  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();

  // Mỗi lần đổi sang loài khác thì reset góc quay 360°/độ nghiêng dọc về mặc
  // định, tránh camera "thừa kế" góc nhìn lệch từ vật thể quan sát trước đó.
  useEffect(() => {
    orbitAzimuthRef.current = Math.PI / 4;
    orbitTiltRef.current = Math.PI / 6;
  }, [nearbyEntity?.id]);

  // Theo dõi chuột bằng listener DOM thô (window) thay vì `state.pointer` của
  // R3F: `state.pointer` chỉ cập nhật qua hệ thống sự kiện nội bộ của R3F gắn
  // trên phần tử wrapper của <Canvas>, và có thể bị các lớp overlay DOM (HUD,
  // panel...) che khuất/độ trễ tuỳ layout — trong khi window 'pointermove' là
  // cơ chế trình duyệt cấp thấp, luôn nhận được bất kể phần tử nào đang ở trên.
  const pointerRef = useRef({ x: 0, y: 0, clientX: 0, clientY: 0 });
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      pointerRef.current.clientX = e.clientX;
      pointerRef.current.clientY = e.clientY;
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const [animation, setAnimation] = useState("Idle_A");

  // Here is where you can change the character! (Knight, Rogue, Mage, etc.)
  const currentCharacterUrl = GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_ROGUE;

  const isCinematic = useCinematicStore((s) => s.phase !== "idle");

  useFrame((state, delta) => {
    // Cầu nối cho kính lúp (ObserveLensCanvas) — canvas riêng ngoài Canvas
    // chính cần tham chiếu chính THREE.Scene này để render lại từ camera khác.
    sceneBridge.scene = state.scene;

    if (!rigidBodyRef.current) return;

    if (isCinematic) {
      if (animation !== "Idle_A") setAnimation("Idle_A");
      lensProbe.active = false;
      return;
    }

    if (isInteracting) {
      if (animation !== "Idle_A") setAnimation("Idle_A");
      lensProbe.active = false;
      rigidBodyRef.current.setLinvel(
        { x: 0, y: rigidBodyRef.current.linvel().y, z: 0 },
        true
      );
      const pos = rigidBodyRef.current.translation();
      playerRadar.x = pos.x;
      playerRadar.z = pos.z;
      state.camera.position.set(
        pos.x + ISO_CAMERA_OFFSET,
        pos.y + ISO_CAMERA_OFFSET,
        pos.z + ISO_CAMERA_OFFSET,
      );
      state.camera.lookAt(pos.x, pos.y, pos.z);
      return;
    }

    const { forward, backward, left, right, sprint, jump, observe } = get();
    const camera = state.camera as THREE.OrthographicCamera;

    // Giữ F để quan sát: nhân vật đứng yên (chỉ còn trọng lực), camera phóng to
    // (kính lúp). Nếu đang đứng cạnh một vật phẩm có thể nhặt (nearbyEntity),
    // trái/phải xoay camera 360° quanh chính vật đó thay vì chiến lược đi bộ.
    if (observe) {
      if (animation !== "Idle_A") setAnimation("Idle_A");
      rigidBodyRef.current.setLinvel(
        { x: 0, y: rigidBodyRef.current.linvel().y, z: 0 },
        true
      );

      const pos = rigidBodyRef.current.translation();
      playerRadar.x = pos.x;
      playerRadar.z = pos.z;

      const target = nearbyEntity
        ? findNearestRadarBySpecies(nearbyEntity.id, pos.x, pos.z)
        : null;

      if (target) {
        // Đứng cạnh vật phẩm cụ thể: camera chính phóng to toàn màn hình và
        // xoay quanh vật — xem như đang cầm vật lên ngắm kỹ, không cần kính lúp.
        lensProbe.active = false;
        camera.zoom = THREE.MathUtils.lerp(camera.zoom, OBSERVE_ZOOM, 6 * delta);
        camera.updateProjectionMatrix();

        // Trái/phải xoay quanh vật theo phương ngang (góc phương vị, không giới
        // hạn). Lên/xuống nghiêng camera theo chiều dọc, kẹp trong 1/4 vòng
        // (ngang tầm vật → thẳng đỉnh đầu) để luôn nhìn rõ vật, không lật quá
        // xa ra sau/xuống gầm.
        if (left) orbitAzimuthRef.current += ORBIT_SPEED * delta;
        if (right) orbitAzimuthRef.current -= ORBIT_SPEED * delta;
        if (forward) {
          orbitTiltRef.current = Math.min(TILT_MAX, orbitTiltRef.current + ORBIT_SPEED * delta);
        }
        if (backward) {
          orbitTiltRef.current = Math.max(TILT_MIN, orbitTiltRef.current - ORBIT_SPEED * delta);
        }

        const cosTilt = Math.cos(orbitTiltRef.current);
        const sinTilt = Math.sin(orbitTiltRef.current);
        camera.position.set(
          target.x + ORBIT_RADIUS * cosTilt * Math.sin(orbitAzimuthRef.current),
          pos.y + 1 + ORBIT_RADIUS * sinTilt,
          target.z + ORBIT_RADIUS * cosTilt * Math.cos(orbitAzimuthRef.current),
        );
        camera.lookAt(target.x, pos.y + 1, target.z);
      } else {
        // Không có vật phẩm cụ thể: camera chính KHÔNG đổi (vẫn theo người chơi
        // bình thường) — chỉ vùng bên trong kính lúp (ObserveLensCanvas, một
        // canvas nhỏ độc lập) mới phóng to vào đúng nơi chuột đang trỏ.
        if (Math.abs(camera.zoom - DEFAULT_ZOOM) > 0.01) {
          camera.zoom = THREE.MathUtils.lerp(camera.zoom, DEFAULT_ZOOM, 6 * delta);
          camera.updateProjectionMatrix();
        }
        camera.position.set(
          pos.x + ISO_CAMERA_OFFSET,
          pos.y + ISO_CAMERA_OFFSET,
          pos.z + ISO_CAMERA_OFFSET,
        );
        camera.lookAt(pos.x, pos.y, pos.z);

        // Quy đổi con trỏ chuột (NDC -1..1) sang điểm thế giới: camera trực
        // giao nên 1 pixel màn hình luôn ứng với đúng (1/zoom) đơn vị thế giới,
        // theo hai hướng "lên"/"phải" cố định của góc nhìn isometric.
        const halfWidthWorld = window.innerWidth / 2 / camera.zoom;
        const halfHeightWorld = window.innerHeight / 2 / camera.zoom;
        const offsetRight = pointerRef.current.x * halfWidthWorld;
        const offsetUp = pointerRef.current.y * halfHeightWorld;

        lensProbe.x = pos.x + offsetRight * SCREEN_RIGHT_X + offsetUp * SCREEN_UP_X;
        lensProbe.y = pos.y;
        lensProbe.z = pos.z + offsetRight * SCREEN_RIGHT_Z + offsetUp * SCREEN_UP_Z;
        lensProbe.screenX = pointerRef.current.clientX;
        lensProbe.screenY = pointerRef.current.clientY;
        lensProbe.active = true;
      }
      return;
    }

    lensProbe.active = false;
    if (Math.abs(camera.zoom - DEFAULT_ZOOM) > 0.01) {
      camera.zoom = THREE.MathUtils.lerp(camera.zoom, DEFAULT_ZOOM, 6 * delta);
      camera.updateProjectionMatrix();
    }

    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);

    direction.subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(sprint ? speed * sprintMultiplier : speed);

    const isMoving = direction.length() > 0.1;
    if (isMoving && animation !== "Running_A") setAnimation("Running_A");
    if (!isMoving && animation !== "Idle_A") setAnimation("Idle_A");

    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);

    // Vận tốc dọc gần 0 nghĩa là đang đứng yên trên mặt đất (không rơi, không
    // nhảy dở) — dùng làm điều kiện "grounded" đơn giản, tránh double-jump.
    const currentVelY = rigidBodyRef.current.linvel().y;
    const isGrounded = Math.abs(currentVelY) < 0.05;
    const velY = jump && isGrounded ? jumpForce : currentVelY;

    rigidBodyRef.current.setLinvel(
      { x: direction.x, y: velY, z: direction.z },
      true
    );

    if (isMoving) {
      rotationRef.current = Math.atan2(direction.x, direction.z);
    }
    // Camera Follow Logic (Isometric view)
    const pos = rigidBodyRef.current.translation();
    playerRadar.x = pos.x;
    playerRadar.z = pos.z;
    state.camera.position.set(
      pos.x + ISO_CAMERA_OFFSET,
      pos.y + ISO_CAMERA_OFFSET,
      pos.z + ISO_CAMERA_OFFSET,
    );
    state.camera.lookAt(pos.x, pos.y, pos.z);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      mass={1}
      type="dynamic"
      position={initialSpawn}
      enabledRotations={[false, false, false]}
      ccd={true}
      canSleep={false}
    >
      <CapsuleCollider args={[0.5, 0.4]} />
      <group position={[0, -0.9, 0]}>
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

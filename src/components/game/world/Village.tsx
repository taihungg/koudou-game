"use client";

import React, { useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import type { GLTF } from "three-stdlib";
import {
  VILLAGE_BOUNDS,
  VILLAGE_BUILDINGS,
  VILLAGE_GATE,
  VILLAGE_GATE_BARRIER,
  VILLAGE_MODELS,
} from "@/config/world/village";
import type { VillageBuildingConfig } from "@/config/world/types";
import { CHUNK_SIZE } from "@/config/world/chapter1";
import { ISO_CAMERA_OFFSET } from "@/constants/camera";
import { getAssetScale, scaleToHeight } from "@/constants/assetScale";
import { isVillageGateOpen } from "@/config/chapter2Unlock";
import { useGameStore } from "@/store/useGameStore";
import { useLearningStore } from "@/store/useLearningStore";
import { useVillageGateStore } from "@/store/useVillageGateStore";
import { cameraFocus } from "@/utils/cameraFocus";
import VillageChief from "../VillageChief";

/**
 * Village de Koudou — khu định cư ở rìa Đông bản đồ Chương 1, đồng thời là cửa
 * vào Chương 2. Bố cục (vì sao nhà đứng ở đâu) nằm trong
 * `src/config/world/village.ts`; file này chỉ dựng nó ra.
 *
 * Giống `Landmarks.tsx`/`WorldSpecies.tsx`, làng KHÔNG stream theo chunk: nó là
 * một danh sách vật thể đặt tay cố định, không phải nội dung sinh theo toạ độ.
 * Nhưng khác hai cái đó ở chỗ nó nặng hơn nhiều (~30 vật thể, ~35k tam giác),
 * nên có thêm một cổng hiển thị thô ở mức chunk — xem `useNearVillage`.
 */

/** Khoảng chunk mà làng chiếm, suy từ chính mặt bằng đã author. */
const VILLAGE_CHUNK = {
  minX: Math.floor(VILLAGE_BOUNDS.min[0] / CHUNK_SIZE),
  maxX: Math.floor(VILLAGE_BOUNDS.max[0] / CHUNK_SIZE),
  minZ: Math.floor(VILLAGE_BOUNDS.min[1] / CHUNK_SIZE),
  maxZ: Math.floor(VILLAGE_BOUNDS.max[1] / CHUNK_SIZE),
};

/** Đệm thêm quanh làng, tính bằng chunk — làng phải hiện ra TRƯỚC khi vào tầm mắt. */
const VILLAGE_CHUNK_PADDING = 2;

/**
 * `true` khi tâm stream đang ở gần làng.
 *
 * Cùng kỹ thuật `ZonedForest` dùng cho chunk: đọc camera trong `useFrame` nhưng
 * chỉ `setState` khi VƯỢT NGƯỠNG chunk, nên 60 khung hình/giây không kéo theo
 * 60 lần re-render. Và cũng đọc `cameraFocus` như ZonedForest, nếu không thì
 * trong cutscene (camera phối cảnh bay tự do) phép suy ngược
 * `camera − ISO_CAMERA_OFFSET` sẽ cho toạ độ vô nghĩa và làng chớp tắt giữa
 * khuôn hình.
 */
function useNearVillage(): boolean {
  const [near, setNear] = useState(false);

  useFrame((state) => {
    const focusX = cameraFocus.override
      ? cameraFocus.x
      : state.camera.position.x - ISO_CAMERA_OFFSET;
    const focusZ = cameraFocus.override
      ? cameraFocus.z
      : state.camera.position.z - ISO_CAMERA_OFFSET;

    const cx = Math.floor(focusX / CHUNK_SIZE);
    const cz = Math.floor(focusZ / CHUNK_SIZE);

    const next =
      cx >= VILLAGE_CHUNK.minX - VILLAGE_CHUNK_PADDING &&
      cx <= VILLAGE_CHUNK.maxX + VILLAGE_CHUNK_PADDING &&
      cz >= VILLAGE_CHUNK.minZ - VILLAGE_CHUNK_PADDING &&
      cz <= VILLAGE_CHUNK.maxZ + VILLAGE_CHUNK_PADDING;

    if (next !== near) setNear(next);
  });

  return near;
}

/**
 * Một vật thể của làng. Tỉ lệ ưu tiên đi qua `scaleToHeight` (chiều cao mục
 * tiêu) vì làng trộn hai pack lệch hệ đơn vị 4 lần — `objects/` cần ×4, còn
 * `villages_raw_glb/` đã ở mét. Chỉ prop dẹt bất thường mới khai `scale` tay,
 * xem ghi chú ghế băng trong village.ts.
 */
const VillageProp = React.memo(function VillageProp({ item }: { item: VillageBuildingConfig }) {
  const { scene } = useGLTF(item.modelPath) as GLTF;
  const cloned = useMemo(() => scene.clone(), [scene]);

  const scale = useMemo(() => {
    if (item.targetHeight !== undefined) return scaleToHeight(item.modelPath, item.targetHeight);
    return item.scale ?? getAssetScale(item.modelPath);
  }, [item.modelPath, item.targetHeight, item.scale]);

  const body = (
    <group scale={scale} rotation={[0, item.rotationY, 0]}>
      <primitive object={cloned} castShadow receiveShadow />
    </group>
  );

  // Vật thể không có collider (ruộng, bao tải) dựng thẳng, khỏi tốn một
  // RigidBody rỗng cho Rapier phải quản lý.
  if (!item.collider) {
    return <group position={[item.position[0], 0, item.position[1]]}>{body}</group>;
  }

  const [hx, hy, hz] = item.collider;
  return (
    <RigidBody type="fixed" colliders={false} position={[item.position[0], 0, item.position[1]]}>
      <CuboidCollider args={[hx, hy, hz]} position={[0, hy, 0]} />
      {body}
    </RigidBody>
  );
});

/**
 * Rào chắn ngang cổng, CHỈ dựng khi Chương 2 còn khoá.
 *
 * Đây là toàn bộ phần hình ảnh của trạng thái khoá: rào liền một mạch = đóng,
 * khoảng trống giữa hai trụ = mở. Không cần hiệu ứng phát sáng hay biểu tượng ổ
 * khoá nổi trong không trung — hàng rào tự nói điều đó, và nó nói bằng cùng
 * ngôn ngữ hình ảnh mà phần còn lại của bản đồ đang dùng (kou-dou.md §5: để
 * thế giới truyền đạt luật chơi, đừng để HUD làm thay).
 */
function GateBarrier() {
  return (
    <>
      {VILLAGE_GATE_BARRIER.map((item) => (
        <VillageProp key={item.id} item={item} />
      ))}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[0.4, 1.5, VILLAGE_GATE.openingWidth / 2]}
          position={[VILLAGE_GATE.position[0], 1.5, VILLAGE_GATE.position[1]]}
        />
      </RigidBody>
    </>
  );
}

export default function Village() {
  const near = useNearVillage();
  const setNearby = useVillageGateStore((s) => s.setNearby);
  // `isVillageGateOpen` renvoie un booléen, donc l'appeler dans un sélecteur
  // est sûr ici (pas de nouvelle identité d'objet à chaque render).
  const xpLangage = useGameStore((s) => s.xp_langage);
  const completedExercises = useLearningStore((s) => s.completedExercises);
  const unlocked = isVillageGateOpen({ xpLangage, completedExercises });

  // Làng bị gỡ khi người chơi đi xa (`near === false`), nên phải dọn cờ `nearby`
  // giống LearningEntity/VillagersDialogueScene — nếu không, prompt "ESPACE" sẽ
  // dính vĩnh viễn trong trường hợp người chơi rời vùng đúng lúc sensor bị gỡ
  // mà `onIntersectionExit` chưa kịp bắn.
  React.useEffect(() => () => setNearby(false), [setNearby]);

  if (!near) return null;

  return (
    <group>
      {VILLAGE_BUILDINGS.map((item) => (
        <VillageProp key={item.id} item={item} />
      ))}

      {/* Le chef vit dans le village, sur la place au bout de la rue — il est
          monté ici (et pas dans ZonedForest) pour suivre exactement la même
          visibilité que le reste du village. */}
      <VillageChief />

      {!unlocked && <GateBarrier />}

      <RigidBody
        type="fixed"
        colliders={false}
        sensor
        position={[VILLAGE_GATE.position[0], 1, VILLAGE_GATE.position[1]]}
        onIntersectionEnter={() => setNearby(true)}
        onIntersectionExit={() => setNearby(false)}
      >
        <CylinderCollider args={[3, VILLAGE_GATE.sensorRadius]} />
      </RigidBody>
    </group>
  );
}

VILLAGE_MODELS.forEach((path) => useGLTF.preload(path));

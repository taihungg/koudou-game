"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import type { VegetationItem } from "@/utils/vegetationSampling";

/**
 * Cỏ/hoa/nấm nền — số lượng lớn nhất trong mọi lớp (mật độ tới ~18/100 m²),
 * nên PHẢI dùng InstancedMesh thay vì clone riêng từng cái. Không collider,
 * đúng quy ước hiện tại của foliage trong InfiniteForest.
 *
 * Một model có thể có nhiều mesh con (hoa nhiều cánh khác vật liệu), nên mỗi
 * mesh trong model là MỘT lớp InstancedMesh riêng, dùng chung một mảng
 * transform theo instance — giữ đúng hình dạng gốc thay vì chỉ lấy mesh đầu.
 */

interface MeshInfo {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  /** Ma trận của mesh so với gốc scene — vài model có mesh con lệch tâm/xoay. */
  localMatrix: THREE.Matrix4;
}

function useMeshInfos(modelPath: string): MeshInfo[] {
  const { scene } = useGLTF(modelPath) as GLTF;

  return useMemo(() => {
    scene.updateMatrixWorld(true);
    const rootInverse = new THREE.Matrix4().copy(scene.matrixWorld).invert();
    const infos: MeshInfo[] = [];

    scene.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        const localMatrix = new THREE.Matrix4().multiplyMatrices(rootInverse, mesh.matrixWorld);
        infos.push({ geometry: mesh.geometry, material: mesh.material, localMatrix });
      }
    });

    return infos;
  }, [scene]);
}

function InstancedLayer({ info, items }: { info: MeshInfo; items: VegetationItem[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const instanceMatrix = new THREE.Matrix4();

    items.forEach((item, i) => {
      dummy.position.set(item.position[0], item.position[1], item.position[2]);
      dummy.rotation.set(0, item.rotationY, 0);
      dummy.scale.setScalar(item.scale);
      dummy.updateMatrix();
      instanceMatrix.multiplyMatrices(dummy.matrix, info.localMatrix);
      mesh.setMatrixAt(i, instanceMatrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [items, info]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[info.geometry, info.material, items.length]}
      castShadow
      receiveShadow
      // Bounding sphere mặc định chỉ tính theo geometry gốc (rất nhỏ so với
      // toàn bộ 40 m chunk trải ra); tắt cull thay vì tính lại mỗi chunk.
      frustumCulled={false}
    />
  );
}

function InstancedModel({ modelPath, items }: { modelPath: string; items: VegetationItem[] }) {
  const meshInfos = useMeshInfos(modelPath);
  return (
    <>
      {meshInfos.map((info, i) => (
        <InstancedLayer key={i} info={info} items={items} />
      ))}
    </>
  );
}

export default function InstancedClutter({ items }: { items: VegetationItem[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, VegetationItem[]>();
    for (const item of items) {
      const list = map.get(item.modelPath);
      if (list) list.push(item);
      else map.set(item.modelPath, [item]);
    }
    return [...map.entries()];
  }, [items]);

  return (
    <>
      {grouped.map(([modelPath, groupItems]) => (
        <InstancedModel key={modelPath} modelPath={modelPath} items={groupItems} />
      ))}
    </>
  );
}

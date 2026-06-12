"use client";

import React, { Component, ReactNode, Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Html, useFBX, useGLTF, useAnimations, Center, useTexture } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { OBJLoader, SkeletonUtils, ColladaLoader } from "three-stdlib";

function AutoTextureApplier({ url, object }: { url: string, object: THREE.Object3D }) {
  const texture = useTexture(url);

  useEffect(() => {
    if (!texture || !object) return;

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const applyTexture = (m: any, index?: number) => {
            // Apply if there is no map, or if the map failed to load an image
            if (!m.map || !m.map.image) {
              const newMat = new THREE.MeshStandardMaterial({
                map: texture,
                side: THREE.DoubleSide,
                color: 0xffffff,
                roughness: 0.8,
                metalness: 0.2
              });
              if (Array.isArray(mesh.material) && index !== undefined) {
                mesh.material[index] = newMat;
              } else {
                mesh.material = newMat;
              }
            }
          };

          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m, i) => applyTexture(m, i));
          } else {
            applyTexture(mesh.material);
          }
        }
      }
    });
  }, [texture, object]);

  return null;
}

class ErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Hàm chuẩn hóa vật liệu: Tắt culling để render cả 2 mặt và tăng độ sáng nếu cần
function normalizeMaterials(obj: THREE.Object3D) {
  obj.traverse((child) => {
    // Hide rigging lines/curves often exported by mistake
    if ((child as THREE.Line).isLine || (child as THREE.LineSegments).isLineSegments) {
      child.visible = false;
    }

    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => {
            m.side = THREE.DoubleSide;
            if (m.opacity === 0) { m.opacity = 1; m.transparent = false; }
          });
        } else {
          mesh.material.side = THREE.DoubleSide;
          if (mesh.material.opacity === 0) { mesh.material.opacity = 1; mesh.material.transparent = false; }
        }
      }
    }
  });
}

function handleCentered({ container, width, height, depth }: any) {
  const maxDim = Math.max(width, height, depth);
  if (maxDim > 0 && maxDim !== Infinity) {
    const targetSize = 10;
    container.scale.setScalar(targetSize / maxDim);
  }
}

function FBXModel({ url, fallbackTextureUrl }: { url: string, fallbackTextureUrl?: string | null }) {
  const fbx = useFBX(url);

  const cloned = useMemo(() => {
    const clone = SkeletonUtils.clone(fbx);
    normalizeMaterials(clone);
    return clone;
  }, [fbx]);

  const groupRef = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(fbx.animations, groupRef);

  useEffect(() => {
    if (names.length > 0) {
      actions[names[0]]?.reset().fadeIn(0.5).play();
    }
  }, [actions, names]);

  return (
    <group ref={groupRef}>
      {fallbackTextureUrl && <Suspense fallback={null}><AutoTextureApplier url={fallbackTextureUrl} object={cloned} /></Suspense>}
      <Center bottom onCentered={handleCentered}>
        <primitive object={cloned} />
      </Center>
    </group>
  );
}

function GLTFModel({ url, fallbackTextureUrl }: { url: string, fallbackTextureUrl?: string | null }) {
  const gltf = useGLTF(url);

  const cloned = useMemo(() => {
    const clone = SkeletonUtils.clone(gltf.scene);
    normalizeMaterials(clone);
    return clone;
  }, [gltf.scene]);

  const groupRef = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(gltf.animations, groupRef);

  useEffect(() => {
    if (names.length > 0) {
      actions[names[0]]?.reset().fadeIn(0.5).play();
    }
  }, [actions, names]);

  return (
    <group ref={groupRef}>
      {fallbackTextureUrl && <Suspense fallback={null}><AutoTextureApplier url={fallbackTextureUrl} object={cloned} /></Suspense>}
      <Center bottom onCentered={handleCentered}>
        <primitive object={cloned} />
      </Center>
    </group>
  );
}

function OBJModel({ url, fallbackTextureUrl }: { url: string, fallbackTextureUrl?: string | null }) {
  const obj = useLoader(OBJLoader, url);

  const cloned = useMemo(() => {
    const clone = obj.clone();
    normalizeMaterials(clone);
    return clone;
  }, [obj]);

  return (
    <group>
      {fallbackTextureUrl && <Suspense fallback={null}><AutoTextureApplier url={fallbackTextureUrl} object={cloned} /></Suspense>}
      <Center bottom onCentered={handleCentered}>
        <primitive object={cloned} />
      </Center>
    </group>
  );
}

function DAEModel({ url, fallbackTextureUrl }: { url: string, fallbackTextureUrl?: string | null }) {
  const dae = useLoader(ColladaLoader, url);

  const cloned = useMemo(() => {
    const clone = SkeletonUtils.clone(dae.scene);
    normalizeMaterials(clone);
    return clone;
  }, [dae.scene]);

  return (
    <group>
      {fallbackTextureUrl && <Suspense fallback={null}><AutoTextureApplier url={fallbackTextureUrl} object={cloned} /></Suspense>}
      <Center bottom onCentered={handleCentered}>
        <primitive object={cloned} />
      </Center>
    </group>
  );
}

function ModelSelector({ url, fallbackTextureUrl }: { url: string, fallbackTextureUrl?: string | null }) {
  const ext = url.split('.').pop()?.toLowerCase();

  if (ext === 'fbx') return <FBXModel url={url} fallbackTextureUrl={fallbackTextureUrl} />;
  if (ext === 'gltf' || ext === 'glb') return <GLTFModel url={url} fallbackTextureUrl={fallbackTextureUrl} />;
  if (ext === 'obj') return <OBJModel url={url} fallbackTextureUrl={fallbackTextureUrl} />;
  if (ext === 'dae') return <DAEModel url={url} fallbackTextureUrl={fallbackTextureUrl} />;

  return null;
}

export default function ModelItem({ url, position, fallbackTextureUrl }: { url: string; position: [number, number, number]; fallbackTextureUrl?: string | null }) {
  const filename = url.split('/').pop();

  return (
    <group position={position}>
      <ErrorBoundary fallback={
        <Html position={[0, 5, 0]} center>
          <div className="bg-red-900/80 text-white px-2 py-1 text-xs rounded shadow">Lỗi file 3D</div>
        </Html>
      }>
        <Suspense fallback={
          <Html position={[0, 5, 0]} center>
            <div className="bg-slate-900/80 text-white px-2 py-1 text-xs rounded shadow">Loading...</div>
          </Html>
        }>
          <ModelSelector url={url} fallbackTextureUrl={fallbackTextureUrl} />
        </Suspense>
      </ErrorBoundary>

      {/* Label for the asset filename */}
      <Html position={[0, 6, 0]} center zIndexRange={[100, 0]}>
        <div className="bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 text-xs font-medium rounded shadow-lg pointer-events-none whitespace-nowrap border border-slate-700">
          {filename}
        </div>
      </Html>
    </group>
  );
}

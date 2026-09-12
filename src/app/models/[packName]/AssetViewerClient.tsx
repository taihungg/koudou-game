"use client";

import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, MapControls } from "@react-three/drei";
import { useSearchParams } from "next/navigation";
import * as THREE from "three";
import ModelItem from "./ModelItem";

interface AssetViewerClientProps {
  models: string[];
  fallbackTextureUrl: string | null;
}

export default function AssetViewerClient({ models: allModels, fallbackTextureUrl }: AssetViewerClientProps) {
  // ?q=Tree_ để chỉ xem một họ asset (so khớp không phân biệt hoa thường)
  // ?gap=3&zoom=60 để xem sát các asset nhỏ (khúc gỗ, nấm, hoa…)
  const params = useSearchParams();
  const query = (params.get("q") || "").toLowerCase();
  const models = query
    ? allModels.filter((m) => m.toLowerCase().includes(query))
    : allModels;

  // Sắp xếp dạng lưới (grid)
  const cols = Math.ceil(Math.sqrt(models.length)) || 1;
  const spacing = Number(params.get("gap")) || 15; // Khoảng cách giữa các model
  const zoomOverride = Number(params.get("zoom")) || 0;

  // Camera phải nhìn vào TÂM lưới, nếu không lưới sẽ nằm ngoài khung hình.
  // Zoom mặc định được tính để vừa toàn bộ lưới (ước lượng canvas ~1000px).
  const center = ((cols - 1) * spacing) / 2;
  const fitZoom = zoomOverride || Math.max(5, 1000 / (cols * spacing * 1.45));

  return (
    <Canvas shadows={{ type: THREE.PCFShadowMap }}>
      {/*
        Góc nhìn y hệt như game: OrthographicCamera, chéo từ trên xuống.
        Sử dụng MapControls để cho phép kéo (pan) xung quanh mà không làm xoay camera.
      */}
      <OrthographicCamera
        makeDefault
        position={[center + 100, 100, center + 100]}
        zoom={fitZoom}
        near={-1000}
        far={1000}
        onUpdate={c => c.lookAt(center, 0, center)}
      />

      {/* enableRotate={false} khóa việc xoay góc nhìn, giữ nguyên góc chéo */}
      <MapControls
        enableRotate={false}
        enableDamping={true}
        dampingFactor={0.05}
        minZoom={4}
        maxZoom={100}
        target={[center, 0, center]}
      />

      <ambientLight intensity={1.5} />
      <directionalLight 
        position={[20, 30, 20]} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <directionalLight position={[-20, 20, -20]} intensity={1} />

      {/* Helper lưới sàn */}
      {models.length > 0 && (
        <gridHelper 
          args={[cols * spacing * 2, cols * 2, 0x888888, 0xcccccc]} 
          position={[((cols - 1) * spacing) / 2, -0.01, ((cols - 1) * spacing) / 2]} 
        />
      )}

      {/* Render danh sách các model */}
      {models.map((url, i) => (
        <ModelItem 
          key={url} 
          url={url} 
          fallbackTextureUrl={fallbackTextureUrl}
          position={[ (i % cols) * spacing, 0, Math.floor(i / cols) * spacing ]} 
        />
      ))}
    </Canvas>
  );
}

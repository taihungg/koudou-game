"use client";

import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, MapControls } from "@react-three/drei";
import * as THREE from "three";
import ModelItem from "./ModelItem";

interface AssetViewerClientProps {
  models: string[];
  fallbackTextureUrl: string | null;
}

export default function AssetViewerClient({ models, fallbackTextureUrl }: AssetViewerClientProps) {
  // Sắp xếp dạng lưới (grid)
  const cols = Math.ceil(Math.sqrt(models.length));
  const spacing = 15; // Khoảng cách giữa các model

  return (
    <Canvas shadows={{ type: THREE.PCFShadowMap }}>
      {/* 
        Góc nhìn y hệt như game: OrthographicCamera, chéo từ trên xuống.
        Sử dụng MapControls để cho phép kéo (pan) xung quanh mà không làm xoay camera.
      */}
      <OrthographicCamera 
        makeDefault 
        position={[20, 20, 20]} 
        zoom={40} 
        near={-100} 
        far={100} 
        onUpdate={c => c.lookAt(0, 0, 0)}
      />
      
      {/* enableRotate={false} khóa việc xoay góc nhìn, giữ nguyên góc chéo */}
      <MapControls 
        enableRotate={false} 
        enableDamping={true}
        dampingFactor={0.05}
        minZoom={10}
        maxZoom={100}
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

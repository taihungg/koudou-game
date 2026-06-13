"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { KeyboardControls } from "@react-three/drei";
import Environment from "@/components/game/Environment";
import Player from "@/components/game/Player";
import LearningCardUI from "@/components/ui/LearningCardUI";
import InventoryHUD from "@/components/ui/InventoryHUD";
import BotanicalBookUI from "@/components/ui/BotanicalBookUI";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { useEffect } from "react";
import HUD from "@/components/ui/HUD";

// Tạm thời tắt các cảnh báo deprecation (sắp lỗi thời) từ nội bộ thư viện Three.js
// vì các thư viện @react-three/fiber và rapier chưa cập nhật kịp với Three.js r169+
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const msg = args[0];
    if (typeof msg === 'string' && (
      msg.includes('THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated') ||
      msg.includes('THREE.Clock: This module has been deprecated') ||
      msg.includes('using deprecated parameters for the initialization function')
    )) {
      return; // Bỏ qua không in ra console
    }
    originalWarn(...args);
  };
}

export default function Home() {
  const keyboardMap = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "left", keys: ["ArrowLeft", "KeyA"] },
    { name: "right", keys: ["ArrowRight", "KeyD"] },
    { name: "interact", keys: ["KeyE"] },
  ];

  return (
    <main className="w-screen h-screen overflow-hidden relative bg-sky-100">
      <HUD />
      <LearningCardUI />
      <InventoryHUD />
      <BotanicalBookUI />

      <KeyboardControls map={keyboardMap}>
        <Canvas shadows={{ type: THREE.PCFShadowMap }}>
          <OrthographicCamera
            makeDefault
            position={[20, 20, 20]}
            zoom={40}
            near={-100}
            far={100}
            onUpdate={c => c.lookAt(0, 0, 0)}
          />
          <Physics debug={false}>
            <Environment />
            <Player />
          </Physics>
        </Canvas>
      </KeyboardControls>
    </main>
  );
}

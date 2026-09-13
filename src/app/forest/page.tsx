"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { KeyboardControls } from "@react-three/drei";
import Environment from "@/components/game/Environment";
import Player from "@/components/game/Player";
import LearningCardUI from "@/components/ui/LearningCardUI";
import InventoryHUD from "@/components/ui/InventoryHUD";
import BotanicalBookUI from "@/components/ui/BotanicalBookUI";
import DuboisNotebookUI from "@/components/ui/DuboisNotebookUI";
import IntroCinematicUI from "@/components/ui/IntroCinematicUI";
import IntroScene from "@/components/game/cinematic/IntroScene";
import { useCinematicStore } from "@/store/useCinematicStore";
import { gameplayCamera } from "@/utils/gameplayCamera";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { useEffect } from "react";
import HUD from "@/components/ui/HUD";
import Minimap from "@/components/ui/Minimap";
import CompassHUD from "@/components/ui/CompassHUD";
import ObserveModeUI from "@/components/ui/ObserveModeUI";
import ObserveLensCanvas from "@/components/ui/ObserveLensCanvas";
import { SPAWN } from "@/config/world/chapter1";
import { ISO_CAMERA_OFFSET } from "@/constants/camera";
import { WorldDebugPanel } from "@/components/game/world/WorldDebugHUD";
import { useSearchParams } from "next/navigation";

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
  const debug = useSearchParams().get("debug") === "1";
  // Trong cutscene, mọi lớp HUD đều tắt: khuôn hình điện ảnh không được dính
  // thanh điểm số hay minimap. Đây là cờ React (đổi vài lần cả màn), không phải
  // giá trị theo khung hình, nên cho re-render thoải mái.
  const cinematic = useCinematicStore((state) => state.phase !== "idle");

  const keyboardMap = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "left", keys: ["ArrowLeft", "KeyA"] },
    { name: "right", keys: ["ArrowRight", "KeyD"] },
    { name: "sprint", keys: ["KeyQ"] },
    { name: "jump", keys: ["KeyE"] },
    { name: "observe", keys: ["KeyF"] },
  ];

  return (
    <main className="w-screen h-screen overflow-hidden relative bg-sky-100">
      {!cinematic && (
        <>
          <HUD />
          <LearningCardUI />
          <InventoryHUD />
          <BotanicalBookUI />
          <DuboisNotebookUI />
          <Minimap />
          <CompassHUD />
          <ObserveModeUI />
          <ObserveLensCanvas />
        </>
      )}
      <IntroCinematicUI />
      {debug && <WorldDebugPanel />}

      <KeyboardControls map={keyboardMap}>
        <Canvas shadows={{ type: THREE.PCFShadowMap }}>
          <OrthographicCamera
            // Cutscene đổi camera mặc định rồi phải trả lại ĐÚNG camera này —
            // xem `src/utils/gameplayCamera.ts` về lý do không thể chỉ "nhớ
            // camera đang mặc định".
            ref={gameplayCamera as React.RefObject<THREE.OrthographicCamera>}
            // NHƯỜNG quyền camera mặc định trong lúc chiếu cutscene. Bỏ điều
            // kiện này là hai bên giành nhau: layout effect `makeDefault` của
            // drei chạy lại mỗi khi `state.camera` đổi và gắn lại camera ortho,
            // nên camera điện ảnh bị đá ra ngay khi vừa vào — màn hình đứng im ở
            // góc nhìn ortho cũ (nhìn vào gốc toạ độ) suốt cả intro.
            makeDefault={!cinematic}
            position={[ISO_CAMERA_OFFSET, ISO_CAMERA_OFFSET, ISO_CAMERA_OFFSET]}
            zoom={40}
            // Bản đồ giờ rộng 480 m: near/far ±100 cắt mất chunk ở rìa tầm nhìn.
            near={-1000}
            far={1000}
            onUpdate={c => c.lookAt(0, 0, 0)}
          />
          <Physics debug={false}>
            <Environment />
            <Player spawn={SPAWN} />
          </Physics>
          {/* Đặt NGOÀI <Physics>: cutscene không có vật thể vật lý nào. */}
          <IntroScene />
        </Canvas>
      </KeyboardControls>
    </main>
  );
}

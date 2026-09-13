"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { lensProbe, sceneBridge } from "@/components/game/world/ObserveLens";

const LENS_SIZE = 260; // px, đường kính vòng kính lúp trên màn hình
const LENS_HALF_WORLD = 2.2; // nửa chiều rộng vùng thế giới hiển thị trong kính (mét) — càng nhỏ càng phóng to
const LENS_CAMERA_OFFSET = 6; // camera kính lúp đặt gần điểm quan sát hơn nhiều so với camera chính (20)

/**
 * Kính lúp quan sát tự do: một <canvas> + WebGLRenderer HOÀN TOÀN RIÊNG, luôn
 * mounted (chỉ ẩn/hiện + dừng render qua `lensProbe.active`) để không phải
 * tạo/huỷ WebGL context mỗi lần giữ/thả phím F.
 *
 * Điểm mấu chốt: renderer này render lại CHÍNH `sceneBridge.scene` — tức
 * THREE.Scene thật của Canvas chính (Player.tsx gán mỗi khung hình) — bằng
 * một camera trực giao riêng, phóng rất to, đặt tại vị trí chuột đang trỏ
 * (`lensProbe`). Nhờ vậy chỉ vùng ảnh bên trong vòng tròn kính lúp phóng to,
 * còn canvas chính vẫn hiển thị bình thường — không cần dựng lại thế giới
 * (Environment/InfiniteForest) lần thứ hai.
 */
export default function ObserveLensCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(LENS_SIZE, LENS_SIZE, false);

    const camera = new THREE.OrthographicCamera(
      -LENS_HALF_WORLD,
      LENS_HALF_WORLD,
      LENS_HALF_WORLD,
      -LENS_HALF_WORLD,
      -1000,
      1000,
    );

    let raf = 0;
    const tick = () => {
      const isActive = lensProbe.active;

      if (wrapperRef.current) {
        wrapperRef.current.style.left = `${lensProbe.screenX}px`;
        wrapperRef.current.style.top = `${lensProbe.screenY}px`;
        wrapperRef.current.style.visibility = isActive ? "visible" : "hidden";
      }

      if (isActive && sceneBridge.scene) {
        camera.position.set(
          lensProbe.x + LENS_CAMERA_OFFSET,
          lensProbe.y + LENS_CAMERA_OFFSET,
          lensProbe.z + LENS_CAMERA_OFFSET,
        );
        camera.lookAt(lensProbe.x, lensProbe.y, lensProbe.z);
        renderer.render(sceneBridge.scene, camera);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed z-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ left: "50%", top: "50%", width: LENS_SIZE, height: LENS_SIZE, visibility: "hidden" }}
    >
      {/* Vòng kính — overflow-hidden ở ĐÂY để cắt canvas thành hình tròn, tách
          riêng khỏi wrapper để tay cầm bên dưới không bị cắt theo. */}
      <div className="relative h-full w-full rounded-full overflow-hidden border-[6px] border-amber-300 shadow-[0_0_10px_4px_rgba(0,0,0,0.35),0_0_50px_rgba(245,158,11,0.5)]">
        <canvas ref={canvasRef} width={LENS_SIZE} height={LENS_SIZE} className="block h-full w-full" />
      </div>
      {/* Tay cầm kính lúp, thuần trang trí */}
      <div className="absolute -bottom-4 -right-4 h-20 w-5 rotate-45 rounded-full bg-amber-300 border-2 border-amber-500" />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useLearningStore } from "@/store/useLearningStore";

/**
 * Giữ phím F để quan sát. Component này chỉ lo phần DOM cho chế độ đứng cạnh
 * một vật phẩm cụ thể (xoay quanh nó) — camera chính lúc đó phóng to toàn màn
 * hình (xem Player.tsx) nên hiện vignette nhấn mạnh cảm giác phóng to. Không
 * hiện bảng tóm tắt thông tin — chỉ cần bản thân view xoay 360°/90° là đủ.
 *
 * Chế độ TỰ DO (không có vật phẩm gần đó) không còn xử lý ở component này —
 * kính lúp chỉ-phóng-to-bên-trong-vòng-tròn của chế độ đó nằm ở
 * ObserveLensCanvas.tsx (một <canvas> WebGL riêng, luôn mounted).
 *
 * Dùng `keydown`/`keyup` thô thay vì `useKeyboardControls` vì lớp DOM này nằm
 * NGOÀI `<KeyboardControls>` (nó chỉ bọc `<Canvas>` — xem CLAUDE.md), nên hai
 * cơ chế đọc phím F này chạy song song độc lập trên cùng một phím vật lý.
 */
export default function ObserveModeUI() {
  const nearbyEntity = useLearningStore((s) => s.nearbyEntity);
  const activeEntity = useLearningStore((s) => s.activeEntity);
  const [isKeyHeld, setIsKeyHeld] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyF") setIsKeyHeld(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyF") setIsKeyHeld(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Một thẻ học đang mở (quiz) thì tắt hiệu ứng quan sát để tránh chồng UI —
  // suy ra trực tiếp thay vì đồng bộ qua effect, khỏi phải setState chéo.
  const isObserving = isKeyHeld && !activeEntity;

  if (!isObserving || !nearbyEntity) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Vignette: viền tối dần ra mép màn hình để nhấn mạnh cảm giác phóng to */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 38%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}

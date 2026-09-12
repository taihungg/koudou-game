"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ISO_CAMERA_OFFSET } from "@/constants/camera";

/**
 * Ô nhớ module-scope nối vị trí người chơi từ trong Canvas ra minimap DOM bên
 * ngoài — cùng kỹ thuật `probe` của WorldDebugHUD.tsx (xem ghi chú ở đó): tránh
 * việc mỗi khung hình đều chảy qua Zustand `set()` rồi kéo theo re-render cây
 * React, trong khi minimap chỉ cần đọc trực tiếp qua polling + mutate DOM.
 *
 * Khác WorldDebugHUD (chỉ bật khi `?debug=1`), probe này LUÔN chạy vì minimap
 * là tính năng gameplay thường trực, không phải công cụ debug.
 */
export const minimapProbe = { x: 0, z: 0 };

/** Đặt bên trong `<Canvas>`, cạnh ZonedForest. */
export default function MinimapProbe() {
  const frame = useRef(0);

  useFrame((state) => {
    // ~20 lần/giây là đủ mượt cho một chấm nhỏ trên minimap, khỏi tính mỗi khung hình.
    if (frame.current++ % 3 !== 0) return;
    minimapProbe.x = state.camera.position.x - ISO_CAMERA_OFFSET;
    minimapProbe.z = state.camera.position.z - ISO_CAMERA_OFFSET;
  });

  return null;
}

"use client";

import type * as THREE from "three";

/**
 * Cầu nối module-scope cho kính lúp quan sát tự do (ObserveLensCanvas.tsx) —
 * cùng kỹ thuật "probe" đã dùng cho playerRadar/minimapProbe: Player.tsx (chạy
 * TRONG Canvas chính) ghi trực tiếp mỗi khung hình, còn canvas kính lúp (một
 * <canvas> DOM độc lập, NGOÀI Canvas chính) chỉ đọc, không qua Zustand.
 *
 * `sceneBridge.scene` là chính THREE.Scene của Canvas chính — canvas kính lúp
 * dùng lại camera + renderer RIÊNG nhưng render lại CÙNG scene này, nên không
 * phải mount thêm một bản sao Environment/VillageEnvironment (tốn kém gấp đôi
 * việc tải model + chunk streaming); nó chỉ là một góc nhìn khác của cùng một
 * thế giới 3D đang có sẵn.
 */
export const sceneBridge: { scene: THREE.Scene | null } = { scene: null };

export const lensProbe = {
  x: 0,
  y: 0,
  z: 0,
  screenX: 0,
  screenY: 0,
  active: false,
};

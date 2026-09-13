"use client";

/**
 * Ô nhớ module-scope cho tính năng la bàn (CompassHUD) — cùng kỹ thuật
 * `minimapProbe`/`probe` (MinimapProbe.tsx, WorldDebugHUD.tsx): tránh việc mỗi
 * khung hình đều chảy qua Zustand `set()` rồi kéo theo re-render cây React,
 * trong khi la bàn chỉ cần đọc trực tiếp qua polling + mutate DOM.
 *
 * `playerRadar` được cập nhật trực tiếp từ Player.tsx (component duy nhất
 * chạy trên cả /forest và /village) thay vì gắn một probe riêng vào từng cây
 * scene khác nhau (ZonedForest dùng cho /forest, InfiniteForest cho /village).
 *
 * `entityRadar` được LearningEntity.tsx đăng ký/hủy đăng ký theo vòng đời
 * mount/unmount của từng instance (chunk load/unload) — cùng kỷ luật "keep
 * this" mà CLAUDE.md nói về việc dọn `nearbyEntity` khi chunk unload.
 */

export const playerRadar = { x: 0, z: 0 };

export interface RadarEntry {
  x: number;
  z: number;
  speciesId: string;
  frenchName: string;
}

export const entityRadar = new Map<string, RadarEntry>();

export function registerRadarEntity(
  instanceId: string,
  x: number,
  z: number,
  speciesId: string,
  frenchName: string
) {
  entityRadar.set(instanceId, { x, z, speciesId, frenchName });
}

export function unregisterRadarEntity(instanceId: string) {
  entityRadar.delete(instanceId);
}

/**
 * Tìm instance gần người chơi nhất của một loài cụ thể — dùng cho chế độ quan
 * sát 360° (Player.tsx): `nearbyEntity` chỉ mang dữ liệu cấp loài (từ
 * `item.entityData`), không có toạ độ instance đang đứng cạnh, nên phải dò lại
 * qua `entityRadar` bằng speciesId + vị trí người chơi.
 */
export function findNearestRadarBySpecies(
  speciesId: string,
  px: number,
  pz: number
): { x: number; z: number } | null {
  let best: { x: number; z: number } | null = null;
  let bestDist = Infinity;

  entityRadar.forEach((entry) => {
    if (entry.speciesId !== speciesId) return;
    const dist = Math.hypot(entry.x - px, entry.z - pz);
    if (dist < bestDist) {
      bestDist = dist;
      best = { x: entry.x, z: entry.z };
    }
  });

  return best;
}

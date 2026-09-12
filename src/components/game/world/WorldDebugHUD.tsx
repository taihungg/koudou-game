"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ISO_CAMERA_OFFSET } from "@/constants/camera";
import { PLAYABLE_HALF, WORLD_HALF, ZONES } from "@/config/world/chapter1";
import { distanceToNearestPath, sampleBiome, zoneWeightAt } from "@/utils/worldSampling";

/**
 * Bảng toạ độ/biome cho việc dựng bản đồ. Chỉ bật khi URL có `?debug=1`.
 *
 * Bản đồ hữu hạn rất khó kiểm bằng mắt: mọi hướng đều là rừng, camera lại luôn
 * bám người chơi nên khung hình gần như không đổi khi di chuyển. Không có số
 * đọc được thì không biết mình đang ở đâu, zone nào, còn cách biên bao xa.
 *
 * Tách làm hai phần theo đúng kiến trúc của dự án (xem CLAUDE.md): phần đo nằm
 * trong cây R3F, phần hiển thị là DOM nằm CẠNH `<Canvas>`, nối nhau qua một ô
 * nhớ module-scope thay vì lồng DOM vào trong canvas.
 */

const probe = { text: "" };

/** Đặt bên trong `<Canvas>`. */
export function WorldDebugProbe() {
  const frame = useRef(0);

  useFrame((state) => {
    // Cập nhật ~6 lần/giây là đủ đọc, khỏi tính toán mỗi khung hình.
    if (frame.current++ % 10 !== 0) return;

    const x = state.camera.position.x - ISO_CAMERA_OFFSET;
    const z = state.camera.position.z - ISO_CAMERA_OFFSET;
    const sample = sampleBiome(x, z);

    const zone = ZONES.map((zc, i) => ({ zc, w: zoneWeightAt(x, z, i) }))
      .filter((e) => e.w > 0.01)
      .sort((a, b) => b.w - a.w)[0];

    const toEdge = Math.min(WORLD_HALF - Math.abs(x), WORLD_HALF - Math.abs(z));
    const inPlayable = Math.abs(x) <= PLAYABLE_HALF && Math.abs(z) <= PLAYABLE_HALF;

    probe.text = [
      `x ${x.toFixed(1)}   z ${z.toFixed(1)}`,
      `biome   ${sample.dominant}${sample.belt ? " (ceinture)" : ""}`,
      `zone    ${zone ? `${zone.zc.name} ${(zone.w * 100).toFixed(0)}%` : "—"}`,
      `sentier ${distanceToNearestPath(x, z).toFixed(1)} m`,
      `biên    ${toEdge.toFixed(1)} m${sample.water ? "   · TRONG NƯỚC" : ""}`,
      `chơi được ${inPlayable ? "có" : "KHÔNG (ceinture)"}`,
    ].join("\n");
  });

  return null;
}

/** Đặt bên ngoài `<Canvas>`, cạnh các UI overlay khác. */
export function WorldDebugPanel() {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (ref.current && ref.current.textContent !== probe.text) {
        ref.current.textContent = probe.text;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <pre
      ref={ref}
      className="absolute bottom-3 left-3 z-50 rounded-md border border-lime-300/30 bg-[#0c180ad4] px-3 py-2 font-mono text-xs leading-relaxed text-lime-100"
    />
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useLearningStore } from "@/store/useLearningStore";
import { entityRadar, playerRadar } from "@/components/game/world/CompassRadar";

/**
 * La bàn sinh thái — luôn hiển thị, không cần bật/tắt. Không đi qua Zustand
 * mỗi khung hình (giống Minimap/WorldDebugHUD): đọc trực tiếp
 * `playerRadar`/`entityRadar` qua requestAnimationFrame rồi mutate DOM. Vì
 * mục tiêu gần nhất được tính lại từ đầu mỗi khung hình (không cache), la bàn
 * tự chuyển hướng sang vật phẩm khác ngay khi nó trở thành mục tiêu gần hơn.
 *
 * Góc xoay kim la bàn quy đổi từ chênh lệch toạ độ thế giới (dx, dz) sang
 * không gian màn hình bằng cùng phép quay Math.PI/4 mà Player.tsx dùng để căn
 * phím WASD với góc nhìn isometric cố định của camera.
 */
export default function CompassHUD() {
  const [hasTarget, setHasTarget] = useState(false);
  const completedExercises = useLearningStore((s) => s.completedExercises);
  const needleRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const distRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const px = playerRadar.x;
      const pz = playerRadar.z;

      let nearestDist = Infinity;
      let nearestDx = 0;
      let nearestDz = 0;
      let nearestName = "";

      entityRadar.forEach((entry) => {
        if (completedExercises.includes(entry.speciesId)) return;
        const dx = entry.x - px;
        const dz = entry.z - pz;
        const dist = Math.hypot(dx, dz);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestDx = dx;
          nearestDz = dz;
          nearestName = entry.frenchName;
        }
      });

      const found = Number.isFinite(nearestDist);
      setHasTarget((prev) => (prev === found ? prev : found));

      if (needleRef.current && labelRef.current && distRef.current) {
        if (found) {
          const angleDeg =
            (Math.atan2(nearestDx - nearestDz, -(nearestDx + nearestDz)) * 180) / Math.PI;
          needleRef.current.style.transform = `rotate(${angleDeg}deg)`;
          labelRef.current.textContent = nearestName;
          distRef.current.textContent = `${Math.round(nearestDist)} m`;
        } else {
          labelRef.current.textContent = "Tout exploré ici";
          distRef.current.textContent = "";
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [completedExercises]);

  return (
    <div className="absolute top-24 right-6 z-10 pointer-events-none flex flex-col items-center gap-2">
      {/* Vòng hào quang mờ phía sau, nhấp nháy nhẹ để bắt mắt */}
      <div className="relative h-24 w-24">
        <div
          className={`absolute inset-0 rounded-full blur-md transition-colors duration-300 ${
            hasTarget ? "bg-amber-400/40 animate-pulse" : "bg-emerald-400/20"
          }`}
        />

        {/* Mặt la bàn */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-800 to-amber-950 border-[3px] border-amber-300 shadow-[0_4px_18px_rgba(0,0,0,0.5),inset_0_2px_6px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
          {/* Vạch chia 4 hướng chính, thuần trang trí cho ra dáng la bàn thật */}
          <div className="absolute top-1 left-1/2 w-[2px] h-2 bg-amber-300/70 -translate-x-1/2" />
          <div className="absolute bottom-1 left-1/2 w-[2px] h-2 bg-amber-300/70 -translate-x-1/2" />
          <div className="absolute left-1 top-1/2 h-[2px] w-2 bg-amber-300/70 -translate-y-1/2" />
          <div className="absolute right-1 top-1/2 h-[2px] w-2 bg-amber-300/70 -translate-y-1/2" />

          {hasTarget ? (
            <div
              ref={needleRef}
              className="relative h-16 w-16 transition-transform duration-200 ease-out"
              style={{ transform: "rotate(0deg)" }}
            >
              {/* Kim la bàn: nửa sáng chỉ hướng mục tiêu, nửa tối là đuôi kim */}
              <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">
                <polygon points="50,4 62,50 50,50" fill="#fbbf24" />
                <polygon points="50,4 38,50 50,50" fill="#f59e0b" />
                <polygon points="50,96 62,50 50,50" fill="#78350f" />
                <polygon points="50,96 38,50 50,50" fill="#5c2a0a" />
                <circle cx="50" cy="50" r="6" fill="#fde68a" stroke="#78350f" strokeWidth="2" />
              </svg>
            </div>
          ) : (
            <span className="text-3xl">✅</span>
          )}
        </div>
      </div>

      {/* Nhãn tên loài + khoảng cách */}
      <div className="bg-gradient-to-b from-amber-900 to-amber-950 border-2 border-amber-400/70 text-amber-50 text-xs font-bold px-3 py-1.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.4)] max-w-[11rem] text-center">
        <span ref={labelRef} className="truncate block leading-tight">—</span>
        <span ref={distRef} className="text-amber-300 font-black block leading-tight"></span>
      </div>
    </div>
  );
}

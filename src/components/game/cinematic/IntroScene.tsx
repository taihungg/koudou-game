"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CHAPTER1_INTRO_SHOTS } from "@/config/cinematics/chapter1Intro";
import { useCinematicStore } from "@/store/useCinematicStore";
import CinematicCamera from "./CinematicCamera";

/**
 * Phần trong `<Canvas>` của intro Chương 1. Đặt NGOÀI `<Physics>` — cutscene
 * không có vật thể vật lý nào, và để trong Physics thì mỗi lần mount/unmount lại
 * đụng vào world Rapier đang giữ người chơi.
 *
 * Bên DOM là `src/components/ui/IntroCinematicUI.tsx`. Hai bên chỉ nói chuyện
 * qua `useCinematicStore` + `cinematicClock`, đúng luật kiến trúc trong
 * CLAUDE.md (components/game chỉ R3F, components/ui chỉ DOM).
 */
export default function IntroScene() {
  const phase = useCinematicStore((state) => state.phase);
  const setDebugShot = useCinematicStore((state) => state.setDebugShot);
  const params = useSearchParams();
  const cine = params.get("cine");
  const cineT = params.get("cinet");

  // `/forest?cine=3&cinet=0.5` — ghim cảnh số 3 ở giữa cảnh để căn khuôn hình.
  useEffect(() => {
    if (cine === null) {
      setDebugShot(null);
      return;
    }
    const index = Number.parseInt(cine, 10);
    if (Number.isNaN(index)) return;
    setDebugShot(index, cineT === null ? 0 : Number.parseFloat(cineT) || 0);
    return () => setDebugShot(null);
  }, [cine, cineT, setDebugShot]);

  if (phase === "idle") return null;

  return <CinematicCamera shots={CHAPTER1_INTRO_SHOTS} />;
}

"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useLearningStore } from "@/store/useLearningStore";

function buildPayload() {
  const game = useGameStore.getState();
  const learning = useLearningStore.getState();
  return {
    game: {
      xp_langage: game.xp_langage,
      indice_biodiversite: game.indice_biodiversite,
      lien_confiance: game.lien_confiance,
      inventory: game.inventory,
      currentChapter: game.currentChapter,
      hasSeenChapter1Intro: game.hasSeenChapter1Intro,
      chapter1Completed: game.chapter1Completed,
      playerPositions: game.playerPositions,
    },
    learning: {
      completedExercises: learning.completedExercises,
    },
  };
}

function saveSession() {
  const payload = JSON.stringify(buildPayload());
  const sent = navigator.sendBeacon?.(
    "/api/session",
    new Blob([payload], { type: "application/json" })
  );
  if (!sent) {
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}

/**
 * Không phải "account" — chỉ khôi phục tiến trình theo IP máy chơi (xem
 * `src/lib/sessionStore.ts` + `src/app/api/session/route.ts`). Ghi đè lên
 * localStorage nếu server có dữ liệu, để cùng một IP tiếp tục đúng chỗ đã
 * dừng dù đổi trình duyệt/máy.
 */
export default function SessionSync() {
  useEffect(() => {
    let cancelled = false;

    fetch("/api/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { game?: object; learning?: object } | null) => {
        if (cancelled || !data) return;
        if (data.game) useGameStore.setState(data.game);
        if (data.learning) useLearningStore.setState(data.learning);
      })
      .catch(() => {});

    let timeout: ReturnType<typeof setTimeout> | null = null;
    const scheduleSave = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(saveSession, 1000);
    };

    const unsubGame = useGameStore.subscribe(scheduleSave);
    const unsubLearning = useLearningStore.subscribe(scheduleSave);
    window.addEventListener("beforeunload", saveSession);

    return () => {
      cancelled = true;
      unsubGame();
      unsubLearning();
      if (timeout) clearTimeout(timeout);
      window.removeEventListener("beforeunload", saveSession);
    };
  }, []);

  return null;
}

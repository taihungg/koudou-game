"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CHAPTER1_INTRO_SHOTS } from "@/config/cinematics/chapter1Intro";
import type { IntroShot, TransitionKind } from "@/config/cinematics/types";
import { cinematicClock, useCinematicStore } from "@/store/useCinematicStore";
import { useGameStore } from "@/store/useGameStore";
import { clamp01 } from "@/utils/easing";
import ForestIntroUI from "./ForestIntroUI";

/**
 * Lớp DOM của intro Chương 1: lớp phủ đen, thanh letterbox, phụ đề tiếng Pháp,
 * chỉnh màu và nút « Passer ». Component này cũng là nơi ĐIỀU PHỐI vòng đời
 * cutscene (bật/tắt cờ đóng băng người chơi, ghi nhớ "đã xem"), còn máy quay nằm
 * bên `src/components/game/cinematic/`.
 *
 * Thời gian lấy từ `cinematicClock` — đồng hồ do `useFrame` của máy quay cộng
 * dồn — chứ không tự đếm, vì hai vòng lặp thời gian riêng sẽ trôi lệch nhau và
 * phụ đề sẽ dần không khớp hình. Giá trị mỗi khung hình được ghi THẲNG vào style
 * qua ref, không qua `setState`, theo đúng cách `Minimap.tsx` cập nhật chấm toạ
 * độ.
 */

/** Độ dài cú chuyển cảnh theo từng kiểu (ms). `dissolve` cố tình rất ngắn: đây
 *  là chớp đen chứ không phải cross-dissolve thật (xem types.ts). */
const TRANSITION_MS: Record<TransitionKind, number> = {
  cut: 0,
  fade: 700,
  dissolve: 320,
};

const SUBTITLE_FADE_MS = 350;
/** Thời gian phủ đen khi người chơi bấm « Passer ». */
const SKIP_FADE_MS = 260;
/** Chờ sau khi trả camera về ortho, để `Player.tsx` kịp ghim camera lên người
 *  chơi ở khung hình kế trước khi màn đen mở ra. */
const HANDOFF_DELAY_MS = 180;
const REVEAL_FADE_MS = 700;

function veilOpacityAt(shot: IntroShot | undefined, next: IntroShot | undefined, elapsed: number) {
  if (!shot) return 1;
  if (shot.blackout) return 1;

  let veil = 0;

  const fadeIn = TRANSITION_MS[shot.transitionIn];
  if (fadeIn > 0 && elapsed < fadeIn) veil = 1 - elapsed / fadeIn;

  // Cú chuyển cảnh thuộc về cảnh SAU, nên đoạn phủ đen cuối cảnh này phải hỏi
  // cảnh kế tiếp muốn được mở ra kiểu gì.
  const fadeOut = next ? TRANSITION_MS[next.transitionIn] : 0;
  const remaining = shot.durationMs - elapsed;
  if (fadeOut > 0 && remaining < fadeOut) veil = Math.max(veil, 1 - remaining / fadeOut);

  return clamp01(veil);
}

function subtitleOpacityAt(shot: IntroShot | undefined, elapsed: number) {
  if (!shot?.subtitle) return 0;
  const showAt = shot.subtitle.showAtMs ?? 300;
  const hideAt = shot.subtitle.hideAtMs ?? shot.durationMs - 300;
  if (elapsed < showAt) return 0;
  if (elapsed > hideAt) return clamp01(1 - (elapsed - hideAt) / SUBTITLE_FADE_MS);
  return clamp01((elapsed - showAt) / SUBTITLE_FADE_MS);
}

function gradeFilter(shot: IntroShot | undefined) {
  const grade = shot?.grade;
  if (!grade) return "none";
  const parts = [`saturate(${grade.saturate})`];
  if (grade.sepia) parts.push(`sepia(${grade.sepia})`);
  if (grade.brightness) parts.push(`brightness(${grade.brightness})`);
  return parts.join(" ");
}

type Stage = "checking" | "fallback" | "running" | "outro" | "done";

export default function IntroCinematicUI() {
  const [stage, setStage] = useState<Stage>("checking");

  const veilRef = useRef<HTMLDivElement>(null);
  const gradeRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const endingRef = useRef(false);

  const phase = useCinematicStore((state) => state.phase);
  const shotIndex = useCinematicStore((state) => state.shotIndex);
  const startCinematic = useCinematicStore((state) => state.start);
  const finishCinematic = useCinematicStore((state) => state.finish);

  const setHasSeenChapter1Intro = useGameStore((state) => state.setHasSeenChapter1Intro);
  const setInteracting = useGameStore((state) => state.setInteracting);

  // Chế độ dựng cảnh `/forest?cine=<số cảnh>`: luôn chiếu (kể cả khi đã xem),
  // luôn mở màn đen, không tự kết thúc. Xem `debugShot` trong useCinematicStore.
  const debugMode = useSearchParams().get("cine") !== null;

  const shot = CHAPTER1_INTRO_SHOTS[shotIndex];

  // Quyết định có chiếu hay không — chỉ MỘT lần, sau khi đã hydrate. Cờ "đã xem"
  // nằm trong localStorage nên không đọc được lúc render trên server; trong khi
  // `stage === 'checking'` component không vẽ gì cả, nên không có chuyện HTML
  // server khác HTML client (cùng lý do `src/app/page.tsx` có cờ `mounted`).
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      if (useGameStore.getState().hasSeenChapter1Intro && !debugMode) {
        setStage("done");
        return;
      }

      if (!debugMode && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setStage("fallback");
        return;
      }

      setStage("running");
      setInteracting(true);
      startCinematic();
    });

    return () => cancelAnimationFrame(handle);
  }, [debugMode, setInteracting, startCinematic]);

  /** Kết thúc cutscene (hết cảnh cuối HOẶC người chơi bấm Passer). */
  const endIntro = useCallback(() => {
    if (endingRef.current) return;
    endingRef.current = true;

    if (veilRef.current) {
      veilRef.current.style.transition = `opacity ${SKIP_FADE_MS}ms linear`;
      veilRef.current.style.opacity = "1";
    }

    window.setTimeout(() => {
      setHasSeenChapter1Intro(true);
      setInteracting(false);
      // phase → 'idle' tháo máy quay điện ảnh; drei tự trả camera ortho về.
      finishCinematic();
      setStage("outro");
    }, SKIP_FADE_MS);
  }, [finishCinematic, setHasSeenChapter1Intro, setInteracting]);

  // Cảnh cuối đã chạy hết.
  useEffect(() => {
    if (phase === "ending") endIntro();
  }, [phase, endIntro]);

  // Vòng lặp hiển thị: đọc đồng hồ của máy quay, ghi thẳng vào style.
  useEffect(() => {
    if (stage !== "running") return;

    let handle = 0;
    const tick = () => {
      const current = CHAPTER1_INTRO_SHOTS[cinematicClock.shotIndex];
      const next = CHAPTER1_INTRO_SHOTS[cinematicClock.shotIndex + 1];
      const elapsed = cinematicClock.shotElapsedMs;

      if (veilRef.current && !endingRef.current) {
        const store = useCinematicStore.getState();
        veilRef.current.style.opacity = String(
          store.debugShot !== null
            ? 0
            : store.phase === "preroll"
              ? 1
              : veilOpacityAt(current, next, elapsed),
        );
      }
      if (subtitleRef.current) {
        subtitleRef.current.style.opacity = String(subtitleOpacityAt(current, elapsed));
      }

      handle = window.requestAnimationFrame(tick);
    };

    handle = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(handle);
  }, [stage]);

  // Chỉnh màu đổi theo cảnh, không theo khung hình — để CSS transition lo phần
  // chuyển mượt giữa hai bảng màu.
  useEffect(() => {
    if (!gradeRef.current) return;
    gradeRef.current.style.backdropFilter = gradeFilter(shot);
    gradeRef.current.style.backgroundColor = shot?.grade?.tint ?? "transparent";
  }, [shot]);

  // Escape = Passer. Nghe ở `window` như mọi phím tương tác khác trong game
  // (drei KeyboardControls chỉ lo di chuyển — xem CLAUDE.md).
  useEffect(() => {
    if (stage !== "running") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Escape" || event.code === "Space") endIntro();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stage, endIntro]);

  // Mở màn đen ra sau khi đã trả quyền điều khiển.
  useEffect(() => {
    if (stage !== "outro") return;

    const reveal = window.setTimeout(() => {
      if (veilRef.current) {
        veilRef.current.style.transition = `opacity ${REVEAL_FADE_MS}ms ease-out`;
        veilRef.current.style.opacity = "0";
      }
    }, HANDOFF_DELAY_MS);

    const done = window.setTimeout(
      () => setStage("done"),
      HANDOFF_DELAY_MS + REVEAL_FADE_MS + 50,
    );

    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(done);
    };
  }, [stage]);

  // Dọn dẹp khi rời trang giữa chừng (reload, đổi route): không được để người
  // chơi bị đóng băng vĩnh viễn.
  useEffect(() => {
    return () => {
      if (useCinematicStore.getState().phase !== "idle") {
        useCinematicStore.getState().finish();
        useGameStore.getState().setInteracting(false);
      }
    };
  }, []);

  if (stage === "checking" || stage === "done") return null;
  if (stage === "fallback") return <ForestIntroUI />;

  return (
    <div className="fixed inset-0 z-[120] pointer-events-none select-none">
      {/* Chỉnh màu — nằm dưới cùng để lớp phủ đen và chữ không bị lọc màu theo. */}
      <div
        ref={gradeRef}
        className="absolute inset-0 transition-[backdrop-filter,background-color] duration-700 ease-out"
      />

      {/* Lớp phủ đen: chuyển cảnh, màn đen, và cú bàn giao về gameplay. */}
      <div ref={veilRef} className="absolute inset-0 bg-black" style={{ opacity: 1 }} />

      {/* Letterbox */}
      <div
        className={`absolute inset-x-0 top-0 bg-black transition-[height] duration-700 ease-out ${
          stage === "running" ? "h-[7.5vh]" : "h-0"
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 bg-black transition-[height] duration-700 ease-out ${
          stage === "running" ? "h-[7.5vh]" : "h-0"
        }`}
      />

      {/* Phụ đề tiếng Pháp */}
      <div
        ref={subtitleRef}
        className="absolute inset-x-0 bottom-[12vh] flex justify-center px-8"
        style={{ opacity: 0 }}
      >
        <p className="font-story max-w-3xl text-center text-2xl md:text-3xl leading-relaxed text-amber-50 [text-shadow:0_2px_12px_rgba(0,0,0,0.95)]">
          {shot?.subtitle?.fr}
        </p>
      </div>

      {/* Passer */}
      {stage === "running" && (
        <button
          type="button"
          onClick={endIntro}
          className="pointer-events-auto absolute bottom-[2.5vh] right-6 rounded-full border border-amber-200/30 bg-black/50 px-5 py-2 text-sm tracking-widest uppercase text-amber-100/80 transition hover:border-amber-200/70 hover:text-amber-50"
        >
          Passer l&apos;intro · Échap
        </button>
      )}
    </div>
  );
}

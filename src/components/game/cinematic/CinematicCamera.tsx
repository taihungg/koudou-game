"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import * as THREE from "three";
import type { IntroShot, Vec3 } from "@/config/cinematics/types";
import { cinematicClock, resetCinematicClock, useCinematicStore } from "@/store/useCinematicStore";
import { cameraFocus, releaseCameraFocus } from "@/utils/cameraFocus";
import { gameplayCamera } from "@/utils/gameplayCamera";
import { clamp01, EASINGS } from "@/utils/easing";

/**
 * Máy quay điện ảnh — chỉ dùng trong cutscene, KHÔNG phải camera gameplay.
 *
 * Ba điều cần biết trước khi sửa file này:
 *
 * 1. Đây là camera PHỐI CẢNH, trong khi gameplay dùng ortho. Cảm giác "Alex bé
 *    nhỏ trước khu rừng khổng lồ" là hiệu ứng thuần phối cảnh, ortho không tạo
 *    được.
 *
 *    Quyền "camera mặc định" được giao tay ba, đừng phá vỡ giao kèo này:
 *      - `/forest/page.tsx` đặt `makeDefault={!cinematic}` → camera ortho TỰ
 *        NHƯỜNG quyền khi cutscene bắt đầu và tự lấy lại khi cutscene xong;
 *      - file này gọi `set({ camera })` để nhận quyền, và trả lại đúng camera
 *        ghi trong `src/utils/gameplayCamera.ts` khi unmount (KHÔNG dựa vào
 *        `oldCam` của drei — nó tự khôi phục sai, xem file đó);
 *      - việc trả lại phải diễn ra NGAY trong cleanup, không được hoãn.
 *    Trả nhầm camera phối cảnh về cho gameplay là hỏng nặng: `Player.tsx` viết
 *    cho ortho nên sẽ lerp `camera.zoom` về 40 → phóng đại 40 lần, nhân vật to
 *    kín màn hình.
 *
 * 2. Không tranh chấp với `Player.tsx`: `useFrame` của Player early-return khi
 *    `isInteracting`, và nó return TRƯỚC đoạn cập nhật camera. Cutscene luôn bật
 *    cờ đó nên máy quay ở đây được toàn quyền.
 *
 * 3. Tâm stream chunk được chuyển sang `cameraFocus` (xem file đó). Bỏ bước này
 *    thì `ZonedForest` sẽ suy vị trí người chơi từ `camera.position − 20` và nạp
 *    chunk loạn theo đường bay.
 */

/** Số khung hình tối thiểu phải trôi qua trước khi mở màn, để chunk quanh cảnh
 *  đầu kịp dựng. Thiếu bước này, cảnh 1 sẽ mở ra trên mặt đất trọc. */
const PREROLL_MIN_FRAMES = 8;
/**
 * Trần cho khâu chờ nạp. `useProgress.active` bật lại mỗi khi có model mới vào
 * hàng đợi, nên trên máy chậm (hoặc khi một model lỗi) nó có thể không bao giờ
 * rảnh — mà màn đen không có điểm dừng thì người chơi tưởng game treo. Quá hạn
 * thì cứ mở màn: cảnh đầu hơi trống một nhịp vẫn hơn là đứng hình.
 */
const PREROLL_MAX_MS = 4000;
/** Chặn delta khi tab bị ẩn rồi bật lại — nếu không, cutscene nhảy cóc vài cảnh. */
const MAX_FRAME_DELTA_MS = 100;

/**
 * Camera điện ảnh, tạo một lần ở module scope.
 *
 * Không để trong `useMemo`/`useRef` vì nó bị GHI mỗi khung hình (vị trí, hướng
 * nhìn, fov) mà eslint-plugin-react-hooks cấm mutate giá trị do hook trả về,
 * cũng như cấm đọc ref trong thân render. Mỗi lúc chỉ có đúng một cutscene chạy
 * nên một thực thể dùng chung là đủ — cùng lối "ô nhớ module-scope" mà
 * `minimapProbe`/`cameraFocus` đang dùng.
 */
const cinematicCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1200);

// Vector dùng lại giữa các khung hình, tránh cấp phát trong vòng lặp render.
const _pos = new THREE.Vector3();
const _target = new THREE.Vector3();
const _from = new THREE.Vector3();
const _to = new THREE.Vector3();

function lerpNumber(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Đặt camera đúng trạng thái của `shot` tại tiến độ `rawT` ∈ [0,1]. */
function applyShot(camera: THREE.PerspectiveCamera, shot: IntroShot, rawT: number) {
  const cam = shot.camera;
  const ease = EASINGS[("ease" in cam && cam.ease) || "easeInOutCubic"];
  const t = ease(clamp01(rawT));

  let fovFrom = 45;
  let fovTo = 45;

  switch (cam.mode) {
    case "hold": {
      _pos.fromArray(cam.position as Vec3);
      _target.fromArray(cam.lookAt as Vec3);
      fovFrom = fovTo = cam.fov ?? 45;
      break;
    }
    case "dolly": {
      _pos.copy(_from.fromArray(cam.from)).lerp(_to.fromArray(cam.to), t);
      _target
        .copy(_from.fromArray(cam.lookAtFrom))
        .lerp(_to.fromArray(cam.lookAtTo ?? cam.lookAtFrom), t);
      fovFrom = cam.fov ?? 45;
      fovTo = cam.fovTo ?? fovFrom;
      break;
    }
    case "orbit": {
      const angle = lerpNumber(cam.fromAngle, cam.toAngle, t);
      const radius = lerpNumber(cam.radius, cam.radiusTo ?? cam.radius, t);
      const height = lerpNumber(cam.height, cam.heightTo ?? cam.height, t);
      _target.fromArray(cam.center);
      _pos.set(
        _target.x + Math.cos(angle) * radius,
        height,
        _target.z + Math.sin(angle) * radius,
      );
      fovFrom = cam.fov ?? 45;
      fovTo = cam.fovTo ?? fovFrom;
      break;
    }
  }

  const fov = lerpNumber(fovFrom, fovTo, t);
  if (Math.abs(camera.fov - fov) > 0.001) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }

  camera.position.copy(_pos);
  camera.lookAt(_target);

  // Cảnh màn đen / cảnh sân khấu rời nằm ngoài bản đồ: giữ nguyên tâm stream cũ
  // thay vì kéo chunk chạy theo một điểm nhìn vô nghĩa.
  if (!shot.blackout && !shot.stage) {
    cameraFocus.x = _target.x;
    cameraFocus.z = _target.z;
  }
}

interface CinematicCameraProps {
  shots: IntroShot[];
}

export default function CinematicCamera({ shots }: CinematicCameraProps) {
  const set = useThree((state) => state.set);
  const size = useThree((state) => state.size);
  const camera = cinematicCamera;

  // Chỉ số cảnh hiện tại nằm ở REF, không ở store: vòng lặp `useFrame` cần đọc
  // lại ngay trong cùng khung hình vừa ghi, mà `set()` của Zustand chỉ hiện ra ở
  // lần render sau → dùng store làm nguồn sẽ tăng cảnh hai lần.
  const shotRef = useRef(0);
  const elapsedRef = useRef(0);
  const framesRef = useRef(0);

  // Sân khấu riêng của cảnh (nền đen tuyệt đối, tắt sương) cho những cảnh đặt
  // camera ra ngoài bản đồ. Giữ lại giá trị `Environment.tsx` đã khai báo để trả
  // về đúng như cũ khi rời cảnh.
  const sceneRef = useRef<THREE.Scene | null>(null);
  const savedStageRef = useRef<{ background: THREE.Scene["background"]; fog: THREE.Scene["fog"] } | null>(null);
  const activeStageRef = useRef<string | null>(null);

  // Đổi camera mặc định, và trả lại đúng camera gameplay khi tháo.
  useEffect(() => {
    set({ camera });

    return () => {
      // Màn chơi nào có cutscene thì phải đăng ký camera của nó vào
      // `gameplayCamera` (xem file đó) — nếu không, không có gì để trả về.
      const target = gameplayCamera.current;
      if (target) set({ camera: target as typeof camera });
      // TUYỆT ĐỐI không hoãn việc trả camera sang khung hình sau
      // (`requestAnimationFrame`). React StrictMode ở chế độ dev chạy effect
      // theo trình tự mount → cleanup → mount lại, nên một cú trả bị hoãn sẽ rơi
      // xuống SAU lần mount thứ hai và đá camera điện ảnh ra ngay giữa cutscene:
      // màn hình đứng im ở góc nhìn ortho cũ suốt cả intro.
    };
  }, [set, camera]);

  // Giữ tỉ lệ khung hình khớp với canvas (R3F chỉ tự lo việc này cho camera nó
  // tạo ra, không lo cho camera mình tự dựng).
  useEffect(() => {
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useEffect(() => {
    const first = shots[0];
    _target.fromArray(
      first.camera.mode === "hold" ? first.camera.lookAt : first.camera.mode === "dolly" ? first.camera.lookAtFrom : first.camera.center,
    );
    cameraFocus.x = _target.x;
    cameraFocus.z = _target.z;
    cameraFocus.override = true;
    shotRef.current = 0;
    elapsedRef.current = 0;
    framesRef.current = 0;
    resetCinematicClock();

    return () => {
      releaseCameraFocus();
      resetCinematicClock();
      // Rời trang giữa một cảnh có sân khấu riêng: trả nền/sương về cho Environment.
      if (sceneRef.current && savedStageRef.current) {
        sceneRef.current.background = savedStageRef.current.background;
        sceneRef.current.fog = savedStageRef.current.fog;
        savedStageRef.current = null;
        activeStageRef.current = null;
      }
    };
  }, [shots]);

  /**
   * Bật/tắt sân khấu riêng của cảnh. Làm trong `useFrame` (nơi `scene` là tham
   * số, không phải giá trị trả về từ hook) thay vì trong `useEffect` theo
   * `shotIndex`: bớt một lần subscribe store và tránh sửa giá trị của hook.
   */
  const syncStage = (scene: THREE.Scene, shot: IntroShot) => {
    sceneRef.current = scene;
    const wanted = shot.stage?.background ?? null;
    if (wanted === activeStageRef.current) return;

    if (wanted === null) {
      if (savedStageRef.current) {
        scene.background = savedStageRef.current.background;
        scene.fog = savedStageRef.current.fog;
        savedStageRef.current = null;
      }
    } else {
      if (!savedStageRef.current) {
        savedStageRef.current = { background: scene.background, fog: scene.fog };
      }
      scene.background = new THREE.Color(wanted);
      scene.fog = null;
    }
    activeStageRef.current = wanted;
  };

  useFrame((state, delta) => {
    const store = useCinematicStore.getState();

    // Chế độ dựng cảnh: ghim một cảnh, không chạy tiếp (xem `debugShot` trong
    // useCinematicStore.ts).
    if (store.debugShot !== null) {
      const frozen = shots[Math.max(0, Math.min(shots.length - 1, store.debugShot))];
      syncStage(state.scene, frozen);
      applyShot(camera, frozen, store.debugProgress);
      cinematicClock.shotIndex = store.debugShot;
      cinematicClock.shotElapsedMs = store.debugProgress * frozen.durationMs;
      cinematicClock.shotDurationMs = frozen.durationMs;
      return;
    }

    if (store.phase === "preroll") {
      syncStage(state.scene, shots[0]);
      applyShot(camera, shots[0], 0);
      framesRef.current += 1;
      elapsedRef.current += Math.min(delta * 1000, MAX_FRAME_DELTA_MS);
      const waitedLongEnough = elapsedRef.current >= PREROLL_MAX_MS;
      if (
        framesRef.current >= PREROLL_MIN_FRAMES &&
        (waitedLongEnough || !useProgress.getState().active)
      ) {
        elapsedRef.current = 0;
        store.markReady();
      }
      return;
    }

    // 'ending' → giữ nguyên khung hình cuối trong lúc lớp DOM bàn giao.
    if (store.phase !== "playing") return;

    elapsedRef.current += Math.min(delta * 1000, MAX_FRAME_DELTA_MS);

    let shot = shots[shotRef.current];
    while (elapsedRef.current >= shot.durationMs) {
      if (shotRef.current + 1 >= shots.length) {
        applyShot(camera, shot, 1);
        store.beginEnding();
        return;
      }
      elapsedRef.current -= shot.durationMs;
      shotRef.current += 1;
      shot = shots[shotRef.current];
      store.setShotIndex(shotRef.current);
    }

    syncStage(state.scene, shot);
    applyShot(camera, shot, elapsedRef.current / shot.durationMs);

    cinematicClock.shotIndex = shotRef.current;
    cinematicClock.shotElapsedMs = elapsedRef.current;
    cinematicClock.shotDurationMs = shot.durationMs;
  });

  // Camera không cần nằm trong scene graph: WebGLRenderer tự gọi
  // `updateMatrixWorld()` cho camera không có cha.
  return null;
}

"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

/**
 * Bầu trời — ảnh nền equirectangular sinh bằng canvas 2D, KHÔNG phải vòm cầu 3D.
 *
 * Vì sao chọn cách này:
 *   - `scene.background` luôn nằm sau mọi thứ, không bị sương phủ, không thêm
 *     draw call nào, và không phải bám theo camera từng khung hình;
 *   - cutscene có những cảnh đổi nền thành đen tuyệt đối (`ShotStage` trong
 *     `src/config/cinematics/types.ts`) bằng cách ghi đè `scene.background` rồi
 *     trả lại — nếu bầu trời là một mesh thì nó vẫn hiện ra giữa "hư không" và
 *     phá hỏng cảnh cuộn bản đồ. Là ảnh nền thì cơ chế cũ chạy đúng, khỏi nối
 *     thêm dây nào.
 *
 * Ảnh được vẽ MỘT LẦN lúc mount rồi dùng lại; không có gì động theo thời gian.
 */

/**
 * Hướng mặt trời — dùng chung cho ĐĨA mặt trời vẽ trên nền trời và cho
 * `directionalLight` trong `Environment.tsx`. Hai thứ này lệch nhau là bóng đổ
 * một đằng, mặt trời một nẻo.
 */
export const SUN_POSITION: [number, number, number] = [15, 7.5, 15];

/** Màu đỉnh trời. */
const ZENITH = "#3f83c9";
/**
 * Màu sát chân trời. PHẢI trùng màu sương (`Environment.tsx`) — sương là thứ
 * nuốt dần rừng ở xa, nên hai màu lệch nhau là lộ ngay một đường viền cứng ở
 * chỗ rừng chạm trời.
 */
export const HORIZON = "#bcd3e0";
/** Dưới đường chân trời (hiếm khi thấy, chỉ lộ khi camera chúc xuống mép bản đồ). */
const BELOW = "#9fb3bd";

const SUN_CORE = "#fffdf0";
const SUN_GLOW = "#ffe9a8";

/** Bán kính góc của đĩa mặt trời. Mặt trời thật chỉ 0,53° — phóng to lên cho
 *  hợp tông low-poly, nhỏ quá thì chỉ còn là một chấm mờ. */
const SUN_ANGULAR_RADIUS_DEG = 3.2;
/** Quầng sáng quanh đĩa, tính theo lần bán kính đĩa. */
const SUN_GLOW_SCALE = 5.5;

const TEXTURE_WIDTH = 2048;
const TEXTURE_HEIGHT = 1024;

function createSkyTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Dải màu theo ĐỘ CAO thật, không phải theo pixel: three.js lấy mẫu ảnh
  // equirect bằng `v = asin(dir.y)/π + 0.5`, nên hàng ảnh ↔ góc ngẩng là quan hệ
  // tuyến tính và một gradient dọc đơn giản là đủ đúng.
  const gradient = ctx.createLinearGradient(0, 0, 0, TEXTURE_HEIGHT);
  gradient.addColorStop(0, ZENITH);
  gradient.addColorStop(0.32, ZENITH);
  // Dồn phần chuyển màu về sát chân trời (v = 0.5) để trời "cao" và trong, thay
  // vì nhạt đều từ trên xuống.
  gradient.addColorStop(0.47, HORIZON);
  gradient.addColorStop(0.5, HORIZON);
  gradient.addColorStop(1, BELOW);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  // Vị trí mặt trời trên ảnh equirect, theo đúng công thức `equirectUv` của
  // three.js: u = atan2(z, x)/2π + 0.5, v = asin(y)/π + 0.5 (v = 0 ở ĐÁY ảnh).
  const dir = new THREE.Vector3(...SUN_POSITION).normalize();
  const u = Math.atan2(dir.z, dir.x) / (Math.PI * 2) + 0.5;
  const v = Math.asin(dir.y) / Math.PI + 0.5;
  const sunX = u * TEXTURE_WIDTH;
  const sunY = (1 - v) * TEXTURE_HEIGHT;

  // Một đĩa TRÒN trên bầu trời trải ra thành hình ellipse trên ảnh equirect, bị
  // kéo ngang theo 1/cos(độ cao) — càng lên cao càng kéo mạnh. Bỏ qua bước này
  // là mặt trời bị bóp méo thành hình bầu dục đứng khi nhìn từ trong game.
  const elevation = Math.asin(dir.y);
  const radiusY = (SUN_ANGULAR_RADIUS_DEG / 180) * TEXTURE_HEIGHT;
  const radiusX = radiusY / Math.max(Math.cos(elevation), 0.05);

  const drawSunEllipse = (scale: number, fill: string | CanvasGradient) => {
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.scale(radiusX * scale, radiusY * scale);
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.restore();
    ctx.fillStyle = fill;
    ctx.fill();
  };

  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, radiusX * SUN_GLOW_SCALE);
  glow.addColorStop(0, "rgba(255, 233, 168, 0.55)");
  glow.addColorStop(0.25, "rgba(255, 233, 168, 0.22)");
  glow.addColorStop(1, "rgba(255, 233, 168, 0)");
  drawSunEllipse(SUN_GLOW_SCALE, glow);
  drawSunEllipse(1.25, SUN_GLOW);
  drawSunEllipse(1, SUN_CORE);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  // Ảnh cuộn vòng quanh trục đứng: không lặp ngang thì lộ đường nối ở phía sau.
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/** Đặt bên trong `<Canvas>`. Gắn khai báo qua `attach` để cutscene vẫn đổi/trả
 *  `scene.background` bằng cách cũ mà không cần biết tới component này. */
export default function SkyBackground() {
  const texture = useMemo(() => createSkyTexture(), []);

  useEffect(() => () => texture.dispose(), [texture]);

  return <primitive attach="background" object={texture} />;
}

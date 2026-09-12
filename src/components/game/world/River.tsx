"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RIVER_HALF_WIDTH } from "@/config/world/chapter1";
import { RIVER_CURVE, RIVER_LENGTH } from "@/config/world/river";

/**
 * Mặt nước sông — một ribbon bám theo đường cong thật (river.ts) thay vì dải
 * chữ nhật thẳng, hoạt cảnh bằng shader thay vì màu nền tô tĩnh của
 * TerrainTiles.
 *
 * Không dùng texture/normal map: mọi hiệu ứng (sóng lăn tăn, sọc dòng chảy,
 * lấp lánh nắng, bọt ven bờ) đều là hàm lượng giác rẻ trong fragment shader,
 * giữ đúng tinh thần low-poly của các asset khác trong game.
 *
 * `uv.x` được gán bằng MÉT dọc theo đường cong (không phải 0..1) — nhờ vậy
 * các hằng số tần số trong shader không phụ thuộc tổng chiều dài sông, và nếu
 * sau này chỉnh lại đường cong dài/ngắn hơn thì sóng/sọc vẫn giữ nguyên bước
 * sóng thực tế tính bằng mét.
 */

const SEGMENTS_ALONG = 220;
const SEGMENTS_ACROSS = 6;

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying float vWave;
  uniform float uTime;

  void main() {
    vUv = uv;
    vec3 pos = position;
    // Hai tần số chồng lên nhau để gợn sóng không lặp lại đều đặn.
    // uv.x là MÉT dọc đường cong nên bước sóng ổn định bất kể sông dài bao nhiêu.
    float wave = sin(uv.x * 0.15 + uTime * 1.4) * 0.06
               + sin(uv.x * 0.05 - uTime * 0.8) * 0.09;
    pos.y += wave;
    vWave = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  varying float vWave;
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uFoam;

  void main() {
    // 0 ở tim lòng sông, 1 sát bờ — dùng để pha màu sâu/nông và tạo viền bọt.
    float edge = abs(vUv.y - 0.5) * 2.0;

    // Hai lớp sọc trôi tốc độ khác nhau dọc trục sông, mô phỏng dòng chảy có
    // chiều sâu thay vì một lớp phẳng lì. Hệ số tần số tính theo mét thật.
    float flowA = fract(vUv.x * 0.02083 - uTime * 0.35);
    float flowB = fract(vUv.x * 0.008333 - uTime * 0.18 + 0.5);
    float stripes = smoothstep(0.0, 0.5, flowA) * smoothstep(1.0, 0.5, flowA) * 0.5
                  + smoothstep(0.0, 0.5, flowB) * smoothstep(1.0, 0.5, flowB) * 0.3;

    vec3 base = mix(uDeep, uShallow, clamp(edge * 0.55 + vWave * 1.2, 0.0, 1.0));
    base += stripes * 0.05;

    // Lấp lánh nắng: đốm sáng giả rẻ tiền, không cần noise texture.
    float sparkle = sin(vUv.x * 0.5 + uTime * 3.0) * sin(vUv.y * 90.0 - uTime * 2.2);
    base += pow(max(sparkle, 0.0), 10.0) * 0.6;

    float foam = smoothstep(0.72, 1.0, edge);
    vec3 color = mix(base, uFoam, foam * 0.85);

    gl_FragColor = vec4(color, 0.9);
  }
`;

/** Dựng ribbon: lấy mẫu mịn trên RIVER_CURVE, đẩy hai mép ra ±RIVER_HALF_WIDTH theo pháp tuyến. */
function buildRibbonGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= SEGMENTS_ALONG; i++) {
    const t = i / SEGMENTS_ALONG;
    const point = RIVER_CURVE.getPointAt(t);
    const tangent = RIVER_CURVE.getTangentAt(t);
    const normal = new THREE.Vector3().crossVectors(up, tangent).normalize();
    const meters = t * RIVER_LENGTH;

    for (let j = 0; j <= SEGMENTS_ACROSS; j++) {
      const across = (j / SEGMENTS_ACROSS - 0.5) * 2 * RIVER_HALF_WIDTH;
      positions.push(point.x + normal.x * across, 0, point.z + normal.z * across);
      uvs.push(meters, j / SEGMENTS_ACROSS);
    }
  }

  const rowStride = SEGMENTS_ACROSS + 1;
  for (let i = 0; i < SEGMENTS_ALONG; i++) {
    for (let j = 0; j < SEGMENTS_ACROSS; j++) {
      const a = i * rowStride + j;
      const b = a + rowStride;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export default function River() {
  // Geometry chỉ ĐỌC, không mutate — an toàn khi lấy trực tiếp từ useMemo.
  const geometry = useMemo(() => buildRibbonGeometry(), []);

  // uTime phải bị GHI ĐÈ mỗi khung hình. eslint-plugin-react-hooks cấm mutate
  // trực tiếp giá trị trả về từ useMemo, nên uniforms object được tạo một lần
  // ở đây rồi chỉ mutate qua materialRef (kênh mutable đúng chuẩn của React)
  // bên trong useFrame — không phải trong thân render.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color("#2a5866") },
      uShallow: { value: new THREE.Color("#5a97a0") },
      uFoam: { value: new THREE.Color("#eaf6f2") },
    }),
    [],
  );
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    const material = materialRef.current;
    return () => {
      geometry.dispose();
      material?.dispose();
    };
  }, [geometry]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    // y = 0.1: nhô nhẹ trên lớp terrain để không xung đột z-fighting với màu
    // nước đã tô sẵn trong TerrainTiles (lớp đó vẫn giữ, làm nền mờ bên dưới).
    <mesh geometry={geometry} position={[0, 0.1, 0]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

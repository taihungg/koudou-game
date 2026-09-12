"use client";

import ZonedForest from "./world/ZonedForest";

// Cùng tông với BIOME_GROUND.deep_canopy — chunk ở rìa vùng render (hoặc lọt
// qua khe hở khi camera bị zoom rộng bất thường) tan dần vào màu nền thay vì
// lộ ra một mảng ĐEN THUẦN, thứ trước đây đọc như "cây trôi nổi giữa hư không"
// vì deep_canopy quá tối để phân biệt với clearColor mặc định của Canvas.
const VOID_COLOR = "#16220f";

export default function Environment() {
  return (
    <>
      <color attach="background" args={[VOID_COLOR]} />
      {/* Sương xa: chunk mới nạp/dỡ tan dần thay vì bật/tắt đột ngột, và che
          luôn viền vuông cứng của vùng render khi nhìn từ xa hoặc zoom rộng. */}
      <fogExp2 attach="fog" args={[VOID_COLOR, 0.0085]} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Rừng có biên, dựng theo zone (kou-dou.md §4). /village vẫn dùng
          InfiniteForest cho tới khi Chương 2 được thiết kế lại. */}
      <ZonedForest />
    </>
  );
}

"use client";

import SkyBackground, { HORIZON, SUN_POSITION } from "./world/SkyBackground";
import ZonedForest from "./world/ZonedForest";

/**
 * Màu sương. PHẢI bằng màu chân trời của `SkyBackground` — sương là thứ nuốt dần
 * rừng ở xa, nên lệch màu là lộ ngay một đường viền cứng đúng chỗ rừng chạm
 * trời. Trước đây cả hai đều là màu nền tối `#16220f` (cùng tông
 * `BIOME_GROUND.deep_canopy`); nay trời có màu nên mốc chung chuyển sang màu
 * chân trời.
 */
const FOG_COLOR = HORIZON;

export default function Environment() {
  return (
    <>
      <SkyBackground />
      {/* Sương xa: chunk mới nạp/dỡ tan dần thay vì bật/tắt đột ngột, và che
          luôn viền vuông cứng của vùng render khi nhìn từ xa hoặc zoom rộng. */}
      <fogExp2 attach="fog" args={[FOG_COLOR, 0.0085]} />

      {/* Lighting — vị trí lấy từ SUN_POSITION để bóng đổ khớp với đĩa mặt trời
          thật sự nhìn thấy trên nền trời. */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={SUN_POSITION}
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

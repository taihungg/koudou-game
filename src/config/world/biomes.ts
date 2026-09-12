import { GAME_ASSETS } from '@/constants/assets';
import type { BiomeId, BiomePalette } from './types';

/**
 * Palette thực vật theo biome — kou-dou.md §5 "Forest visual layers".
 *
 * Chỉ 4 biome có palette đầy đủ ở P1: `deep_canopy` (nền mặc định + vành chắn
 * biên), `clearing` (Z0), `light_forest` (Z1), `medicinal_grove` (Z2). Các
 * biome còn lại (riverbank đã có nước riêng; ancient_forest/rocky/
 * cabin_clearing/logged) chưa được author — `getPalette()` lùi về
 * `deep_canopy` cho tới khi làm ở P3, để chunk không bao giờ trống trơn.
 *
 * heightRange lấy từ số đo thật (`node scripts/audit-models.mjs`), không phải
 * hệ số scale mò — mỗi instance random một chiều cao mục tiêu trong khoảng rồi
 * mới suy ra scale qua `scaleToHeight`, nên trộn nhiều nguồn asset vẫn ra một
 * dải chiều cao thống nhất.
 *
 * `spacing` là khoảng cách trung bình giữa các cây (mét), không phải mật độ
 * trên 100 m² — xem ghi chú trong types.ts về lý do đổi đơn vị.
 */

const M = GAME_ASSETS.MODELS;

export const BIOME_PALETTES: Partial<Record<BiomeId, BiomePalette>> = {
  // Nền mặc định của toàn bản đồ + vành chắn biên dày. Tán khép gần kín —
  // đây là "bức tường cây" giữ người chơi không cảm thấy mình đâm vào kính ở
  // biên bản đồ (kou-dou.md §5 Layer 1).
  deep_canopy: {
    canopy: {
      models: [
        M.FOREST1.TREE_2_D_COLOR1,
        M.FOREST1.TREE_2_E_COLOR1,
        M.FOREST1.TREE_1_C_COLOR1,
        M.FOREST1.TREE_4_C_COLOR1,
      ],
      heightRange: [8, 12],
      spacing: 9,
    },
    understory: {
      models: [M.FOREST1.TREE_3_B_COLOR1, M.FOREST1.TREE_1_A_COLOR1],
      heightRange: [3.5, 6],
      spacing: 8,
    },
    shrub: {
      models: [M.FOREST1.BUSH_2_C_COLOR1, M.FOREST1.BUSH_4_D_COLOR1, M.TREES.BUSH_2],
      heightRange: [1, 2],
      spacing: 7,
    },
    clutter: {
      models: [M.FOREST1.GRASS_2_C_SINGLESIDED_COLOR1, M.FOREST.MUSHROOM_GREY],
      heightRange: [0.3, 0.8],
      spacing: 2.8,
    },
    props: {
      models: [M.FOREST.ROOT_1, M.FOREST.ROOT_2],
      heightRange: [0.4, 0.6],
      spacing: 16,
    },
  },

  // Z0 — Clairière d'arrivée: mật độ THẤP có chủ đích (kou-dou.md Z0: "vài
  // phút đầu không nên áp đảo người chơi"). Tán rất thưa để thấy trời, cỏ hoa
  // dày dưới chân bù lại cảm giác trống.
  clearing: {
    canopy: {
      models: [M.NATUREKIT.TREE_DEFAULT, M.FOREST1.TREE_2_A_COLOR1],
      heightRange: [7, 9],
      spacing: 22,
    },
    shrub: {
      models: [M.FOREST.BUSH_1, M.FOREST.BUSH_3],
      heightRange: [1, 1.6],
      spacing: 13,
    },
    clutter: {
      models: [
        M.FOREST.GRASS_CLUMP_2,
        M.FOREST.GRASS_CLUMP_4,
        M.FOREST.FLOWER_DAISY_1,
        M.FOREST.FLOWER_VIOLET_2,
      ],
      heightRange: [0.3, 0.6],
      spacing: 3.2,
    },
    props: {
      models: [M.NATUREKIT.STUMP_ROUND, M.FOREST.LOG_2],
      heightRange: [0.4, 0.7],
      spacing: 22,
    },
  },

  // Z1 — Forêt claire: chuyển tiếp mật độ trung bình, giới thiệu loài học đầu
  // tiên. Đủ thưa để hoa nhiệm vụ không bị chìm giữa bụi rậm cùng kích thước.
  light_forest: {
    canopy: {
      models: [M.FOREST1.TREE_1_B_COLOR1, M.FOREST1.TREE_2_C_COLOR1, M.NATUREKIT.TREE_TALL],
      heightRange: [7, 10],
      spacing: 12,
    },
    understory: {
      models: [M.FOREST1.TREE_1_A_COLOR1, M.QUATERNIUS.COMMONTREE_3, M.FOREST1.TREE_BARE_2_C_COLOR1],
      heightRange: [3, 5.5],
      spacing: 10,
    },
    shrub: {
      models: [M.FOREST1.BUSH_3_C_COLOR1, M.TREES.BUSH_4, M.QUATERNIUS.BUSH_1],
      heightRange: [1, 1.8],
      spacing: 9,
    },
    clutter: {
      models: [
        M.FOREST1.GRASS_2_D_SINGLESIDED_COLOR1,
        M.FOREST.MUSHROOM_RED_SPOTTED,
        M.FOREST.FLOWER_BELLFLOWER_1,
        M.NATUREKIT.GRASS_LEAFSLARGE,
      ],
      heightRange: [0.3, 0.9],
      spacing: 3,
    },
    props: {
      models: [M.FOREST.ROOT_1, M.FOREST.LOG_3, M.NATUREKIT.STUMP_OLDTALL],
      heightRange: [0.5, 1.2],
      spacing: 16,
    },
  },

  // Z2 — Bosquet médicinal: "phải khác biệt rõ về mặt thị giác" (kou-dou.md).
  // Tán vừa phải nhưng thảm dưới đất rậm hơn Forêt claire — cảm giác "vườn
  // thuốc" um tùm hơn là rừng thường, và không dùng chung bộ cây với Z1.
  medicinal_grove: {
    canopy: {
      models: [M.NATUREKIT.TREE_DEFAULT, M.QUATERNIUS.PALMTREE_1, M.FOREST1.TREE_4_B_COLOR1],
      heightRange: [7, 10],
      spacing: 13,
    },
    understory: {
      models: [M.QUATERNIUS.COMMONTREE_4, M.QUATERNIUS.COMMONTREE_5],
      heightRange: [3.5, 6],
      spacing: 11,
    },
    shrub: {
      models: [M.NATUREKIT.PLANT_BUSHDETAILED, M.QUATERNIUS.BUSHBERRIES_1, M.QUATERNIUS.BUSHBERRIES_2],
      heightRange: [1.2, 2.2],
      spacing: 7,
    },
    clutter: {
      models: [
        M.QUATERNIUS.PLANT_1,
        M.QUATERNIUS.PLANT_3,
        M.QUATERNIUS.PLANT_5,
        M.NATUREKIT.PLANT_FLATTALL,
        M.FOREST.FLOWER_BALLOON_2,
      ],
      heightRange: [0.4, 1.0],
      spacing: 2.6,
    },
    props: {
      models: [M.QUATERNIUS.ROCK_MOSS_2, M.QUATERNIUS.ROCK_MOSS_4, M.QUATERNIUS.TREESTUMP_MOSS],
      heightRange: [0.5, 1.0],
      spacing: 14,
    },
  },
};

/** Palette thật, lùi về `deep_canopy` cho biome chưa được author. */
export function getPalette(biome: BiomeId): BiomePalette {
  return BIOME_PALETTES[biome] ?? BIOME_PALETTES.deep_canopy!;
}

/**
 * Cổ thụ riêng cho vành chắn biên (ngoài PLAYABLE_HALF) — cao và dày hơn hẳn
 * `deep_canopy` bình thường, để lý do "không đi tiếp được nữa" hiện rõ bằng
 * mắt (cây khổng lồ) TRƯỚC khi người chơi chạm tường vô hình của WorldBounds,
 * thay vì cảm giác đâm vào kính giữa một khu rừng trông bình thường.
 */
export const BELT_CANOPY = {
  models: [M.FOREST1.TREE_4_C_COLOR1, M.FOREST1.TREE_2_E_COLOR1, M.NATUREKIT.TREE_TALL, M.NATUREKIT.TREE_DEFAULT],
  heightRange: [12, 17] as [number, number],
  spacing: 6,
};

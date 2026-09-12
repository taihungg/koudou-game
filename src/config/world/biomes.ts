import { GAME_ASSETS } from '@/constants/assets';
import type { BiomeId, BiomePalette } from './types';

/**
 * Palette thực vật theo biome — kou-dou.md §5 "Forest visual layers".
 *
 * P1 author 4 biome đầu: `deep_canopy` (nền mặc định + vành chắn biên),
 * `clearing` (Z0), `light_forest` (Z1), `medicinal_grove` (Z2). P3 bổ sung
 * nốt 5 biome còn lại: `riverbank` (liễu + sậy ven sông), `ancient_forest`,
 * `rocky`, `cabin_clearing`, `logged` — nay toàn bộ `BiomeId` đều có palette
 * riêng, `getPalette()` lùi về `deep_canopy` chỉ còn là lưới an toàn cho biome
 * mới thêm sau này mà quên author.
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

  // Rivière — bờ sông, không phải rừng bình thường: liễu rủ ven bờ, sậy/lily
  // sát mép nước. canopy/understory đã bị đẩy lùi khỏi mép nước thêm 6/3 m qua
  // RIVER_CLEARANCE_MARGIN (vegetationSampling.ts) nên chỉ có clutter (sậy,
  // lily — margin 0) mới thực sự chạm viền RIVER_HALF_WIDTH, đúng như sậy mọc
  // sát nước ngoài đời.
  riverbank: {
    canopy: {
      models: [M.QUATERNIUS.WILLOW_1, M.QUATERNIUS.WILLOW_2, M.QUATERNIUS.WILLOW_4, M.QUATERNIUS.WILLOW_5],
      heightRange: [6, 9],
      spacing: 14,
    },
    shrub: {
      models: [M.NATUREKIT.PLANT_FLATTALL, M.QUATERNIUS.WILLOW_3],
      heightRange: [1, 2.2],
      spacing: 9,
    },
    clutter: {
      models: [
        M.FOREST.CATTAIL_1,
        M.FOREST.CATTAIL_2,
        M.FOREST.CATTAIL_3,
        M.FOREST.CATTAIL_4,
        M.NATUREKIT.LILY_SMALL,
        M.NATUREKIT.LILY_LARGE,
      ],
      heightRange: [0.3, 0.9],
      spacing: 2.5,
    },
    props: {
      models: [M.NATUREKIT.ROCK_SMALLFLATA, M.NATUREKIT.ROCK_SMALLFLATB, M.QUATERNIUS.WOODLOG_MOSS],
      heightRange: [0.3, 0.7],
      spacing: 12,
    },
  },

  // Forêt ancienne — tán cao và dày hơn hẳn deep_canopy nền, đúng cảm giác
  // "đi vào chỗ sâu hơn" (kou-dou.md, ground color đã tối hơn ở BIOME_GROUND).
  // Liễu già + cây rêu mốc thay cho bộ cây "trẻ" dùng ở Z1/Z2.
  ancient_forest: {
    canopy: {
      models: [
        M.FOREST1.TREE_2_D_COLOR1,
        M.FOREST1.TREE_2_E_COLOR1,
        M.QUATERNIUS.WILLOW_1,
        M.QUATERNIUS.WILLOW_2,
        M.NATUREKIT.TREE_DETAILED_DARK,
      ],
      heightRange: [11, 15],
      spacing: 7,
    },
    understory: {
      models: [M.QUATERNIUS.WILLOW_3, M.FOREST1.TREE_BARE_2_A_COLOR1, M.FOREST1.TREE_BARE_2_B_COLOR1],
      heightRange: [4, 7],
      spacing: 8,
    },
    shrub: {
      models: [M.FOREST1.BUSH_2_A_COLOR1, M.FOREST1.BUSH_4_A_COLOR1, M.QUATERNIUS.BUSH_2],
      heightRange: [1, 2],
      spacing: 6,
    },
    clutter: {
      models: [M.FOREST.MUSHROOM_DARK_RED, M.FOREST.MUSHROOM_BROWN, M.FOREST.MUSHROOM_GREY],
      heightRange: [0.3, 0.7],
      spacing: 2.5,
    },
    props: {
      models: [M.QUATERNIUS.ROCK_MOSS_1, M.QUATERNIUS.ROCK_MOSS_3, M.QUATERNIUS.TREESTUMP_MOSS, M.QUATERNIUS.WOODLOG_MOSS],
      heightRange: [0.6, 1.3],
      spacing: 13,
    },
  },

  // Grotte et camp — địa hình đá, cây thưa (thông) thay vì rừng rậm, đá tảng
  // lớn và một mỏm "hang" (cliff_cave) rải rác gợi ý hang động mà không cần
  // một landmark đặt tay riêng.
  rocky: {
    canopy: {
      models: [M.NATUREKIT.TREE_PINETALLA, M.NATUREKIT.TREE_PINETALLB, M.NATUREKIT.TREE_PINEROUNDA],
      heightRange: [6, 9],
      spacing: 18,
    },
    understory: {
      models: [M.NATUREKIT.TREE_PINESMALLA, M.NATUREKIT.TREE_PINESMALLB],
      heightRange: [2.5, 4],
      spacing: 12,
    },
    shrub: {
      models: [M.QUATERNIUS.BUSH_1, M.NATUREKIT.PLANT_BUSHSMALL],
      heightRange: [0.8, 1.5],
      spacing: 10,
    },
    clutter: {
      models: [M.NATUREKIT.ROCK_SMALLA, M.NATUREKIT.ROCK_SMALLC, M.NATUREKIT.ROCK_SMALLE, M.NATUREKIT.STONE_SMALLA],
      heightRange: [0.3, 0.7],
      spacing: 3,
    },
    props: {
      models: [M.NATUREKIT.CLIFF_CAVE_ROCK, M.NATUREKIT.ROCK_LARGEA, M.NATUREKIT.ROCK_LARGEC, M.NATUREKIT.ROCK_TALLB, M.NATUREKIT.ROCK_TALLE],
      heightRange: [2, 6],
      spacing: 15,
    },
  },

  // Cabane abandonnée — clairière envahie par la végétation: cỏ dại rậm hơn
  // Z0, đồ đạc con người bỏ lại (thùng gỗ, thùng phuy, gốc cây vuông đã đẽo).
  cabin_clearing: {
    canopy: {
      models: [M.NATUREKIT.TREE_DEFAULT, M.NATUREKIT.TREE_SIMPLE, M.FOREST1.TREE_2_A_COLOR1],
      heightRange: [7, 9],
      spacing: 20,
    },
    shrub: {
      models: [M.QUATERNIUS.BUSH_1, M.QUATERNIUS.BUSH_2, M.FOREST.BUSH_1, M.FOREST.BUSH_3],
      heightRange: [1, 1.8],
      spacing: 9,
    },
    clutter: {
      models: [M.FOREST.GRASS_CLUMP_1, M.FOREST.GRASS_CLUMP_3, M.FOREST.GRASS_CLUMP_5, M.FOREST1.GRASS_2_A_SINGLESIDED_COLOR1],
      heightRange: [0.3, 0.7],
      spacing: 2.8,
    },
    props: {
      models: [
        M.DECORATION.PROPS_CRATE_A_SMALL,
        M.DECORATION.PROPS_CRATE_A_BIG,
        M.DECORATION.PROPS_BARREL,
        M.NATUREKIT.STUMP_SQUARE,
        M.NATUREKIT.STUMP_OLD,
      ],
      heightRange: [0.5, 1.2],
      spacing: 16,
    },
  },

  // Traces humaines — vùng đã bị đốn hạ: gốc cây khắp nơi (chính là "dấu vết
  // con người"), cây sống sót rất thưa, cỏ khô thay cho thảm xanh — khớp với
  // ground color nâu khô (#7b6a4e) và các loài "savanes arides" trong data.
  logged: {
    canopy: {
      models: [M.NATUREKIT.TREE_DEFAULT_FALL, M.NATUREKIT.TREE_OAK_FALL],
      heightRange: [6, 9],
      spacing: 26,
    },
    shrub: {
      models: [M.QUATERNIUS.BUSH_1, M.NATUREKIT.PLANT_BUSHSMALL],
      heightRange: [0.8, 1.4],
      spacing: 12,
    },
    clutter: {
      models: [M.FOREST1.GRASS_1_A_SINGLESIDED_COLOR1, M.FOREST1.GRASS_1_B_SINGLESIDED_COLOR1],
      heightRange: [0.3, 0.6],
      spacing: 3.5,
    },
    props: {
      models: [
        M.NATUREKIT.STUMP_ROUND,
        M.NATUREKIT.STUMP_SQUARE,
        M.NATUREKIT.STUMP_OLDTALL,
        M.NATUREKIT.LOG,
        M.NATUREKIT.LOG_LARGE,
        M.NATUREKIT.LOG_STACK,
        M.DECORATION.PROPS_RESOURCE_LUMBER,
      ],
      heightRange: [0.5, 1.3],
      spacing: 10,
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

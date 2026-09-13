import type { BiomeId } from './types';

/**
 * Vị trí các loài học đặt tay (hand-authored) cho bản đồ Chapter 1 (ZonedForest).
 *
 * Tổng cộng 59 loài độc nhất tương ứng 1:1 với ngân hàng dữ liệu
 * `src/data/learningEntities.json`. Phân bổ theo 8 zone sinh thái:
 *   - arrival (2 loài): Clairière d'arrivée
 *   - early_forest (6 loài): Forêt claire
 *   - medicinal_grove (10 loài): Bosquet médicinal
 *   - river (8 loài): Rivière
 *   - ancient_forest (10 loài): Forêt ancienne
 *   - cave_camp (7 loài): Grotte et camp
 *   - cabin (8 loài): Cabane abandonnée
 *   - human_traces (8 loài): Traces humaines
 *
 * Mọi vị trí đều được tính toán nằm trong vùng chơi được (|x|, |z| <= 195),
 * né lòng sông thật và chừa clearance 3.0 - 3.5m cho cây cối trang trí.
 */
export interface SpeciesPlacement {
  /** Id riêng của VỊ TRÍ này — dùng làm React key và id sensor. */
  id: string;
  zoneId: string;
  biome: BiomeId;
  /** Khớp đúng field `id` trong src/data/learningEntities.json. */
  speciesId: string;
  position: [number, number];
  /** Bán kính "breathing room" — thực vật trang trí không sinh vào đây. */
  clearance: number;
}

export const WORLD_SPECIES: SpeciesPlacement[] = [
  {
    "id": "z0_species_01",
    "zoneId": "arrival",
    "biome": "clearing",
    "speciesId": "Flower_n_01",
    "position": [
      -156,
      -158
    ],
    "clearance": 3
  },
  {
    "id": "z0_species_02",
    "zoneId": "arrival",
    "biome": "clearing",
    "speciesId": "Flowers_n03_05",
    "position": [
      -174,
      -154
    ],
    "clearance": 3
  },
  {
    "id": "z1_species_01",
    "zoneId": "early_forest",
    "biome": "light_forest",
    "speciesId": "Flower_n_02",
    "position": [
      -140,
      -100
    ],
    "clearance": 3
  },
  {
    "id": "z1_species_02",
    "zoneId": "early_forest",
    "biome": "light_forest",
    "speciesId": "Flowers_n02_07",
    "position": [
      -70,
      -75
    ],
    "clearance": 3
  },
  {
    "id": "z1_species_03",
    "zoneId": "early_forest",
    "biome": "light_forest",
    "speciesId": "Flowers_n03_06",
    "position": [
      -165,
      -88
    ],
    "clearance": 3
  },
  {
    "id": "z1_species_04",
    "zoneId": "early_forest",
    "biome": "light_forest",
    "speciesId": "Flowers_n03_07",
    "position": [
      -118,
      -68
    ],
    "clearance": 3
  },
  {
    "id": "z1_species_05",
    "zoneId": "early_forest",
    "biome": "light_forest",
    "speciesId": "Flowers_n03_13",
    "position": [
      -52,
      -102
    ],
    "clearance": 3
  },
  {
    "id": "z1_species_06",
    "zoneId": "early_forest",
    "biome": "light_forest",
    "speciesId": "Flowers_n02_22",
    "position": [
      -95,
      -118
    ],
    "clearance": 3
  },
  {
    "id": "z2_species_01",
    "zoneId": "medicinal_grove",
    "biome": "medicinal_grove",
    "speciesId": "Flower_n_05",
    "position": [
      30,
      -140
    ],
    "clearance": 3.5
  },
  {
    "id": "z2_species_02",
    "zoneId": "medicinal_grove",
    "biome": "medicinal_grove",
    "speciesId": "Flower_n_07",
    "position": [
      110,
      -135
    ],
    "clearance": 3.5
  },
  {
    "id": "z2_species_03",
    "zoneId": "medicinal_grove",
    "biome": "medicinal_grove",
    "speciesId": "Flowers_n02_10",
    "position": [
      105,
      -80
    ],
    "clearance": 3.5
  },
  {
    "id": "z2_species_04",
    "zoneId": "medicinal_grove",
    "biome": "medicinal_grove",
    "speciesId": "Flowers_n02_12",
    "position": [
      45,
      -75
    ],
    "clearance": 3.5
  },
  {
    "id": "z2_species_05",
    "zoneId": "medicinal_grove",
    "biome": "medicinal_grove",
    "speciesId": "Flowers_n03_02",
    "position": [
      75,
      -155
    ],
    "clearance": 3.5
  },
  {
    "id": "z2_species_06",
    "zoneId": "medicinal_grove",
    "biome": "medicinal_grove",
    "speciesId": "Flowers_n02_14",
    "position": [
      92,
      -118
    ],
    "clearance": 3.5
  },
  {
    "id": "z2_species_07",
    "zoneId": "medicinal_grove",
    "biome": "medicinal_grove",
    "speciesId": "Flowers_n02_15",
    "position": [
      38,
      -108
    ],
    "clearance": 3.5
  },
  {
    "id": "z2_species_08",
    "zoneId": "medicinal_grove",
    "biome": "medicinal_grove",
    "speciesId": "Flowers_n03_14",
    "position": [
      118,
      -104
    ],
    "clearance": 3.5
  },
  {
    "id": "z2_species_09",
    "zoneId": "medicinal_grove",
    "biome": "medicinal_grove",
    "speciesId": "Flowers_n03_17",
    "position": [
      62,
      -72
    ],
    "clearance": 3.5
  },
  {
    "id": "z2_species_10",
    "zoneId": "medicinal_grove",
    "biome": "medicinal_grove",
    "speciesId": "Flowers_n02_08",
    "position": [
      80,
      -62
    ],
    "clearance": 3.5
  },
  {
    "id": "river_species_01",
    "zoneId": "river",
    "biome": "riverbank",
    "speciesId": "Flower_n_03",
    "position": [
      -35,
      -18
    ],
    "clearance": 3
  },
  {
    "id": "river_species_02",
    "zoneId": "river",
    "biome": "riverbank",
    "speciesId": "Flowers_n02_01",
    "position": [
      -45,
      18
    ],
    "clearance": 3
  },
  {
    "id": "river_species_03",
    "zoneId": "river",
    "biome": "riverbank",
    "speciesId": "Flowers_n02_20",
    "position": [
      -105,
      -14
    ],
    "clearance": 3
  },
  {
    "id": "river_species_04",
    "zoneId": "river",
    "biome": "riverbank",
    "speciesId": "Flowers_n03_16",
    "position": [
      -145,
      26
    ],
    "clearance": 3
  },
  {
    "id": "river_species_05",
    "zoneId": "river",
    "biome": "riverbank",
    "speciesId": "Flowers_n03_24",
    "position": [
      3,
      20
    ],
    "clearance": 3
  },
  {
    "id": "river_species_06",
    "zoneId": "river",
    "biome": "riverbank",
    "speciesId": "Flowers_n03_19",
    "position": [
      68,
      -26
    ],
    "clearance": 3
  },
  {
    "id": "river_species_07",
    "zoneId": "river",
    "biome": "riverbank",
    "speciesId": "Flowers_n03_18",
    "position": [
      120,
      -5
    ],
    "clearance": 3
  },
  {
    "id": "river_species_08",
    "zoneId": "river",
    "biome": "riverbank",
    "speciesId": "Flowers_n03_15",
    "position": [
      148,
      14
    ],
    "clearance": 3
  },
  {
    "id": "ancient_forest_species_01",
    "zoneId": "ancient_forest",
    "biome": "ancient_forest",
    "speciesId": "Flowers_n02_05",
    "position": [
      -160,
      60
    ],
    "clearance": 3.5
  },
  {
    "id": "ancient_forest_species_02",
    "zoneId": "ancient_forest",
    "biome": "ancient_forest",
    "speciesId": "Flowers_n02_17",
    "position": [
      -90,
      100
    ],
    "clearance": 3.5
  },
  {
    "id": "ancient_forest_species_03",
    "zoneId": "ancient_forest",
    "biome": "ancient_forest",
    "speciesId": "Flowers_n03_09",
    "position": [
      -70,
      70
    ],
    "clearance": 3.5
  },
  {
    "id": "ancient_forest_species_04",
    "zoneId": "ancient_forest",
    "biome": "ancient_forest",
    "speciesId": "Flowers_n02_06",
    "position": [
      -130,
      52
    ],
    "clearance": 3.5
  },
  {
    "id": "ancient_forest_species_05",
    "zoneId": "ancient_forest",
    "biome": "ancient_forest",
    "speciesId": "Flowers_n02_19",
    "position": [
      -178,
      85
    ],
    "clearance": 3.5
  },
  {
    "id": "ancient_forest_species_06",
    "zoneId": "ancient_forest",
    "biome": "ancient_forest",
    "speciesId": "Flowers_n02_21",
    "position": [
      -145,
      115
    ],
    "clearance": 3.5
  },
  {
    "id": "ancient_forest_species_07",
    "zoneId": "ancient_forest",
    "biome": "ancient_forest",
    "speciesId": "Flowers_n03_04",
    "position": [
      -112,
      118
    ],
    "clearance": 3.5
  },
  {
    "id": "ancient_forest_species_08",
    "zoneId": "ancient_forest",
    "biome": "ancient_forest",
    "speciesId": "Flowers_n03_23",
    "position": [
      -62,
      112
    ],
    "clearance": 3.5
  },
  {
    "id": "ancient_forest_species_09",
    "zoneId": "ancient_forest",
    "biome": "ancient_forest",
    "speciesId": "Flowers_n03_21",
    "position": [
      -122,
      82
    ],
    "clearance": 3.5
  },
  {
    "id": "ancient_forest_species_10",
    "zoneId": "ancient_forest",
    "biome": "ancient_forest",
    "speciesId": "Flower_n_09",
    "position": [
      -85,
      56
    ],
    "clearance": 3.5
  },
  {
    "id": "cave_camp_species_01",
    "zoneId": "cave_camp",
    "biome": "rocky",
    "speciesId": "Flower_n_04",
    "position": [
      -145,
      155
    ],
    "clearance": 3
  },
  {
    "id": "cave_camp_species_02",
    "zoneId": "cave_camp",
    "biome": "rocky",
    "speciesId": "Flowers_n02_09",
    "position": [
      -170,
      185
    ],
    "clearance": 3
  },
  {
    "id": "cave_camp_species_03",
    "zoneId": "cave_camp",
    "biome": "rocky",
    "speciesId": "Flowers_n03_10",
    "position": [
      -182,
      160
    ],
    "clearance": 3
  },
  {
    "id": "cave_camp_species_04",
    "zoneId": "cave_camp",
    "biome": "rocky",
    "speciesId": "Flowers_n03_25",
    "position": [
      -156,
      190
    ],
    "clearance": 3
  },
  {
    "id": "cave_camp_species_05",
    "zoneId": "cave_camp",
    "biome": "rocky",
    "speciesId": "Flowers_n02_16",
    "position": [
      -138,
      175
    ],
    "clearance": 3
  },
  {
    "id": "cave_camp_species_06",
    "zoneId": "cave_camp",
    "biome": "rocky",
    "speciesId": "Flowers_n03_12",
    "position": [
      -176,
      142
    ],
    "clearance": 3
  },
  {
    "id": "cave_camp_species_07",
    "zoneId": "cave_camp",
    "biome": "rocky",
    "speciesId": "Flowers_n03_22",
    "position": [
      -152,
      140
    ],
    "clearance": 3
  },
  {
    "id": "cabin_species_01",
    "zoneId": "cabin",
    "biome": "cabin_clearing",
    "speciesId": "Flower_n_08",
    "position": [
      30,
      115
    ],
    "clearance": 3
  },
  {
    "id": "cabin_species_02",
    "zoneId": "cabin",
    "biome": "cabin_clearing",
    "speciesId": "Flowers_n02_13",
    "position": [
      85,
      80
    ],
    "clearance": 3
  },
  {
    "id": "cabin_species_03",
    "zoneId": "cabin",
    "biome": "cabin_clearing",
    "speciesId": "Flowers_n02_18",
    "position": [
      42,
      92
    ],
    "clearance": 3
  },
  {
    "id": "cabin_species_04",
    "zoneId": "cabin",
    "biome": "cabin_clearing",
    "speciesId": "Flowers_n03_27",
    "position": [
      68,
      75
    ],
    "clearance": 3
  },
  {
    "id": "cabin_species_05",
    "zoneId": "cabin",
    "biome": "cabin_clearing",
    "speciesId": "Flowers_n02_23",
    "position": [
      75,
      122
    ],
    "clearance": 3
  },
  {
    "id": "cabin_species_06",
    "zoneId": "cabin",
    "biome": "cabin_clearing",
    "speciesId": "Flowers_n02_02",
    "position": [
      92,
      102
    ],
    "clearance": 3
  },
  {
    "id": "cabin_species_07",
    "zoneId": "cabin",
    "biome": "cabin_clearing",
    "speciesId": "Flowers_n03_20",
    "position": [
      38,
      136
    ],
    "clearance": 3
  },
  {
    "id": "cabin_species_08",
    "zoneId": "cabin",
    "biome": "cabin_clearing",
    "speciesId": "Flowers_n03_26",
    "position": [
      62,
      142
    ],
    "clearance": 3
  },
  {
    "id": "human_traces_species_01",
    "zoneId": "human_traces",
    "biome": "logged",
    "speciesId": "Flower_n_06",
    "position": [
      50,
      165
    ],
    "clearance": 3
  },
  {
    "id": "human_traces_species_02",
    "zoneId": "human_traces",
    "biome": "logged",
    "speciesId": "Flowers_n02_04",
    "position": [
      142,
      190
    ],
    "clearance": 3
  },
  {
    "id": "human_traces_species_03",
    "zoneId": "human_traces",
    "biome": "logged",
    "speciesId": "Flowers_n03_03",
    "position": [
      32,
      178
    ],
    "clearance": 3
  },
  {
    "id": "human_traces_species_04",
    "zoneId": "human_traces",
    "biome": "logged",
    "speciesId": "Flowers_n03_08",
    "position": [
      72,
      185
    ],
    "clearance": 3
  },
  {
    "id": "human_traces_species_05",
    "zoneId": "human_traces",
    "biome": "logged",
    "speciesId": "Flowers_n02_11",
    "position": [
      95,
      168
    ],
    "clearance": 3
  },
  {
    "id": "human_traces_species_06",
    "zoneId": "human_traces",
    "biome": "logged",
    "speciesId": "Flowers_n02_03",
    "position": [
      115,
      182
    ],
    "clearance": 3
  },
  {
    "id": "human_traces_species_07",
    "zoneId": "human_traces",
    "biome": "logged",
    "speciesId": "Flowers_n03_28",
    "position": [
      60,
      192
    ],
    "clearance": 3
  },
  {
    "id": "human_traces_species_08",
    "zoneId": "human_traces",
    "biome": "logged",
    "speciesId": "Flowers_n03_11",
    "position": [
      88,
      195
    ],
    "clearance": 3
  }
];

// scripts/generate-world-species.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read learning entities to ensure we map all 59 species
const learningDataPath = path.resolve(__dirname, '../src/data/learningEntities.json');
const learningData = JSON.parse(fs.readFileSync(learningDataPath, 'utf8'));
const allSpeciesIds = learningData.flowers.map(f => f.id);

console.log(`Found ${allSpeciesIds.length} species in learningEntities.json`);

import { CatmullRomCurve3, Vector3 } from 'three';

const CONTROL_POINTS = [
  [-280, 10], [-200, -12], [-130, 14], [-60, -8],
  [-20, 6], [40, -14], [110, 10], [170, -8],
  [230, 12], [280, -6]
];

const curve = new CatmullRomCurve3(
  CONTROL_POINTS.map(([x, z]) => new Vector3(x, 0, z)),
  false,
  'catmullrom',
  0.5
);
const riverSamples = curve.getSpacedPoints(150).map(v => [v.x, v.z]);

function distanceToSegment(px, pz, ax, az, bx, bz) {
  const abx = bx - ax;
  const abz = bz - az;
  const lenSq = abx * abx + abz * abz;
  const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / lenSq));
  const dx = px - (ax + t * abx);
  const dz = pz - (az + t * abz);
  return Math.sqrt(dx * dx + dz * dz);
}

function exactRiverDist(x, z) {
  let minD = Infinity;
  for (let i = 0; i < riverSamples.length - 1; i++) {
    const [ax, az] = riverSamples[i];
    const [bx, bz] = riverSamples[i + 1];
    const d = distanceToSegment(x, z, ax, az, bx, bz);
    if (d < minD) minD = d;
  }
  return minD;
}

/**
 * 59 species placements across 8 zones:
 * - arrival (2)
 * - early_forest (6)
 * - medicinal_grove (10)
 * - river (8)
 * - ancient_forest (10)
 * - cave_camp (7)
 * - cabin (8)
 * - human_traces (8)
 */
const SPECIES_CONFIG = [
  // ──────────────── Z0: Clairière d'arrivée (2) ────────────────
  {
    id: "z0_species_01",
    zoneId: "arrival",
    biome: "clearing",
    speciesId: "Flower_n_01", // Bissap Écarlate
    position: [-156, -158],
    clearance: 3.0,
  },
  {
    id: "z0_species_02",
    zoneId: "arrival",
    biome: "clearing",
    speciesId: "Flowers_n03_05", // Zinnia Sauvage
    position: [-174, -154],
    clearance: 3.0,
  },

  // ──────────────── Z1: Forêt claire (6) ────────────────
  {
    id: "z1_species_01",
    zoneId: "early_forest",
    biome: "light_forest",
    speciesId: "Flower_n_02", // Lis Glorieux
    position: [-140, -100],
    clearance: 3.0,
  },
  {
    id: "z1_species_02",
    zoneId: "early_forest",
    biome: "light_forest",
    speciesId: "Flowers_n02_07", // Amarante Rouge
    position: [-70, -75],
    clearance: 3.0,
  },
  {
    id: "z1_species_03",
    zoneId: "early_forest",
    biome: "light_forest",
    speciesId: "Flowers_n03_06", // Crotalaire à Hochet
    position: [-165, -88],
    clearance: 3.0,
  },
  {
    id: "z1_species_04",
    zoneId: "early_forest",
    biome: "light_forest",
    speciesId: "Flowers_n03_07", // Bougainvillier Pourpre
    position: [-118, -68],
    clearance: 3.0,
  },
  {
    id: "z1_species_05",
    zoneId: "early_forest",
    biome: "light_forest",
    speciesId: "Flowers_n03_13", // Herbe aux Verrues
    position: [-52, -102],
    clearance: 3.0,
  },
  {
    id: "z1_species_06",
    zoneId: "early_forest",
    biome: "light_forest",
    speciesId: "Flowers_n02_22", // Dentelaire Blanche
    position: [-95, -118],
    clearance: 3.0,
  },

  // ──────────────── Z2: Bosquet médicinal (10) ────────────────
  {
    id: "z2_species_01",
    zoneId: "medicinal_grove",
    biome: "medicinal_grove",
    speciesId: "Flower_n_05", // Iboga Sacré
    position: [30, -140],
    clearance: 3.5,
  },
  {
    id: "z2_species_02",
    zoneId: "medicinal_grove",
    biome: "medicinal_grove",
    speciesId: "Flower_n_07", // Fougère Arborescente
    position: [110, -135],
    clearance: 3.5,
  },
  {
    id: "z2_species_03",
    zoneId: "medicinal_grove",
    biome: "medicinal_grove",
    speciesId: "Flowers_n02_10", // Brède Mafane
    position: [105, -80],
    clearance: 3.5,
  },
  {
    id: "z2_species_04",
    zoneId: "medicinal_grove",
    biome: "medicinal_grove",
    speciesId: "Flowers_n02_12", // Faux Quinquina
    position: [45, -75],
    clearance: 3.5,
  },
  {
    id: "z2_species_05",
    zoneId: "medicinal_grove",
    biome: "medicinal_grove",
    speciesId: "Flowers_n03_02", // Pervenche Tropicale
    position: [75, -155],
    clearance: 3.5,
  },
  {
    id: "z2_species_06",
    zoneId: "medicinal_grove",
    biome: "medicinal_grove",
    speciesId: "Flowers_n02_14", // Voacanga Tropical
    position: [92, -118],
    clearance: 3.5,
  },
  {
    id: "z2_species_07",
    zoneId: "medicinal_grove",
    biome: "medicinal_grove",
    speciesId: "Flowers_n02_15", // Costus Doré d'Afrique
    position: [38, -108],
    clearance: 3.5,
  },
  {
    id: "z2_species_08",
    zoneId: "medicinal_grove",
    biome: "medicinal_grove",
    speciesId: "Flowers_n03_14", // Sauge des Bois
    position: [118, -104],
    clearance: 3.5,
  },
  {
    id: "z2_species_09",
    zoneId: "medicinal_grove",
    biome: "medicinal_grove",
    speciesId: "Flowers_n03_17", // Feuille Amère
    position: [62, -72],
    clearance: 3.5,
  },
  {
    id: "z2_species_10",
    zoneId: "medicinal_grove",
    biome: "medicinal_grove",
    speciesId: "Flowers_n02_08", // Bois Sanglier
    position: [80, -62],
    clearance: 3.5,
  },

  // ──────────────── Rivière (8) ────────────────
  {
    id: "river_species_01",
    zoneId: "river",
    biome: "riverbank",
    speciesId: "Flower_n_03", // Nénuphar Bleu d'Afrique
    position: [-35, -18],
    clearance: 3.0,
  },
  {
    id: "river_species_02",
    zoneId: "river",
    biome: "riverbank",
    speciesId: "Flowers_n02_01", // Papyrus du Nil
    position: [-45, 18],
    clearance: 3.0,
  },
  {
    id: "river_species_03",
    zoneId: "river",
    biome: "riverbank",
    speciesId: "Flowers_n02_20", // Laitue d'Eau Flottante
    position: [-105, -14],
    clearance: 3.0,
  },
  {
    id: "river_species_04",
    zoneId: "river",
    biome: "riverbank",
    speciesId: "Flowers_n03_16", // Lis Géant des Marais
    position: [-145, 26],
    clearance: 3.0,
  },
  {
    id: "river_species_05",
    zoneId: "river",
    biome: "riverbank",
    speciesId: "Flowers_n03_24", // Liseron d'Eau Douce
    position: [3, 20],
    clearance: 3.0,
  },
  {
    id: "river_species_06",
    zoneId: "river",
    biome: "riverbank",
    speciesId: "Flowers_n03_19", // Tuloucouna des Marais
    position: [68, -26],
    clearance: 3.0,
  },
  {
    id: "river_species_07",
    zoneId: "river",
    biome: "riverbank",
    speciesId: "Flowers_n03_18", // Corossolier Épineux
    position: [120, -5],
    clearance: 3.0,
  },
  {
    id: "river_species_08",
    zoneId: "river",
    biome: "riverbank",
    speciesId: "Flowers_n03_15", // Magnolia Parfumé
    position: [148, 14],
    clearance: 3.0,
  },

  // ──────────────── Forêt ancienne (10) ────────────────
  {
    id: "ancient_forest_species_01",
    zoneId: "ancient_forest",
    biome: "ancient_forest",
    speciesId: "Flowers_n02_05", // Orchidée Léopard
    position: [-160, 60],
    clearance: 3.5,
  },
  {
    id: "ancient_forest_species_02",
    zoneId: "ancient_forest",
    biome: "ancient_forest",
    speciesId: "Flowers_n02_17", // Moabi Jaune
    position: [-90, 100],
    clearance: 3.5,
  },
  {
    id: "ancient_forest_species_03",
    zoneId: "ancient_forest",
    biome: "ancient_forest",
    speciesId: "Flowers_n03_09", // Maniguette Sacrée
    position: [-70, 70],
    clearance: 3.5,
  },
  {
    id: "ancient_forest_species_04",
    zoneId: "ancient_forest",
    biome: "ancient_forest",
    speciesId: "Flowers_n02_06", // Caféier Robusta
    position: [-130, 52],
    clearance: 3.5,
  },
  {
    id: "ancient_forest_species_05",
    zoneId: "ancient_forest",
    biome: "ancient_forest",
    speciesId: "Flowers_n02_19", // Petit Cola
    position: [-178, 85],
    clearance: 3.5,
  },
  {
    id: "ancient_forest_species_06",
    zoneId: "ancient_forest",
    biome: "ancient_forest",
    speciesId: "Flowers_n02_21", // Fruit Miraculeux
    position: [-145, 115],
    clearance: 3.5,
  },
  {
    id: "ancient_forest_species_07",
    zoneId: "ancient_forest",
    biome: "ancient_forest",
    speciesId: "Flowers_n03_04", // Violette des Ombres
    position: [-112, 118],
    clearance: 3.5,
  },
  {
    id: "ancient_forest_species_08",
    zoneId: "ancient_forest",
    biome: "ancient_forest",
    speciesId: "Flowers_n03_23", // Arbre à Parfum
    position: [-62, 112],
    clearance: 3.5,
  },
  {
    id: "ancient_forest_species_09",
    zoneId: "ancient_forest",
    biome: "ancient_forest",
    speciesId: "Flowers_n03_21", // Oiseau de Paradis Géant
    position: [-122, 82],
    clearance: 3.5,
  },
  {
    id: "ancient_forest_species_10",
    zoneId: "ancient_forest",
    biome: "ancient_forest",
    speciesId: "Flower_n_09", // Arbre aux Saucisses
    position: [-85, 56],
    clearance: 3.5,
  },

  // ──────────────── Grotte et camp (7) ────────────────
  {
    id: "cave_camp_species_01",
    zoneId: "cave_camp",
    biome: "rocky",
    speciesId: "Flower_n_04", // Plante de la Résurrection
    position: [-145, 155],
    clearance: 3.0,
  },
  {
    id: "cave_camp_species_02",
    zoneId: "cave_camp",
    biome: "rocky",
    speciesId: "Flowers_n02_09", // Pagan des Rochers
    position: [-170, 185],
    clearance: 3.0,
  },
  {
    id: "cave_camp_species_03",
    zoneId: "cave_camp",
    biome: "rocky",
    speciesId: "Flowers_n03_10", // Euphorbe Candélabre
    position: [-182, 160],
    clearance: 3.0,
  },
  {
    id: "cave_camp_species_04",
    zoneId: "cave_camp",
    biome: "rocky",
    speciesId: "Flowers_n03_25", // Baobab Chacal
    position: [-156, 190],
    clearance: 3.0,
  },
  {
    id: "cave_camp_species_05",
    zoneId: "cave_camp",
    biome: "rocky",
    speciesId: "Flowers_n02_16", // Aloès Épineux
    position: [-138, 175],
    clearance: 3.0,
  },
  {
    id: "cave_camp_species_06",
    zoneId: "cave_camp",
    biome: "rocky",
    speciesId: "Flowers_n03_12", // Glaïeul Perroquet
    position: [-176, 142],
    clearance: 3.0,
  },
  {
    id: "cave_camp_species_07",
    zoneId: "cave_camp",
    biome: "rocky",
    speciesId: "Flowers_n03_22", // Verveine Papillon
    position: [-152, 140],
    clearance: 3.0,
  },

  // ──────────────── Cabane abandonnée (8) ────────────────
  {
    id: "cabin_species_01",
    zoneId: "cabin",
    biome: "cabin_clearing",
    speciesId: "Flower_n_08", // Moringa Ailé
    position: [30, 115],
    clearance: 3.0,
  },
  {
    id: "cabin_species_02",
    zoneId: "cabin",
    biome: "cabin_clearing",
    speciesId: "Flowers_n02_13", // Thé de Gambie
    position: [85, 80],
    clearance: 3.0,
  },
  {
    id: "cabin_species_03",
    zoneId: "cabin",
    biome: "cabin_clearing",
    speciesId: "Flowers_n02_18", // Basilic Africain
    position: [42, 92],
    clearance: 3.0,
  },
  {
    id: "cabin_species_04",
    zoneId: "cabin",
    biome: "cabin_clearing",
    speciesId: "Flowers_n03_27", // Citronnelle Sauvage
    position: [68, 75],
    clearance: 3.0,
  },
  {
    id: "cabin_species_05",
    zoneId: "cabin",
    biome: "cabin_clearing",
    speciesId: "Flowers_n02_23", // Belle-de-Nuit
    position: [75, 122],
    clearance: 3.0,
  },
  {
    id: "cabin_species_06",
    zoneId: "cabin",
    biome: "cabin_clearing",
    speciesId: "Flowers_n02_02", // Fleur de Baobab
    position: [92, 102],
    clearance: 3.0,
  },
  {
    id: "cabin_species_07",
    zoneId: "cabin",
    biome: "cabin_clearing",
    speciesId: "Flowers_n03_20", // Frangipanier Blanc
    position: [38, 136],
    clearance: 3.0,
  },
  {
    id: "cabin_species_08",
    zoneId: "cabin",
    biome: "cabin_clearing",
    speciesId: "Flowers_n03_26", // Tamarindier Sauvage
    position: [62, 142],
    clearance: 3.0,
  },

  // ──────────────── Traces humaines / déboisement (8) ────────────────
  {
    id: "human_traces_species_01",
    zoneId: "human_traces",
    biome: "logged",
    speciesId: "Flower_n_06", // Gommier Blanc
    position: [50, 165],
    clearance: 3.0,
  },
  {
    id: "human_traces_species_02",
    zoneId: "human_traces",
    biome: "logged",
    speciesId: "Flowers_n02_04", // Orme Charbonnier
    position: [142, 190],
    clearance: 3.0,
  },
  {
    id: "human_traces_species_03",
    zoneId: "human_traces",
    biome: "logged",
    speciesId: "Flowers_n03_03", // Tournesol Sauvage
    position: [32, 178],
    clearance: 3.0,
  },
  {
    id: "human_traces_species_04",
    zoneId: "human_traces",
    biome: "logged",
    speciesId: "Flowers_n03_08", // Arbre de Santé
    position: [72, 185],
    clearance: 3.0,
  },
  {
    id: "human_traces_species_05",
    zoneId: "human_traces",
    biome: "logged",
    speciesId: "Flowers_n02_11", // Strophanthus Grimpant
    position: [95, 168],
    clearance: 3.0,
  },
  {
    id: "human_traces_species_06",
    zoneId: "human_traces",
    biome: "logged",
    speciesId: "Flowers_n02_03", // Tulipier du Gabon
    position: [115, 182],
    clearance: 3.0,
  },
  {
    id: "human_traces_species_07",
    zoneId: "human_traces",
    biome: "logged",
    speciesId: "Flowers_n03_28", // Faux Sésame Doré
    position: [60, 192],
    clearance: 3.0,
  },
  {
    id: "human_traces_species_08",
    zoneId: "human_traces",
    biome: "logged",
    speciesId: "Flowers_n03_11", // Passiflore Sauvage
    position: [88, 195],
    clearance: 3.0,
  },
];

console.log(`Verifying ${SPECIES_CONFIG.length} species placements...`);

if (SPECIES_CONFIG.length !== 59) {
  throw new Error(`Expected 59 species, got ${SPECIES_CONFIG.length}`);
}

const configuredIds = new Set(SPECIES_CONFIG.map(s => s.speciesId));
if (configuredIds.size !== 59) {
  throw new Error(`Duplicate speciesId in config! Expected 59, got ${configuredIds.size}`);
}

for (const id of allSpeciesIds) {
  if (!configuredIds.has(id)) {
    throw new Error(`Missing speciesId from config: ${id}`);
  }
}

// Distance checks
for (let i = 0; i < SPECIES_CONFIG.length; i++) {
  const a = SPECIES_CONFIG[i];
  const [ax, az] = a.position;

  // Boundary check
  if (Math.abs(ax) > 195 || Math.abs(az) > 195) {
    throw new Error(`Placement ${a.id} exceeds PLAYABLE_HALF: [${ax}, ${az}]`);
  }

  // Water check
  const rDist = exactRiverDist(ax, az);
  if (rDist < 10) {
    console.warn(`Warning: placement ${a.id} is close to river: ${rDist.toFixed(1)}m`);
  }

  // Pairwise distance check
  for (let j = i + 1; j < SPECIES_CONFIG.length; j++) {
    const b = SPECIES_CONFIG[j];
    const d = Math.hypot(ax - b.position[0], az - b.position[1]);
    if (d < 8) {
      console.warn(`Placements ${a.id} and ${b.id} are very close (${d.toFixed(1)}m)`);
    }
  }
}

// Build typescript content
const tsContent = `import type { BiomeId } from './types';

/**
 * Vị trí các loài học đặt tay (hand-authored) cho bản đồ Chapter 1 (ZonedForest).
 *
 * Tổng cộng 59 loài độc nhất tương ứng 1:1 với ngân hàng dữ liệu
 * \`src/data/learningEntities.json\`. Phân bổ theo 8 zone sinh thái:
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
  /** Khớp đúng field \`id\` trong src/data/learningEntities.json. */
  speciesId: string;
  position: [number, number];
  /** Bán kính "breathing room" — thực vật trang trí không sinh vào đây. */
  clearance: number;
}

export const WORLD_SPECIES: SpeciesPlacement[] = ${JSON.stringify(SPECIES_CONFIG, null, 2)};
`;

const outputPath = path.resolve(__dirname, '../src/config/world/species.ts');
fs.writeFileSync(outputPath, tsContent, 'utf8');
console.log(`Successfully generated ${outputPath} with all 59 species placements!`);

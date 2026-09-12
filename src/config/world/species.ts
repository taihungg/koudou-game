import type { BiomeId } from './types';

/**
 * Vị trí loài học tác giả đặt tay cho vertical slice P1 (Z0/Z1/Z2) — kou-dou.md
 * §7: "quest targets" thuộc nhóm hand-authored, không phải thứ thuật toán rải
 * ngẫu nhiên như cỏ/bụi. Khác `InfiniteForest` cũ (spawn 5% xác suất mỗi ô
 * chunk, chỉ "ổn định" chừng nào người chơi còn đứng nguyên trong chunk đó):
 * ở đây mỗi entry là MỘT điểm cố định trên bản đồ, tồn tại vĩnh viễn bất kể
 * chunk nào đang render — điều kiện bắt buộc để sau này làm checklist kiểu
 * "3/5 loài đã tìm trong Bosquet médicinal".
 *
 * `speciesId` phải khớp đúng field `id` trong learningEntities.json — đó là
 * khoá mà useLearningStore dùng để gate XP lặp lại (`completedExercises`), nên
 * nhiều điểm đặt có thể trỏ cùng một speciesId (gặp lại loài đã học) nhưng mỗi
 * VỊ TRÍ vẫn cần `id` riêng để React key và va chạm không đụng nhau.
 *
 * Chọn loài theo `leftPanel.Habitat` trong data (chỉ lặp lại 7 câu mẫu, không
 * phải mô tả sinh học thật) để ít nhất đọc hợp lý với biome: "Zones ouvertes"
 * cho Z0, "Lisières de forêt tropicale" cho Z1, "Sous-bois sombres"/"Forêts
 * denses" cho Z2.
 */
export interface SpeciesPlacement {
  /** Id riêng của VỊ TRÍ này — dùng làm React key và id sensor, không phải id loài. */
  id: string;
  zoneId: string;
  biome: BiomeId;
  /** Khớp field `id` trong src/data/learningEntities.json (flowers[]). */
  speciesId: string;
  position: [number, number];
  /** Bán kính "breathing room" — thực vật trang trí không sinh vào đây (kou-dou.md §5 Layer 5). */
  clearance: number;
}

export const WORLD_SPECIES: SpeciesPlacement[] = [
  // Z0 — Clairière d'arrivée: một loài duy nhất, dễ thấy, để tập thao tác
  // tương tác trước khi vào rừng dày (kou-dou.md Z0: "teach interaction").
  {
    id: 'z0_species_01',
    zoneId: 'arrival',
    biome: 'clearing',
    speciesId: 'Flower_n_01', // Fleur de Trésor — "zones ouvertes, sols ensoleillés"
    position: [-175, -178],
    clearance: 3,
  },

  // Z1 — Forêt claire: "first Fiche Espèce" gần lối vào zone, loài thứ hai
  // nằm sâu hơn để người chơi phải rời khỏi đường mòn một chút.
  {
    id: 'z1_species_01',
    zoneId: 'early_forest',
    biome: 'light_forest',
    speciesId: 'Flower_n_02', // Liane du Roi — "lisières de forêt"
    position: [-140, -100],
    clearance: 3,
  },
  {
    id: 'z1_species_02',
    zoneId: 'early_forest',
    biome: 'light_forest',
    speciesId: 'Flowers_n02_07', // Amaranthe — "lisières de forêt"
    position: [-70, -75],
    clearance: 3,
  },

  // Z2 — Bosquet médicinal: "introduce multiple useful plants, begin spaced
  // repetition" — 5 loài rải quanh landmark, đều cách xa dải sông ở phía bắc.
  {
    id: 'z2_species_01',
    zoneId: 'medicinal_grove',
    biome: 'medicinal_grove',
    speciesId: 'Flower_n_05', // Orchidée Fantôme — "sous-bois sombres"
    position: [30, -140],
    clearance: 3.5,
  },
  {
    id: 'z2_species_02',
    zoneId: 'medicinal_grove',
    biome: 'medicinal_grove',
    speciesId: 'Flower_n_07', // Fougère Argentée — "forêts denses"
    position: [110, -135],
    clearance: 3.5,
  },
  {
    id: 'z2_species_03',
    zoneId: 'medicinal_grove',
    biome: 'medicinal_grove',
    speciesId: 'Flowers_n02_10', // Dahlia Sombre — "sous-bois sombres"
    position: [105, -80],
    clearance: 3.5,
  },
  {
    id: 'z2_species_04',
    zoneId: 'medicinal_grove',
    biome: 'medicinal_grove',
    speciesId: 'Flowers_n02_12', // Fuchsia — "forêts denses"
    position: [45, -75],
    clearance: 3.5,
  },
  {
    id: 'z2_species_05',
    zoneId: 'medicinal_grove',
    biome: 'medicinal_grove',
    speciesId: 'Flowers_n03_02', // Renoncule — "sous-bois sombres"
    position: [75, -155],
    clearance: 3.5,
  },
];

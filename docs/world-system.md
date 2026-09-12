# World System: Chapter 1 Zoned Forest vs Chapter 2 Infinite Forest

This document explains how environments are composed, rendered, and streamed across the two game chapters in **KOUDOU**.

---

## 1. Route Divergence (The Two World Systems)

| Route | Chapter | Root Environment Component | World Strategy | Bounds |
|---|---|---|---|---|
| **`/forest`** | Chapter 1 | [`ZonedForest.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/ZonedForest.tsx) | Bounded, intentional 8-zone map with hand-authored landmarks and species | Finite: 480m × 480m |
| **`/village`** | Chapter 2 | [`InfiniteForest.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/InfiniteForest.tsx) + [`StaticVillage.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/StaticVillage.tsx) | Endless procedural chunk streaming with village clearing | Infinite |

> [!WARNING]
> **Do not confuse the two systems!** If you are adjusting forest vegetation, landmarks, or terrain for Chapter 1, you must modify files in [`src/config/world/`](file:///Users/tai_hungg/coding/koudou-game/src/config/world) and [`src/components/game/world/`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world). Editing `InfiniteForest.tsx` will only affect Chapter 2 (`/village`).

---

## 2. Chapter 1: The Bounded Zoned Forest (`ZonedForest`)

Chapter 1 is structured according to the level composition brief in [`kou-dou.md`](file:///Users/tai_hungg/coding/koudou-game/kou-dou.md). Instead of scattering assets uniformly, the world is designed as a sequence of 8 distinct environmental zones connected by natural corridors.

### 1. World Dimensions & Dual Render Distances
All constants are defined in [`src/config/world/chapter1.ts`](file:///Users/tai_hungg/coding/koudou-game/src/config/world/chapter1.ts):

```ts
export const WORLD_HALF = 240;            // Half-width of the entire map (480m x 480m total)
export const PLAYABLE_HALF = 200;         // Playable boundary; beyond this is dense canopy
export const BELT = 40;                   // Thickness of the impassable perimeter belt
export const CHUNK_SIZE = 40;             // Chunk dimensions in meters
export const RENDER_DISTANCE = 1;         // 3x3 chunks for vegetation (120m x 120m)
export const TERRAIN_RENDER_DISTANCE = 3; // 7x7 chunks for ground tiles (280m x 280m)
export const SPAWN: [number, number, number] = [-160, 3, -165]; // Center of Arrival Clearing
```

- **Why Dual Render Distances?** Terrain meshes ([`TerrainTiles.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/TerrainTiles.tsx)) are flat, vertex-colored tiles and computationally cheap. Vegetation ([`ChunkVegetation.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/ChunkVegetation.tsx)) contains complex geometries and colliders. Extending the terrain radius (`RENDER_DISTANCE + 2`) ensures the ground always extends beyond the tree line, eliminating "floating trees" when the camera zooms or during wide cutscene angles.

---

### 2. The 8 Macro Zones

Each zone has an authored shape, blend margin, unique biome palette, and characteristic ground color ([`chapter1.ts`](file:///Users/tai_hungg/coding/koudou-game/src/config/world/chapter1.ts)):

| Zone ID | French Name | Geometry | Biome ID | Ground Hex | Landmark |
|---|---|---|---|---|---|
| `arrival` | *Clairière d'arrivée* (Z0) | Circle: `[-160, -165]`, r=35 | `clearing` | `#7aa64a` | Giant fallen tree (`arrival_fallen_tree`) |
| `early_forest` | *Forêt claire* (Z1) | Rect: `[-190, -125]` to `[-40, -55]` | `light_forest` | `#4e7c34` | Large rock formation (`early_forest_rock`) |
| `medicinal_grove` | *Bosquet médicinal* (Z2) | Circle: `[70, -110]`, r=60 | `medicinal_grove` | `#6f9463` | Ancient flowering tree (`medicinal_grove_ancient_tree`) |
| `river` | *Rivière* (Z3) | Path: Spline curve, halfWidth=25 | `riverbank` | `#5f6444` | Stranded canoe (`river_canoe`) & Bridge |
| `ancient_forest` | *Forêt ancienne* (Z4) | Rect: `[-195, 45]` to `[-50, 125]` | `ancient_forest` | `#1e3326` | Mossy willow groves & Totem clues |
| `cave_camp` | *Grotte et camp* (Z5) | Circle: `[-160, 165]`, r=33 | `rocky` | `#6b6355` | Rocky cliff & Campfire site |
| `cabin` | *Cabane abandonnée* (Z6) | Circle: `[55, 100]`, r=52 | `cabin_clearing` | `#75974a` | Abandoned researcher cabin & crates |
| `human_traces` | *Traces humaines* (Z7) | Rect: `[20, 155]` to `[190, 196]` | `logged` | `#7b6a4e` | Cut tree stumps & deforestation traces |
| *Default/Belt* | *Confins de la forêt* | Global perimeter belt | `deep_canopy` | `#2c4322` | Dense perimeter wall of 15m trees |

---

### 3. The 5-Tier Vegetation System

Vegetation within chunks is generated procedurally using the deterministic algorithm in [`src/utils/vegetationSampling.ts`](file:///Users/tai_hungg/coding/koudou-game/src/utils/vegetationSampling.ts).

Each biome config in [`src/config/world/biomes.ts`](file:///Users/tai_hungg/coding/koudou-game/src/config/world/biomes.ts) defines 5 distinct vertical layers:
1. **`canopy`**: Dominant tall trees (10–18m). Rendered with trunk `CylinderCollider`.
2. **`understory`**: Smaller trees and tall shrubs (4–8m). Rendered with smaller trunk `CylinderCollider`.
3. **`shrub`**: Bushes and mid-level vegetation. No colliders.
4. **`clutter`**: Ground flowers, ferns, reeds, and grass. Rendered as instanced meshes ([`InstancedClutter.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/InstancedClutter.tsx)) for maximum GPU performance.
5. **`props`**: Fallen logs, stumps, pebbles, and small environmental debris.

#### Density Rule: Spacing in Meters
In `biomes.ts`, density is specified as **`spacing`** (average distance in meters between instances), **NOT count per 100m²**:
- To make a layer **sparser**: **INCREASE** `spacing`.
- To make a layer **denser**: **DECREASE** `spacing`.

#### Clearance Exclusions
A candidate position is discarded if:
1. It is within a path corridor (`pathInfluenceAt(x, z) > threshold`).
2. It falls inside the river water body or clearance margin (`riverCenterlineDistance(x, z) < RIVER_HALF_WIDTH + margin`).
3. It falls inside the clearance radius of any hand-authored landmark or learning species (`CLEARANCE_POINTS`).
4. A random roll fails the biome blend weight at that coordinate (`sampleBiome(x, z)`).

---

### 4. Spline River, Walls & Physical Bridge

The river system is defined in [`src/config/world/river.ts`](file:///Users/tai_hungg/coding/koudou-game/src/config/world/river.ts) and separates the northern zones (safe, educational) from the southern zones (mysterious, human impact).

```
North (Z0 Arrival, Z1 Early Forest, Z2 Medicinal Grove)
──────────────────────────────────────────────────────────
           ~~~~~~~~~~ R I V E R ~~~~~~~~~~
                 [ BRIDGE_POINT: (-20, 6) ]
           ~~~~~~~~~~ R I V E R ~~~~~~~~~~
──────────────────────────────────────────────────────────
South (Z4 Ancient Forest, Z5 Cave, Z6 Cabin, Z7 Deforestation)
```

1. **Curve Math**: Built from a 10-point `CatmullRomCurve3`. Sampled at 150 points (`RIVER_SAMPLES`) for collision walls and biome calculations, and 220 points for smooth mesh rendering in [`River.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/River.tsx).
2. **Collision Walls ([`RiverWalls.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/RiverWalls.tsx))**: Composed of segmented Rapier cuboids along the river banks. A 14-meter gap (`BRIDGE_WIDTH`) is left open at `BRIDGE_POINT = [-20, 6]`.
3. **Physical Bridge ([`Bridge.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/Bridge.tsx))**:
   - 6 NatureKit bridge deck segments (30 meters total length) crossing from the north bank to the south bank.
   - Oriented precisely along `BRIDGE_NORMAL` (perpendicular to river flow), ensuring both ends firmly rest on dry ground regardless of local curve bends.

---

### 5. Hand-Authored Learning Species (`WORLD_SPECIES`)

While decorative vegetation is generated procedurally from seeds, **learning species are permanently hand-placed**:

- Defined in [`src/config/world/species.ts`](file:///Users/tai_hungg/coding/koudou-game/src/config/world/species.ts).
- 19 authored positions covering all 8 zones (1 in Z0, 2 in Z1, 5 in Z2, 2 along the river, 3 in ancient forest, 2 at the cave, 2 at the cabin, 2 in human traces).
- Rendered by [`WorldSpecies.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/WorldSpecies.tsx) using the standard `LearningEntity` component (glowing interaction ring, sensor cylinder, learning card trigger).
- Each species placement specifies a `clearance` radius (typically 3–3.5m) that prevents procedural trees or bushes from crowding the interactive plant.

---

## 3. Chapter 2: The Infinite Forest (`InfiniteForest`)

In Chapter 2 (`/village`), the forest is infinite and procedural:
- Chunks are 40m × 40m.
- Chunk contents are generated deterministically using `hashCoordinates(chunkX, chunkZ, 12345)` and `mulberry32` PRNG ([`src/utils/random.ts`](file:///Users/tai_hungg/coding/koudou-game/src/utils/random.ts)).
- The central village area is cleared of procedural trees via `clearRadius={80}`, over which the static village structures ([`StaticVillage.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/StaticVillage.tsx)) are placed.
- Future roadmap plans will bring the bounded, zoned composition model from Chapter 1 to Chapter 2 to create dedicated village districts (Chief House, Herbal Garden, Sacred Totem Grounds).

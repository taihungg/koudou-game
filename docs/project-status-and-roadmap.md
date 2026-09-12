# Project Status & Development Roadmap

This document summarizes the development milestones achieved to date, current additions in the working tree, known technical debt, and next prioritized tasks for **KOUDOU**.

---

## 1. Development Milestones History

### Phase 0: Initial Audit & Direction Setting
- Evaluated the initial hackathon demo against the core design pillars in [`kou-dou.md`](file:///Users/tai_hungg/coding/koudou-game/kou-dou.md).
- Identified core issues: the prototype forest suffered from uniform asset scattering, lacked distinct landmarks, and used an endless procedural grid that diluted narrative pacing.

### Phase 1: The Vertical Slice
- Implemented the initial proof-of-concept corridor:
  ```
  Clairière d'arrivée (Z0) ──► Forêt claire (Z1) ──► Bosquet médicinal (Z2)
  ```
- Established the hybrid world approach: hand-authored macro geometry + deterministic procedural micro-clutter.
- Created hand-authored landmarks (`arrival_fallen_tree`, `early_forest_rock`, `medicinal_grove_ancient_tree`).

### Phase 2: Reusable Zoned Architecture
- Built [`ZonedForest.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/ZonedForest.tsx): bounded 480m map with 8 distinct zones.
- Separated terrain rendering (`TERRAIN_RENDER_DISTANCE = 3`) from vegetation rendering (`RENDER_DISTANCE = 1`) to eliminate visual gaps at chunk edges.
- Added perimeter canopy belt (`beltFactorAt`) creating natural physical barriers before players hit world bounds.

### Phase 3: World Content Completion
- **All 8 Biomes Authored**: Authored complete 5-tier vegetation palettes for `ancient_forest` (mossy willow, 11–15m), `rocky` (sparse conifers, cliff formations), `cabin_clearing` (overgrown grasses, abandoned crates), and `logged` (cut tree stumps, damaged soil).
- **Riverbank Biome & River Landmark**: Willow trees, reeds/lilies at the water's edge, flat river stones, and the `river_canoe` landmark.
- **Physical River Bridge**: Constructed [`Bridge.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/Bridge.tsx) with 6 NatureKit deck segments spanning 30m across the river at `BRIDGE_POINT = [-20, 6]`, oriented along `BRIDGE_NORMAL`.
- **Authoring 19 Learning Species**: Hand-placed 19 botanical species entries in [`src/config/world/species.ts`](file:///Users/tai_hungg/coding/koudou-game/src/config/world/species.ts) across all 8 zones matching realistic ecological habitats.

---

## 2. Working Tree Features & Additions

The working tree incorporates several advanced UX and storytelling systems:

1. **Chapter 1 Intro Cinematic System**:
   - [`src/store/useCinematicStore.ts`](file:///Users/tai_hungg/coding/koudou-game/src/store/useCinematicStore.ts): Cutscene state machine (`preroll` → `playing` → `ending` → `idle`).
   - [`src/config/cinematics/chapter1Intro.ts`](file:///Users/tai_hungg/coding/koudou-game/src/config/cinematics/chapter1Intro.ts): 8-shot cinematic timeline detailing the mystery of Professor Dubois' disappearance.
   - [`src/components/game/cinematic/CinematicCamera.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/cinematic/CinematicCamera.tsx): Smooth perspective camera dollies, eases, and cuts.
   - [`src/components/ui/IntroCinematicUI.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/ui/IntroCinematicUI.tsx): Synchronized French subtitles, letterbox presentation, and a skip button.
2. **Bottom-Right Live Minimap**:
   - [`src/components/ui/Minimap.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/ui/Minimap.tsx) & [`src/components/game/world/MinimapProbe.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/MinimapProbe.tsx): Live SVG minimap rendered directly from world configs with zero-overhead player tracking.
3. **Eco-Compass Radar (Key `C`)**:
   - [`src/components/ui/CompassHUD.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/ui/CompassHUD.tsx) & [`src/components/game/world/CompassRadar.ts`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/CompassRadar.ts): Real-time target acquisition pointing toward the nearest uncollected plant with isometric angle conversion.
4. **Observation Mode (Hold `F`)**:
   - [`src/components/ui/ObserveModeUI.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/ui/ObserveModeUI.tsx) & [`Player.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/Player.tsx): Magnifying glass overlay, zoom-in to `75`, and 360° orbit camera inspection.
5. **Grounded Jump Physics**:
   - In `Player.tsx`, added vertical velocity check (`Math.abs(velY) < 0.05`) to prevent double-jumping.

---

## 3. Known Issues & Technical Debt

### 1. TypeScript Types in Working Tree
In the current working tree, `npx tsc --noEmit` flags two minor type issues:
- `src/utils/gameplayCamera.ts`: Needs typing as `THREE.OrthographicCamera` to match `<OrthographicCamera ref={gameplayCamera} ... />` in `src/app/forest/page.tsx`.
- `src/components/game/cinematic/CinematicCamera.tsx`: Needs import of `gameplayCamera` from `@/utils/gameplayCamera`.

### 2. Audio Filename Correction
- In `public/audio/`, the file was renamed from `_koudou_background_music.wav` (with leading underscore) to `koudou_background_music.wav` to match [`BackgroundMusic.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/audio/BackgroundMusic.tsx).

### 3. Fast Refresh Invalidation Caveat
- When modifying world constants or camera spawn points in local development while a browser tab is open, Next.js Fast Refresh can desynchronize Rapier physics bodies. Always run:
  ```js
  localStorage.clear(); location.reload();
  ```
  in the browser console when testing camera or spawn adjustments.

### 4. Asset Caveats
- `/models/survival/survivalassetpack.fbx` is a combined multi-mesh atlas and cannot be spawned directly without splitting.
- `/models/koudou/` totem mascot FBX models use an estimated scale (`0.25`) that will need visual fine-tuning when the Koudou encounter sequence is staged.

---

## 4. Next Development Milestones

### Milestone 1: Zone Species Checklist UI
- **Goal**: Provide the player with a clear in-game exploration checklist (e.g. *"Bosquet médicinal : 3/5 espèces découvertes"*).
- **Prerequisites Complete**: Hand-authored `WORLD_SPECIES` data is fully stable with assigned `zoneId` and `speciesId`.
- **Remaining Task**: Design and build the UI component (e.g. an expandable tab on the Minimap or a page in the Botanical Notebook) in clear, supportive French.

### Milestone 2: Campfire & Journal de Bord (Zone 5)
- **Goal**: Implement the pacing reset and reflective learning loop at the cave/camp site (`Z5: cave_camp`).
- **Mechanics**:
  - Rest at campfire to transition from day to dusk/night.
  - Open the **Journal de Bord** (field notebook) to review notes, fill in missing French botanical terms, and reflect on the mystery.

### Milestone 3: Chapter 2 Village Hub Overhaul
- **Goal**: Migrate the Chapter 2 village from the legacy `InfiniteForest` to a structured, intentional spatial layout matching [`kou-dou.md`](file:///Users/tai_hungg/coding/koudou-game/kou-dou.md):
  ```
  Forest Gate ──► Residential Area ──► Central Square ──► Chief's House / Herbal Garden / Sacred Totem Grounds
  ```
- **Visual Transformation**: Support before/after visual states where completing ecological quests visibly cleans waste, replants trees, and restores the village's health.

### Milestone 4: Audio Pronunciation Integration
- **Goal**: Add audio playback buttons to the Fiche d'Espèce cards and dialogue options, allowing players to hear authentic French pronunciation for botanical and conservation terminology.

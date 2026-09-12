# KOUDOU — Documentation Index & Agent Guide

Welcome to the internal documentation suite for **KOUDOU**. These documents are designed to give AI agents and developers complete architectural, pedagogical, and system-level context about the game.

---

## Document Directory

| Document | Description | Key Topics |
|---|---|---|
| [**architecture.md**](file:///Users/tai_hungg/coding/koudou-game/docs/architecture.md) | Technical architecture & runtime design | Dual-tree R3F/DOM, Zustand stores, camera math, 60fps probes, Rapier physics |
| [**world-system.md**](file:///Users/tai_hungg/coding/koudou-game/docs/world-system.md) | World layout & composition systems | Ch1 ZonedForest (8 zones, biomes, river, bridge) vs Ch2 InfiniteForest, vegetation sampling |
| [**gameplay-and-interactions.md**](file:///Users/tai_hungg/coding/koudou-game/docs/gameplay-and-interactions.md) | Player controls & interaction mechanics | Player movement, sensor loop, Observation Mode (F), Compass Radar (C), Minimap, Cutscenes |
| [**learning-and-narrative.md**](file:///Users/tai_hungg/coding/koudou-game/docs/learning-and-narrative.md) | Educational framework & narrative design | FLE A2–B2 pedagogy, species cards, quizzes, dialogue trees, Dubois & Koudou story arcs |
| [**assets-and-pipeline.md**](file:///Users/tai_hungg/coding/koudou-game/docs/assets-and-pipeline.md) | Asset management & pipeline | 3D models catalog, normalization layer, audit scripts, 2D flower cards, animations |
| [**project-status-and-roadmap.md**](file:///Users/tai_hungg/coding/koudou-game/docs/project-status-and-roadmap.md) | Current build status & roadmap | Completed milestones (P0–P3, cinématiques, compass), known issues, next features |

---

## Quick Reference & Golden Invariants

1. **Dual-Tree UI/Canvas Pattern**: DOM UI components and the R3F `<Canvas>` are mounted as **siblings** in scene routes (`src/app/forest/page.tsx`, `src/app/village/page.tsx`). They communicate **only** through Zustand stores (`src/store/`) or module-scoped probes.
2. **Two Separate Forests**:
   - Chapter 1 uses [`ZonedForest.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/ZonedForest.tsx) (bounded 480m map, 8 authored zones, spline river, bridge, hand-placed species).
   - Chapter 2 uses [`InfiniteForest.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/InfiniteForest.tsx) (procedural chunk streaming with `mulberry32` PRNG).
   - **Never** edit `InfiniteForest.tsx` when intending to modify the Chapter 1 forest!
3. **60 FPS Probe Pattern**: Never push per-frame coordinates or clock ticks into Zustand `set()` or React state. Use module probes (`minimapProbe`, `playerRadar`, `cinematicClock`) and sample them via `requestAnimationFrame` to mutate the DOM directly.
4. **Isometric Projection Offset**: The gameplay camera uses `OrthographicCamera` with `zoom={40}` and position `[20, 20, 20]`. Player velocity is rotated by `Math.PI / 4` (45°) to align input with the isometric grid.
5. **Asset Scaling**: Never hardcode scale multipliers on 3D meshes. Always compute scales via `scaleToHeight(modelPath, targetHeight)` from [`src/constants/assetScale.ts`](file:///Users/tai_hungg/coding/koudou-game/src/constants/assetScale.ts).

---

## Primary Design Documents (Legacy & Origin)

- [`kou-dou.md`](file:///Users/tai_hungg/coding/koudou-game/kou-dou.md): The original level composition brief and architectural handoff document.
- [`chapter1-world-status.md`](file:///Users/tai_hungg/coding/koudou-game/chapter1-world-status.md): Status notes for the P0–P3 bounded world overhaul.
- [`card.md`](file:///Users/tai_hungg/coding/koudou-game/card.md): Specifications and mockups for the Fiche d'espèce cards.
- [`dialouge.md`](file:///Users/tai_hungg/coding/koudou-game/dialouge.md): Narrative dialogue scripts and French interaction examples.

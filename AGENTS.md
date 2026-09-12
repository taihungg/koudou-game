<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — KOUDOU Development Guide

Welcome to **KOUDOU**. This guide provides all AI agents with the project's identity, technical stack, architecture invariants, conventions, key commands, and directory structure.

For deep-dive documentation on specific subsystems, consult [`docs/`](file:///Users/tai_hungg/coding/koudou-game/docs/README.md).

---

## 1. Project Overview

- **What is Koudou?** A 3D cozy exploration/RPG web game that teaches French as a Foreign Language (**FLE**, target levels **A2–B1**, up to B2) centered on United Nations Sustainable Development Goals (**UN SDG 15: Life on Land** and **SDG 16: Peace, Justice & Strong Institutions**). Built for the *Hackathon Jeu Parle Français 2026 (OIF)*.
- **Narrative Premise**: The player controls **Alex**, a Vietnamese botany researcher/intern with a Francophone conservation organization in Central Africa. Alex gets separated from the expedition and must survive, explore, decode scientific and cultural clues, solve the mystery of the missing totem animal **Koudou**, and help a local village transition toward sustainable ecological practices.
- **Pedagogical Core**: French is an in-world tool for survival, exploration, communication, and decision-making — **not** an arbitrary quiz overlay.

---

## 2. Key Commands

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Typecheck with TypeScript
npx tsc --noEmit

# Code style & linting (ESLint 9 flat config + eslint-config-next)
npm run lint

# Production build
npm run build

# Start production server
npm run start

# Re-run 3D asset scale audit & code generator
node scripts/generate-asset-data.mjs
```

> [!NOTE]
> There is currently no automated unit test runner (Jest/Vitest) configured. Code integrity is verified via `npx tsc --noEmit`, `npm run lint`, and browser testing.

---

## 3. Tech Stack & Environment

- **Framework**: Next.js 16 (App Router), React 19, TypeScript strict mode.
  - Path alias: `@/*` maps to `src/*`.
  - Always consult `node_modules/next/dist/docs/` for Next.js 16 conventions.
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`.
  - There is **no `tailwind.config.js`**. Theme tokens, fonts, and custom keyframes (`animate-float-up`, `font-story`, etc.) are declared in [`src/app/globals.css`](file:///Users/tai_hungg/coding/koudou-game/src/app/globals.css).
- **3D Graphics & Physics**:
  - `@react-three/fiber` (R3F v9) + `@react-three/drei` (v10).
  - `@react-three/rapier` (Rapier physics engine v2) + `three` (r184) + `three-stdlib`.
- **State Management**: Zustand v5 (`src/store/`).

---

## 4. Repository Structure

```
koudou-game/
├── AGENTS.md                  # This file: primary agent orientation & rules
├── CLAUDE.md                  # Legacy assistant notes
├── kou-dou.md                 # Original game design & level composition brief
├── chapter1-world-status.md   # Status notes for Chapter 1 forest system (P0-P3)
├── docs/                      # Detailed modular agent documentation suite
│   ├── README.md              # Index of all docs
│   ├── architecture.md        # Dual-tree R3F/DOM, state stores, camera math & probes
│   ├── world-system.md        # Ch1 ZonedForest (8 zones, river, bridge) vs Ch2 InfiniteForest
│   ├── gameplay-and-interactions.md # Controls, interaction loop, Observe mode, Compass, Minimap, Cutscenes
│   ├── learning-and-narrative.md    # FLE A2-B2 pedagogy, species cards, quiz mechanics, narrative
│   ├── assets-and-pipeline.md       # 3D assets, scale normalization, audit scripts, 2D cards
│   └── project-status-and-roadmap.md# Roadmap, P0-P3 status, working tree changes, known issues
├── public/
│   ├── assets/                # 2D card art (flowers_2d/), UI icons
│   ├── audio/                 # Background music & dialogue clips
│   └── models/                # 3D GLB/GLTF/FBX models organized by pack
├── scripts/                   # Asset audit and code generation scripts
└── src/
    ├── app/                   # Next.js App Router routes
    │   ├── page.tsx           # Main menu (chapter select)
    │   ├── forest/page.tsx    # Chapter 1: Bounded ZonedForest
    │   ├── village/page.tsx   # Chapter 2: StaticVillage + InfiniteForest
    │   ├── models/            # Internal 3D model inspector
    │   └── export/            # Internal 2D flower card PNG exporter
    ├── components/
    │   ├── audio/             # Audio players (BackgroundMusic.tsx)
    │   ├── game/              # R3F 3D components (Player, LearningEntity, world/, cinematic/)
    │   └── ui/                # DOM overlay components (HUD, Cards, Minimap, Compass, Dialogue)
    ├── config/
    │   ├── cinematics/        # Intro shot timeline configs (chapter1Intro.ts)
    │   └── world/             # Chapter 1 layout, zones, biomes, river, bridge, species
    ├── constants/             # Asset scales, asset path dictionaries, camera settings
    ├── data/                  # Learning entities data (learningEntities.json)
    ├── lib/                   # Server/client utility libraries
    ├── store/                 # Zustand stores (game, learning, dialogue, cinematic)
    └── utils/                 # Math, easing, cameras, radars, sampling algorithms
```

---

## 5. Architectural Invariants (Must Follow)

### 1. Dual-Tree Architecture Bridged ONLY by Zustand
- In every game scene route ([`src/app/forest/page.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/app/forest/page.tsx), [`src/app/village/page.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/app/village/page.tsx)), the DOM UI overlay components (`<HUD />`, `<LearningCardUI />`, `<Minimap />`, `<CompassHUD />`) and the 3D `<Canvas>` are **siblings** under `<main>`, **never nested**.
- `src/components/game/*` must only render Three.js / R3F / Rapier elements.
- `src/components/ui/*` is pure DOM + Tailwind CSS.
- **They communicate exclusively via Zustand stores** (`src/store/`) or dedicated 60fps probes.

### 2. Two Distinct World Systems (Do Not Mix!)
- **Chapter 1 (`/forest`)** uses [`ZonedForest.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/ZonedForest.tsx):
  - Finite, bounded map (`WORLD_HALF = 240m`, `PLAYABLE_HALF = 200m`).
  - 8 intentional zones (Arrival, Early Forest, Grove, River, Ancient Forest, Cave, Cabin, Deforestation).
  - Hand-authored landmarks and species placements (`WORLD_SPECIES`).
  - Spline river with collision walls and physical bridge.
- **Chapter 2 (`/village`)** uses [`InfiniteForest.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/InfiniteForest.tsx):
  - Procedural, endless chunk streaming using deterministic PRNG (`mulberry32`).
  - Carved out around the village center via `clearRadius={80}`.
- **Rule**: If making changes to the Chapter 1 forest, **never** edit `InfiniteForest.tsx` — you must edit `ZonedForest.tsx` and `src/config/world/*`.

### 3. Zero-Overhead 60fps Probes (Avoid React State for Per-Frame Data)
- High-frequency data (player position for minimap, radar coordinates for compass, cutscene clock) must **never** be pumped into Zustand `set()` or React state inside `useFrame`.
- Use the module-scoped probe pattern:
  - [`minimapProbe`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/MinimapProbe.tsx): Player X/Z coordinates for the minimap.
  - [`playerRadar`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/CompassRadar.ts): Player & entity coordinates for the compass.
  - [`cinematicClock`](file:///Users/tai_hungg/coding/koudou-game/src/store/useCinematicStore.ts): Cutscene timeline clock.
- The UI layer samples these probes via `requestAnimationFrame` and mutates DOM elements directly.

### 4. Interaction Loop Contract
1. 3D entities mount a `<RigidBody sensor>` with a `CylinderCollider` and write to `useLearningStore` / `useDialogueStore` on intersection.
2. The UI listens to DOM keyboard events (`keydown`/`keyup` on `window`). Space or E triggers interaction, Escape closes.
3. Opening an interaction sets `setInteracting(true)`. The `Player` controller checks this flag in `useFrame` and immediately early-returns to freeze physics and play `Idle_A`.
4. On unmount, components must clear their sensor entries (`setNearbyEntity(null)` guarded by ID) to prevent sticky interaction prompts when chunks unload.

### 5. Camera Conventions & Isometric Math
- **Gameplay Camera**: `OrthographicCamera` with `zoom={40}` and isometric offset `ISO_CAMERA_OFFSET = 20` (`position={[20, 20, 20]}`).
  - Front/back/left/right movement is rotated by `Math.PI / 4` (45°) to align WASD with the screen diagonal.
  - Under true isometric projection, world X and Z axes appear at ~120° on screen, not 90°.
- **Observation Mode**: Hold `F` key to zoom in (`OBSERVE_ZOOM = 75`) with a magnifying glass UI overlay. If near a species, Left/Right arrow keys rotate the camera 360° around the entity.
- **Cinematic Camera**: Switch to perspective camera during cutscenes using manual `set({ camera })`, restoring the gameplay camera via `gameplayCamera` reference upon exit.

---

## 6. Critical Conventions & Gotchas

1. **Asset Normalization**:
   - Never hardcode arbitrary scale numbers for 3D models. Use `scaleToHeight(modelPath, targetHeight)` from [`src/constants/assetScale.ts`](file:///Users/tai_hungg/coding/koudou-game/src/constants/assetScale.ts).
   - Use `GAME_ASSETS` constants from [`src/constants/assets.ts`](file:///Users/tai_hungg/coding/koudou-game/src/constants/assets.ts) instead of raw path strings.
   - Always call `useGLTF.preload(modelPath)` at module scope for runtime-spawned models.
2. **Skinned Meshes**:
   - Always clone animated characters with `SkeletonUtils.clone(gltf.scene)` (`three-stdlib`). Standard `.clone()` breaks skeleton and bone bindings.
3. **Zustand Persistence Rules**:
   - `persist` key for gameplay: `koudou-game-storage`.
   - The `partialize` configuration strictly excludes transient flags (`isInteracting`, `isBotanicalBookOpen`, modal states) so modals never freeze open on page reload.
4. **Three.js Deprecation Warning Suppression**:
   - Both `/forest/page.tsx` and `/village/page.tsx` include a module-scope filter on `console.warn` to silence r169+ deprecation notices from R3F/Rapier. Preserve this filter when adding routes.
5. **Client vs Server Modules**:
   - [`src/lib/assets.ts`](file:///Users/tai_hungg/coding/koudou-game/src/lib/assets.ts) uses Node.js `fs` and `path` to scan models on the server. **Never** import it into client components (`"use client"`).

---

## 7. Deep-Dive Documentation Links

For detailed guides, please see:
- 📖 [**docs/README.md**](file:///Users/tai_hungg/coding/koudou-game/docs/README.md) — Documentation index & navigation
- 🏛️ [**docs/architecture.md**](file:///Users/tai_hungg/coding/koudou-game/docs/architecture.md) — Technical architecture, physics & camera math
- 🌲 [**docs/world-system.md**](file:///Users/tai_hungg/coding/koudou-game/docs/world-system.md) — ZonedForest, biomes, river & bridge systems
- 🎮 [**docs/gameplay-and-interactions.md**](file:///Users/tai_hungg/coding/koudou-game/docs/gameplay-and-interactions.md) — Controls, Observe mode, Compass, Minimap, Cinematics
- 📚 [**docs/learning-and-narrative.md**](file:///Users/tai_hungg/coding/koudou-game/docs/learning-and-narrative.md) — FLE pedagogy, species cards, quizzes, dialogue, story
- 📦 [**docs/assets-and-pipeline.md**](file:///Users/tai_hungg/coding/koudou-game/docs/assets-and-pipeline.md) — 3D/2D asset pipeline, audit scripts, character rigs
- 🗺️ [**docs/project-status-and-roadmap.md**](file:///Users/tai_hungg/coding/koudou-game/docs/project-status-and-roadmap.md) — Current build status, known issues, and next tasks

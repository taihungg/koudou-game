# Architecture & Technical Design

This document details the core technical patterns, state management strategy, physics engine design, and camera math in **KOUDOU**.

---

## 1. The Dual-Tree Architecture

A core design principle of Koudou is the clean separation of 2D DOM user interfaces from 3D WebGL scenes. In every playable route (`/forest`, `/village`), the root JSX structure renders the DOM overlay and the R3F `<Canvas>` as **siblings**, never nested:

```tsx
<main className="w-screen h-screen overflow-hidden relative bg-sky-100">
  {/* Layer 1: DOM UI Overlay (Tailwind CSS, HTML, Lucide icons) */}
  {!cinematic && (
    <>
      <HUD />
      <LearningCardUI />
      <InventoryHUD />
      <BotanicalBookUI />
      <Minimap />
      <CompassHUD />
      <ObserveModeUI />
    </>
  )}
  <IntroCinematicUI />
  {debug && <WorldDebugPanel />}

  {/* Layer 2: 3D WebGL Canvas (React Three Fiber + Rapier) */}
  <KeyboardControls map={keyboardMap}>
    <Canvas shadows={{ type: THREE.PCFShadowMap }}>
      <OrthographicCamera makeDefault position={[20, 20, 20]} zoom={40} />
      <Physics debug={false}>
        <Environment />
        <Player spawn={SPAWN} />
      </Physics>
      <IntroScene />
    </Canvas>
  </KeyboardControls>
</main>
```

### Key Architectural Invariants
1. **No Canvas Nesting**: Never nest DOM UI elements inside `<Canvas>`.
2. **Component Purity**:
   - `src/components/game/*` may only use Three.js, R3F, Rapier, and drei primitives.
   - `src/components/ui/*` is pure HTML, SVG, and Tailwind CSS.
3. **Single Integration Seam**: The two trees communicate **exclusively** through Zustand stores (`src/store/`) or zero-overhead module probes. A 3D component detects an event and updates a store or probe; a DOM component reads the store or probe and updates the UI.

---

## 2. State Management & Zustand Stores

State is cleanly partitioned into domain-specific stores located in [`src/store/`](file:///Users/tai_hungg/coding/koudou-game/src/store):

### 1. `useGameStore` (`src/store/useGameStore.ts`)
- **Purpose**: Global game progress, scores, inventory, and navigation flags.
- **State Fields**:
  - `xp_langage`: Total language XP earned from quizzes and dialogue.
  - `indice_biodiversite`: Score for UN SDG 15 (biodiversity awareness).
  - `lien_confiance`: Score for UN SDG 16 (community trust and peace).
  - `inventory`: Array of collected item identifiers.
  - `currentChapter`: 1 (`/forest`) or 2 (`/village`).
  - `isInteracting`: Boolean flag indicating whether a modal, card, or dialogue is open.
  - `isBotanicalBookOpen`: Boolean flag controlling the encyclopedia modal.
  - `hasSeenVillageIntro`: Intro cutscene seen flag for Chapter 2.
  - `hasSeenChapter1Intro`: Intro cutscene seen flag for Chapter 1.
- **Persistence Rules (`partialize`)**:
  - Persists under key `koudou-game-storage`.
  - **Excludes**: `isInteracting`, `isBotanicalBookOpen`, and `hasSeenVillageIntro`.
  - **Includes**: Scores (`xp_langage`, `indice_biodiversite`, `lien_confiance`), `inventory`, `currentChapter`, and `hasSeenChapter1Intro`.
  - *Rationale*: Modals and interaction freezes must **never** resurrect upon page reload, but one-time prologue cinematics and scores must persist.

### 2. `useLearningStore` (`src/store/useLearningStore.ts`)
- **Purpose**: Tracks botanical and zoological learning interactions.
- **State Fields**:
  - `nearbyEntity`: Entity currently inside the player's interaction sensor cylinder.
  - `activeEntity`: Entity whose Fiche d'espèce card / quiz is actively opened.
  - `completedExercises`: Array of `speciesId` strings for which the quiz has been passed.
- **Persistence Rules**:
  - Persists under key `koudou-learning-storage`.
  - Persists `completedExercises` so XP is not re-granted on duplicate visits and encyclopedia entries remain unlocked.

### 3. `useDialogueStore` (`src/store/useDialogueStore.ts`)
- **Purpose**: Manages NPC conversations, dialogue tree sequences, and step progression.
- **State Fields**:
  - `isOpen`: Dialogue box visibility.
  - `currentSequence`: Active array of `DialogueStep` objects.
  - `currentStepIndex`: Current index in the active dialogue script.
  - `nearbyNPCId`: ID of the NPC in range.
- **Persistence Rules**: Not persisted. Conversations reset if reloaded.

### 4. `useCinematicStore` (`src/store/useCinematicStore.ts`)
- **Purpose**: Coordinates cutscene playback between the 3D cinematic camera and the 2D subtitle overlay.
- **Phases**:
  - `'idle'`: Normal gameplay.
  - `'preroll'`: Black screen while initial 3D chunks and assets stream into memory.
  - `'playing'`: Active camera movement, transitions, and subtitles.
  - `'ending'`: Restoring default camera and handing control back to player.
- **Persistence Rules**: Not persisted.

---

## 3. High-FPS Module Probes (Zero React Re-render Pattern)

Updating React state or calling Zustand `set()` at 60 frames per second inside `useFrame` triggers heavy re-renders across the DOM tree. For continuous spatial data, Koudou uses **Module-Scoped Probes**:

```
[R3F Canvas: useFrame] 
       │
       ▼ (writes directly to plain JS object every frame)
  [Module Probe]
       │
       ▼ (reads via requestAnimationFrame, mutates DOM / SVG directly)
[DOM UI: Minimap / Compass / Subtitles]
```

### Active Probes in the Codebase

1. **`minimapProbe`** ([`src/components/game/world/MinimapProbe.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/MinimapProbe.tsx)):
   - Stores `minimapProbe.x` and `minimapProbe.z`.
   - Updated in `useFrame` by reading the player's rigid body translation.
   - Read by [`Minimap.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/ui/Minimap.tsx) inside a `requestAnimationFrame` loop to translate the player's indicator dot on the SVG minimap without React re-rendering.
2. **`playerRadar` & `entityRadar`** ([`src/components/game/world/CompassRadar.ts`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/CompassRadar.ts)):
   - Stores player position and a registry of all active learning entity locations.
   - Read by [`CompassHUD.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/ui/CompassHUD.tsx) to find the nearest uncollected plant, calculate direction angle, and rotate the CSS compass needle.
3. **`cinematicClock`** ([`src/store/useCinematicStore.ts`](file:///Users/tai_hungg/coding/koudou-game/src/store/useCinematicStore.ts)):
   - Stores `shotIndex`, `shotElapsedMs`, and `shotDurationMs`.
   - Incremented each frame by [`CinematicCamera.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/cinematic/CinematicCamera.tsx).
   - Read by [`IntroCinematicUI.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/ui/IntroCinematicUI.tsx) via `requestAnimationFrame` to trigger fade transitions and display subtitles with millisecond synchronization.
4. **`gameplayCamera`** ([`src/utils/gameplayCamera.ts`](file:///Users/tai_hungg/coding/koudou-game/src/utils/gameplayCamera.ts)):
   - Stores a persistent reference to the orthographic camera.
   - Prevents Drei's `makeDefault` layout effect from restoring the wrong camera instance when switching back from perspective cinematics.

---

## 4. Camera Projection Math & Isometric Space

### 1. Gameplay Camera Configuration
- **Type**: `OrthographicCamera`
- **Zoom**: `40` (default), `75` (observation mode)
- **Position Offset**: `ISO_CAMERA_OFFSET = 20` (`[20, 20, 20]`)
- **Clipping Planes**: `near={-1000}`, `far={1000}` (wide planes ensure the 480m map is never clipped).

### 2. The 45° Isometric Diagonal
Under an isometric projection with camera vector `[1, 1, 1]`, screen-space Up is not along world `-Z`; it is along the diagonal between `-X` and `-Z`.

In [`Player.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/Player.tsx):
```ts
// Calculate raw movement vector from WASD keys
direction.subVectors(frontVector, sideVector)
  .normalize()
  .multiplyScalar(sprint ? speed * sprintMultiplier : speed);

// Rotate input vector 45 degrees (Math.PI / 4) to align with isometric camera
direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
```

### 3. Screen Angle Transformation (The ~120° Illusion)
Under true isometric projection, world axes X and Z do **not** project at 90° on the screen; they project at approximately **120°**.
When calculating compass needle orientation in screen space:
```ts
// In CompassHUD.tsx:
const angleDeg = (Math.atan2(nearestDx - nearestDz, -(nearestDx + nearestDz)) * 180) / Math.PI;
```
This converts world-space offsets `(dx, dz)` into screen-space rotation degrees matching the camera projection.

---

## 5. Physics & Collision Conventions (`@react-three/rapier`)

Physics is handled by Rapier. To maintain 60 FPS in browser WebGL, colliders are carefully tailored:

1. **Player Physics**:
   - Dynamic `RigidBody` with `enabledRotations={[false, false, false]}` and Continuous Collision Detection (`ccd={true}`).
   - Visual mesh is detached from rotation lock and smoothed with `MathUtils.lerp`.
   - Ground check: `Math.abs(currentVelY) < 0.05` ensures jump only fires when grounded.
2. **Tree Colliders**:
   - Trees use a hand-tuned trunk-only `CylinderCollider` at ground level.
   - Foliage and branches have **no colliders**, allowing the player to pass under the canopy naturally.
3. **Rock Colliders**:
   - Rocks use `colliders="hull"`.
   - The `<primitive>` is wrapped inside a scaled `<group>` so Rapier generates convex hulls at the correct target dimensions.
4. **Bushes, Grass & Ground Clutter**:
   - Completely collider-free to eliminate collision budget waste.
5. **River Barriers**:
   - Generated by [`RiverWalls.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/RiverWalls.tsx).
   - Composed of ~120 static cuboid colliders following the river's `CatmullRomCurve3` spline, leaving a single opening at `BRIDGE_POINT`.
6. **Interaction Sensors**:
   - Interactive plants and NPCs use `<RigidBody type="fixed" colliders={false}>` with a `<CylinderCollider sensor args={[1, SENSOR_RADIUS]} />`.
   - Fires `onIntersectionEnter` and `onIntersectionExit` without pushing or blocking the player.

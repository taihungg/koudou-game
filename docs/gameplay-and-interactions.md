# Gameplay Systems & Interaction Mechanics

This document details the player controller, interaction loops, camera controls, navigation tools, and cinematic systems in **KOUDOU**.

---

## 1. Player Controller (`Player.tsx`)

The player controller is implemented in [`src/components/game/Player.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/Player.tsx). It cleanly decouples physics simulation from visual mesh rendering and animation playback.

### 1. Key Controls
- **Movement**: `W`, `A`, `S`, `D` or Arrow Keys.
- **Sprint**: Left/Right `Shift` (multiplier: `1.8x`, base speed: `5 m/s`).
- **Jump**: Left/Right `Ctrl` (jump force: `6`).
- **Interact**: `E` or `Space` (opens cards, speaks to NPCs).
- **Observe**: Hold `F` (activates magnifying glass mode / 360° orbit camera).
- **Eco-Compass**: Press `C` (toggles on-screen target tracking compass).
- **Botanical Book**: Press `B` (opens encyclopedia).

### 2. Velocity-Based Physics & Isometric Vector Mapping
- **Linear Velocity**: Movement uses Rapier's `rigidBody.setLinvel(...)` rather than translating transforms, preventing the player from phasing through colliders.
- **Isometric Alignment**: Raw WASD input is rotated by `Math.PI / 4` (45°), so pressing `W` moves diagonally "up-right" in world space, matching the isometric screen angle:
  ```ts
  direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
  ```
- **Double-Jump Prevention**: Vertical velocity is checked before permitting a jump:
  ```ts
  const currentVelY = rigidBodyRef.current.linvel().y;
  const isGrounded = Math.abs(currentVelY) < 0.05;
  const velY = jump && isGrounded ? jumpForce : currentVelY;
  ```

### 3. Visual Character & Animation State Machine
- Rendered by the `AnimatedCharacter` subcomponent.
- Visual meshes are cloned via `SkeletonUtils.clone` from `three-stdlib`. Standard `.clone()` breaks skinned meshes and corrupts bone bindings.
- Animation clips (`Idle_A`, `Running_A`) cross-fade smoothly over `0.2s` using Three.js `AnimationMixer`.
- Rotation is smoothly interpolated toward movement velocity using `MathUtils.lerp`.

---

## 2. The Core Interaction Loop

The interaction pattern across all interactive entities (plants, animals, NPCs) follows a strict 4-step sequence:

```
[3D World]                           [Zustand Store]                [DOM Overlay]
    │                                       │                             │
1. Player enters sensor ───────────────────►│ setNearbyEntity(data) ─────►│ Show "ESPACE" prompt
    │                                       │                             │
2. Player presses Space/E ─────────────────►│ setInteracting(true) ──────►│ Open LearningCardUI
    │                                       │                             │
    ▼ (Player.tsx freezes in useFrame)      │                             │
3. Player answers quiz / dialogue ─────────►│ addXP(), markCompleted()   │
    │                                       │                             │
4. Player presses Escape / Closes ─────────►│ setInteracting(false) ─────►│ Dismiss modal
```

### Critical Implementation Details
1. **Sensor Trigger**:
   - Entities mount a `<RigidBody type="fixed" colliders={false}>` with a `<CylinderCollider sensor args={[1, SENSOR_RADIUS]} />`.
   - `onIntersectionEnter` calls `setNearbyEntity(item.entityData)`.
   - `onIntersectionExit` calls `setNearbyEntity(null)` **guarded by ID match**:
     ```ts
     onIntersectionExit: () => {
       if (useLearningStore.getState().nearbyEntity?.id === item.entityData.id) {
         useLearningStore.getState().setNearbyEntity(null);
       }
     }
     ```
2. **Player Freeze Guarantee**:
   In `Player.tsx`, `useFrame` begins with:
   ```ts
   if (!rigidBodyRef.current || isInteracting) {
     if (animation !== "Idle_A") setAnimation("Idle_A");
     return; // Physics and movement are completely suspended
   }
   ```
3. **Sensor Cleanup on Unmount**:
   When forest chunks stream out while the player is inside an entity's sensor radius, the entity's cleanup effect must reset `nearbyEntity`. Without this, the prompt gets stuck on screen permanently.

---

## 3. Observation Mode (Hold `F`)

Observation mode is designed to let the player inspect flora and fauna in high detail, fulfilling the "observe first" design pillar from [`kou-dou.md`](file:///Users/tai_hungg/coding/koudou-game/kou-dou.md).

### Mechanics
1. **Camera Zoom**: Holding `F` smoothly lerps the orthographic camera zoom from `40` to `OBSERVE_ZOOM = 75`.
2. **Magnifying Glass Overlay ([`ObserveModeUI.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/ui/ObserveModeUI.tsx))**:
   - Renders a circular magnifying glass with a radial vignette that darkens screen edges.
   - Shows the species' French name, scientific name, and short description.
3. **360° Orbit Inspection**:
   - If the player is near a learning entity (`nearbyEntity`), holding `F` locks the camera onto the entity's position.
   - Pressing Left (`A` / `←`) or Right (`D` / `→`) rotates the camera 360° around the plant:
     ```ts
     camera.position.set(
       target.x + ORBIT_RADIUS * Math.sin(orbitAngleRef.current),
       pos.y + ORBIT_HEIGHT,
       target.z + ORBIT_RADIUS * Math.cos(orbitAngleRef.current)
     );
     camera.lookAt(target.x, pos.y + 1, target.z);
     ```

---

## 4. The Eco-Compass Radar (Press `C`)

The Eco-Compass is implemented in [`src/components/ui/CompassHUD.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/ui/CompassHUD.tsx) and backed by [`src/components/game/world/CompassRadar.ts`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/CompassRadar.ts).

### Mechanics
- Pressing `C` toggles the HUD compass widget in the top-right corner.
- It scans the module registry `entityRadar` for all active learning entities that have **not yet been collected** (`!completedExercises.includes(entry.speciesId)`).
- It calculates distance (`Math.hypot(dx, dz)`) to identify the nearest target.
- The compass needle rotation is converted from world offsets `(dx, dz)` into screen degrees using the isometric projection formula:
  ```ts
  const angleDeg = (Math.atan2(nearestDx - nearestDz, -(nearestDx + nearestDz)) * 180) / Math.PI;
  needleRef.current.style.transform = `rotate(${angleDeg}deg)`;
  ```
- It displays the target's French common name and real-time distance in meters (e.g. `Liane du Roi — 34 m`). If all species in the area are collected, it reports *"Tout exploré ici"*.

---

## 5. Live Minimap (`Minimap.tsx` & `MinimapProbe.tsx`)

The minimap in the bottom-right corner provides spatial orientation across Chapter 1's 8 zones:

1. **Single Source of Truth**:
   - The map background SVG is rendered directly from the configurations in [`src/config/world/chapter1.ts`](file:///Users/tai_hungg/coding/koudou-game/src/config/world/chapter1.ts) and [`river.ts`](file:///Users/tai_hungg/coding/koudou-game/src/config/world/river.ts) (zone circles, zone rectangles, spline river, landmarks).
   - Changing zone coordinates in `chapter1.ts` automatically updates the minimap without manual artwork edits.
2. **Zero-Overhead Player Tracking**:
   - [`MinimapProbe.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/world/MinimapProbe.tsx) runs in R3F's `useFrame` and updates the static object `minimapProbe = { x, z }`.
   - [`Minimap.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/ui/Minimap.tsx) runs a `requestAnimationFrame` loop to translate the indicator circle without re-rendering React.
3. **Dynamic Zone Naming**:
   - Evaluates `sampleBiome(px, pz)` to display the French name of the zone the player is currently traversing (e.g. *"Clairière d'arrivée"*, *"Bosquet médicinal"*, *"Rivière"*).

---

## 6. Intro Cinematic Engine

The prologue cutscene engine coordinates 3D camera dollies with 2D cinematic subtitles:

- **Config**: [`src/config/cinematics/chapter1Intro.ts`](file:///Users/tai_hungg/coding/koudou-game/src/config/cinematics/chapter1Intro.ts).
- **Camera Controller**: [`src/components/game/cinematic/CinematicCamera.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/cinematic/CinematicCamera.tsx).
- **UI Overlay**: [`src/components/ui/IntroCinematicUI.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/ui/IntroCinematicUI.tsx).

### Features
1. **Multi-Shot Timeline**: Defines a sequence of shots (`dead_land`, `revived_grove`, `dubois`, `alex_decides`, etc.) with durations, easing equations (`easeInOutCubic`, `linear`), and target camera transforms.
2. **Perspective Camera Switch**: Switches from orthographic gameplay camera to perspective camera to establish dramatic scale and environmental depth.
3. **Synced Subtitles & Voiceover**: The single module clock `cinematicClock` guarantees French subtitles and audio cues remain locked to camera movements regardless of frame rate drops.
4. **Instant Skip Button**: Players can click *« Passer »* at any point to immediately skip to gameplay.

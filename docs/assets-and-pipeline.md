# Asset Pipeline & Normalization

This document details how 3D models, textures, 2D botanical cards, animations, and audio are organized, normalized, and loaded in **KOUDOU**.

---

## 1. 3D Model Catalog (`public/models/`)

Koudou integrates free, CC0, and indie 3D asset packs (primarily from itch.io). Assets are organized in `public/models/`:

| Directory | Source / Content | Typical Assets |
|---|---|---|
| `characters/` | KayKit Characters | `players/Rogue.glb`, `Knight.glb`, `Mage.glb`, NPCs, shared animation rigs |
| `naturekit/` | Kenney Nature Kit | Conifer trees, birch trees, rocks, wooden bridge segments, canoe, terrain tiles |
| `quaternius/` | Quaternius Nature Pack | Detailed deciduous trees, fallen dead trees, stumps, flowers |
| `kaykit/` | KayKit Medieval / Forest | Wooden fences, barrels, crates, cabin structures |
| `polybygoogle/` | Poly by Google | Specific flowers, plants, and environmental props |
| `koudou/` | Custom / Indie Fauna | Totem mascot models (`FawnHawk.fbx`, etc.) |
| `survival/` | Survival Pack | Environmental survival props (*Note: `survivalassetpack.fbx` is a combined atlas and cannot be spawned directly without splitting*)|

---

## 2. Constant Asset Mappings (`GAME_ASSETS`)

To prevent broken paths and typo regressions, all asset paths must be referenced through constant dictionaries:

- **Primary Dictionary**: [`src/constants/assets.ts`](file:///Users/tai_hungg/coding/koudou-game/src/constants/assets.ts)
  - Organized hierarchically: `GAME_ASSETS.MODELS.CHARACTERS`, `GAME_ASSETS.MODELS.NATUREKIT`, `GAME_ASSETS.MODELS.QUATERNIUS`, etc.
- **Generated Catalog**: [`src/constants/assetsExtra.ts`](file:///Users/tai_hungg/coding/koudou-game/src/constants/assetsExtra.ts)
  - Automatically produced by `scripts/generate-asset-data.mjs` when scanning new files.

> [!IMPORTANT]
> **Never use raw string paths** like `"/models/naturekit/tree.glb"` in scene components. Always import and reference `GAME_ASSETS.MODELS.*`.

---

## 3. Scale Normalization Layer (`assetScale.ts`)

Because assets originate from different creators, their native bounding boxes vary by orders of magnitude (e.g. one pack uses 1 unit = 1 meter, another uses 1 unit = 1 centimeter, another uses 1 unit = 10 meters).

Koudou solves this with an **automated normalization pipeline**:

```
[Raw 3D Files in public/models/]
       │
       ▼ (scripts/audit-models.mjs & scripts/audit-fbx.mjs parse bounding boxes)
[assetHeights.generated.json]
       │
       ▼ (multiplies by target canonical height in meters)
[scaleToHeight(modelPath, targetHeightInMeters)] in src/constants/assetScale.ts
```

### 1. The Normalization Formula
```ts
export function scaleToHeight(modelPath: string, targetHeightInMeters: number): number {
  const nativeHeight = ASSET_HEIGHTS[modelPath];
  if (!nativeHeight || nativeHeight <= 0) {
    // Fallback to pack default multiplier if asset was not audited
    return getPackFallbackScale(modelPath);
  }
  return targetHeightInMeters / nativeHeight;
}
```

### 2. Standard Target Heights (`TARGET_HEIGHT`)
Defined in [`src/constants/assetScale.ts`](file:///Users/tai_hungg/coding/koudou-game/src/constants/assetScale.ts):
- `CANOPY_TREE`: `12.0m – 17.0m`
- `UNDERSTORY_TREE`: `5.0m – 8.0m`
- `SHRUB`: `1.5m – 2.5m`
- `CLUTTER`: `0.4m – 1.0m`
- `LEARNING_ENTITY`: `1.2m` (ensures all collectible flowers appear at a uniform, readable size)

### 3. Running the Generator Script
Whenever you add new models to `public/models/`, re-run the generator:
```bash
node scripts/generate-asset-data.mjs
```
This runs `scripts/audit-models.mjs` (GLB/GLTF bounding box auditor) and `scripts/audit-fbx.mjs` (binary FBX parser that runs without Three.js) and regenerates `assetHeights.generated.json` and `assetsExtra.ts`.

---

## 4. Preloading & Loading Pipeline

### 1. Module-Scope Preloading
To prevent WebGL stutter and frame drops when streaming chunks into view:
```ts
// Call at module scope in components that spawn assets dynamically
useGLTF.preload(GAME_ASSETS.MODELS.CHARACTERS.PLAYERS_ROGUE);
useGLTF.preload(GAME_ASSETS.MODELS.NATUREKIT.TREE_DETAILED);
```

### 2. File Format Dispatch
[`LearningEntity.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/game/LearningEntity.tsx) dispatches based on file extension:
- **`.fbx`**: Loaded via `useFBX`. Scales by `0.01` and automatically searches the animation clip list for an idle loop.
- **`.glb` / `.gltf`**: Loaded via `useGLTF`. Materials are traversed to enable `castShadow` and `receiveShadow`.

---

## 5. Character Rigs & Animation Pipeline

Player characters and NPCs share a unified animation rig from KayKit:
- **Rig Components**:
  - General Animations: `GAME_ASSETS.MODELS.CHARACTERS.ANIMATIONS_RIG_MEDIUM_GENERAL`
  - Basic Movement Animations: `GAME_ASSETS.MODELS.CHARACTERS.ANIMATIONS_RIG_MEDIUM_MOVEMENTBASIC`
- **Clip Combination**: Both animation sets are combined into a single animation list passed to `useAnimations(...)`.
- **Active Clips**:
  - `Idle_A`: Standard resting stance.
  - `Running_A`: Locomotion clip triggered when movement velocity exceeds `0.1 m/s`.
- **Skinned Mesh Cloning**:
  ```ts
  // ALWAYS clone skinned character scenes using SkeletonUtils:
  import { SkeletonUtils } from 'three-stdlib';
  const character = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene]);
  ```

---

## 6. 2D Botanical Card Generation Route (`/export`)

In the encyclopedia and Fiche d'Espèce, each flower features an illustrated 2D card image. Rather than hand-drawing 59 images, Koudou includes an **internal snapshot exporter**:

1. **Route**: Visiting `http://localhost:3000/export` in development mounts each flower model offscreen.
2. **Offscreen Capture**: Uses Three.js with `preserveDrawingBuffer: true` to take transparent PNG snapshots at a standardized angle and lighting.
3. **API Save**: The client POSTs the base64 data URL to `src/app/api/flowers/route.ts`, which writes the image directly to `public/assets/flowers_2d/<model_name>.png`.
4. **Resolution**: Card components look up images by mapping `flower.modelPath.split('/').pop().replace('.glb', '.png')`.

> [!CAUTION]
> The `/export` route and `/api/flowers` endpoint perform local file system writes. They are development tools and must be disabled or authenticated in production deployments.

---

## 7. Audio System (`src/components/audio/`)

Audio playback is managed by:
- **Component**: [`BackgroundMusic.tsx`](file:///Users/tai_hungg/coding/koudou-game/src/components/audio/BackgroundMusic.tsx).
- **Player Utility**: [`loopingMusicPlayer.ts`](file:///Users/tai_hungg/coding/koudou-game/src/lib/loopingMusicPlayer.ts) (handles browser autoplay policies, volume ramping, and seamless looping).
- **Audio Files**:
  - Background Music: `public/audio/koudou_background_music.wav`.
  - Voice / Dialogue clips: Stored under `public/audio/` for spoken French pronunciation.

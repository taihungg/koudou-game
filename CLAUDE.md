# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # next dev (http://localhost:3000)
npm run build    # next build
npm run start    # serve production build
npm run lint     # eslint (flat config, eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit # typecheck
```

There is no test framework in this project — no test runner, config, or test files exist.

## What this is

KOUDOU is a browser 3D "cozy RPG" that teaches French (FLE, A2–B2) around UN SDG 15
(biodiversity) and SDG 16 (peace/institutions), built for the Hackathon Jeu Parle Français
2026 (OIF). All in-game text is French; code comments are a mix of English and Vietnamese.

Design docs live at the repo root and are the source of truth for game content and level
intent — `KOUDOU-overview.md` (full game plan), `kou-dou.md` (level/world-composition
handoff doc), `card.md`, `dialouge.md`. Read them before inventing gameplay or copy.
`chapter1-world-status.md` is a separate, code-focused status doc for the `/forest`
zone/vegetation/river system in `src/config/world` — read it before touching that system;
it tracks what's built, what still falls back to defaults, and known bugs.

## Stack and conventions

- Next.js 16 App Router, React 19, TypeScript strict, `@/*` → `src/*`.
- **Read `node_modules/next/dist/docs/` before writing Next.js code** (see AGENTS.md) —
  this Next version diverges from older conventions.
- Tailwind v4 via `@tailwindcss/postcss`. There is **no `tailwind.config`**: theme tokens
  and custom keyframe utilities (`animate-float-up`, `animate-drop-fade`,
  `animate-shake-fail`, `font-story`) are declared in `src/app/globals.css`.
- 3D: `@react-three/fiber` + `@react-three/drei` + `@react-three/rapier` + `three-stdlib`.
- State: Zustand stores in `src/store`.

## Architecture

### Two parallel trees bridged by Zustand

Every game route renders a DOM overlay and an R3F `<Canvas>` as **siblings**, never nested:

```
<main>
  <HUD /> <StoryIntroUI /> <LearningCardUI /> <DialogueUI /> <InventoryHUD /> <BotanicalBookUI />
  <KeyboardControls map={...}>
    <Canvas shadows>
      <OrthographicCamera makeDefault position={[20,20,20]} zoom={40} />
      <Physics><VillageEnvironment /><Player /></Physics>
```

`src/components/game/*` may only use R3F/three primitives; `src/components/ui/*` is plain
DOM + Tailwind. They communicate **only** through the stores — that is the one integration
seam, so new features generally mean: a sensor in a game component that writes to a store,
plus a UI component that reads it.

Routes: `/` main menu (sets chapter + resets the intro flag), `/forest` Chapter 1,
`/village` Chapter 2, `/models` + `/models/[packName]` asset browser, `/export` PNG
render tool.

### Stores (`src/store`)

- `useGameStore` — scores (`xp_langage`, `indice_biodiversite` = ODD 15,
  `lien_confiance` = ODD 16), inventory, `currentChapter`, `isInteracting`, per-chapter
  intro-seen flags. `persist` key `koudou-game-storage`; `partialize` deliberately
  **excludes** `isInteracting`, `isBotanicalBookOpen`, and the intro flags so modals never
  resurrect from localStorage.
- `useLearningStore` — `nearbyEntity` (in sensor range) vs `activeEntity` (card open), plus
  `completedExercises` (persisted, key `koudou-learning-storage`) which gates repeat XP and
  unlocks encyclopedia entries.
- `useDialogueStore` — `nearbyNPCId`, open sequence, step index. Not persisted. The Kofi
  dialogue script is exported from this file as `kofiDialogue` (content lives in code, not
  JSON, unlike the species data).

### Interaction loop (the core pattern)

1. A game component mounts a `<RigidBody sensor>` with a `CylinderCollider` and
   `onIntersectionEnter/Exit` that sets `nearbyEntity` / `nearbyNPCId`.
2. The matching UI component renders an "ESPACE" prompt and attaches a `window` `keydown`
   listener — Space opens, Escape closes. Interaction keys are handled in the DOM, **not**
   through drei's `KeyboardControls` (which only drives movement).
3. Opening sets `setInteracting(true)`; `Player`'s `useFrame` early-returns on that flag and
   forces `Idle_A`, which is how the player is frozen during cards, dialogue, and intros.
4. On unmount, components clear their own entry via
   `useXStore.getState().setNearby*(null)` guarded by an id comparison. **Keep this** —
   forest chunks unload while the player is still inside a sensor, and without it the prompt
   sticks forever.

### Infinite forest (`InfiniteForest.tsx`)

Chunk streaming, 40-unit chunks, 5×5 window. Content is **deterministic, not stored**:
`hashCoordinates(chunkX, chunkZ, 12345)` seeds `mulberry32` (`src/utils/random.ts`), then
100 items are drawn per chunk — 5% learning entity, then trees / rocks / bushes / foliage.
Same coordinates always regenerate the same chunk, so never add unseeded `Math.random()` to
chunk generation.

Player position is inferred as `camera.position - 20` on each axis, because `Player`'s
`useFrame` parks the camera at `player + [20,20,20]`. That `20` is duplicated in both files —
change the isometric offset in one and chunk streaming silently desyncs.

Collider conventions, chosen for performance: trees get a hand-tuned trunk-only
`CylinderCollider`; rocks use `colliders="hull"` with the `<primitive>` wrapped in a scaled
`<group>` so Rapier hulls come out the right size; bushes and foliage get **no** collider.

`VillageEnvironment` composes `StaticVillage` over `InfiniteForest clearRadius={80}`;
`/forest`'s `Environment` uses the forest alone.

### Characters

`Player` splits physics from visuals: the `RigidBody` + `CapsuleCollider` stays mounted while
`AnimatedCharacter` is keyed on the model URL, so swapping characters (or HMR) rebuilds the
`AnimationMixer` instead of corrupting it. Models are cloned with
`SkeletonUtils.clone` (required — plain `.clone()` breaks skinned meshes). Animations come
from two shared rig GLBs merged into one clip list; clip names used are `Idle_A` and
`Running_A`. Movement is velocity-based (`setLinvel`) and rotated by `Math.PI/4` to align
input with the isometric view. `StaticVillage`'s `NPCCharacter` / `InteractableNPC` repeat the
same clone-and-play-`Idle_A` recipe.

## Assets

- `public/models/<pack>/…` holds GLB/GLTF/FBX packs; `src/constants/assets.ts` is a large flat
  `GAME_ASSETS.MODELS.<PACK>.<NAME>` map of those public paths. Game code should reference
  `GAME_ASSETS`, never raw strings. `InfiniteForest` categorizes assets by filename
  substring (`/Tree_`, `/Bush`, `/Rock`, `/_grass`…) over `Object.values(...)`, so renaming
  files or constants can silently empty a category.
- `useGLTF.preload(...)` at module scope for anything spawned at runtime — that is what keeps
  chunk loads from hitching.
- `LearningEntity` dispatches on extension: `.fbx` → `useFBX` path (scaled `0.01`, auto-plays
  a clip whose name contains "idle"), everything else → `useGLTF`.
- `src/lib/assets.ts` is **server-only** (`fs`/`path`) and walks `public/models` for the
  `/models` viewer pages. Don't import it from a client component.

## Content data

`src/data/learningEntities.json` currently has one key, `flowers` (59 entries), shaped per
`LearningEntityData` in `useLearningStore.ts`: bilingual names, status, `leftPanel`/`rightPanel`
record maps rendered as key/value rows, and an `exercise` (options + `correctAnswer` index +
success/fail feedback). `InfiniteForest` also reads an `animals` key and tags it with a larger
sensor radius, but animals are intentionally excluded from the spawn list right now.

Scoring is applied in the UI layer, not the data: correct species quiz = +5 XP and +5 ODD 15
(once, gated by `completedExercises`), wrong = −5 XP; correct dialogue choice = +5 XP and
+5 ODD 16, wrong = −2 XP and a retry with the step's `hint`. Both show floating `+N` text and
fire `canvas-confetti`.

### 2D card images

Card art and the encyclopedia derive their image path from the model path — `modelPath`'s
basename with `.glb` → `.png`, looked up in `public/assets/flowers_2d/`. Those PNGs are
generated by visiting `/export`, which renders each flower offscreen with
`preserveDrawingBuffer`, then POSTs data URLs to `src/app/api/flowers/route.ts`, which writes
files into `public/assets/flowers_2d/`. It is a local dev tool that writes to the repo; it is
not safe to deploy as-is.

## Gotchas

- `/forest/page.tsx` and `/village/page.tsx` each monkey-patch `console.warn` at module scope
  to mute three.js r169 deprecation noise from f iber/rapier. Copy the block if you add a
  scene route, and remember real warnings matching those strings are swallowed too.
- Pages that read persisted state gate on a `mounted` flag (see `src/app/page.tsx`) to avoid
  hydration mismatches; `layout.tsx` also sets `suppressHydrationWarning`.
- Several `InventoryHUD` slots are `alert()` placeholders, and `parse_fbx.js` /
  `parse_fbx_three.js` at the root are abandoned one-off scripts with hardcoded absolute
  paths — not part of any build.
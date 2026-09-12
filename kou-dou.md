# KOUDOU --- Development Direction & Handoff

> **Purpose:** This document is the working design/implementation brief
> for continuing Koudou.\
> **Status:** The current build is an early demo. Do not treat its
> forest layout, UI layout, quest placement, village composition, or
> asset placement as final.\
> **Primary stack:** WebGL, Three.js, React Three Fiber (R3F), Zustand
> and related web-game libraries.\
> **Art production constraint:** Reuse and normalize free asset packs
> (primarily itch.io) rather than creating a bespoke asset library from
> scratch.

------------------------------------------------------------------------

## 1. Product vision

**Koudou** is a cozy 2.5D exploration/RPG game for learning French
through contextual gameplay.

The player controls **Alex Nguyễn**, a Vietnamese botany
researcher/intern working with a Francophone conservation organization
in Central Africa. Alex becomes separated from the expedition and is
lost in a tropical forest.

The learning experience should not feel like:

> walk → game stops → answer an unrelated French exercise → resume game.

The desired experience is:

> **observe → understand French → act in the world → receive a
> consequence/reward → encounter the language again later.**

French is therefore a **tool for exploration, survival, communication
and progression**, not an overlay on top of the game.

Target level is primarily **A2--B1**, with room to progress toward B2.

The narrative mystery revolves around **Koudou**, the forest/village
totem animal that has not appeared for years. The player gradually
discovers that its disappearance is connected to environmental
degradation and human activity.

------------------------------------------------------------------------

# 2. Core design pillars

All implementation decisions should be checked against these pillars.

## 2.1 Exploration first

The forest must feel like a place worth exploring rather than a flat
container filled with trees and quest markers.

The player should form a mental map using:

-   landmarks;
-   paths;
-   clearings;
-   rivers;
-   vegetation changes;
-   structures;
-   lighting;
-   environmental storytelling.

## 2.2 Language through action

Whenever possible, a French-learning interaction should have an in-world
reason.

Examples:

-   identify a plant because Alex needs it;
-   read survival instructions to make a fire;
-   understand an NPC to gain access somewhere;
-   remember a plant's function to help villagers;
-   read signs/rules to manage the village;
-   listen to an NPC before choosing a response.

## 2.3 Reuse knowledge

Knowledge learned earlier must return later.

Example loop:

``` text
Discover plant
      ↓
Read Fiche Espèce
      ↓
Recall its French name
      ↓
Use plant for survival
      ↓
Recall it in Journal de Bord
      ↓
Use the same knowledge with NPCs in Chapter 2
```

This creates contextual spaced repetition rather than isolated
flashcards.

## 2.4 Environmental storytelling

Story should be visible in the world.

Do not rely entirely on dialogue boxes or exposition.

Examples:

-   fresh axe marks;
-   traps;
-   footprints;
-   abandoned fire;
-   cloth caught on branches;
-   damaged vegetation;
-   old Koudou symbols;
-   abandoned cabin;
-   progressively degraded forest toward the village.

## 2.5 Cozy, readable 2.5D presentation

The game should remain approachable rather than visually realistic.

Prioritize:

-   readability;
-   strong silhouettes;
-   controlled density;
-   warm/cozy composition;
-   clear interaction hierarchy;
-   stable performance in browser.

------------------------------------------------------------------------

# 3. Current demo --- problems to address

The current build is a prototype and should be refactored rather than
polished in place blindly.

## 3.1 Forest currently reads as asset scatter

The current forest contains many trees but lacks strong spatial
composition.

Problems:

-   relatively uniform vegetation distribution;
-   weak distinction between playable space and decorative space;
-   insufficient clearings;
-   limited landmark hierarchy;
-   quest objects compete visually with decorative vegetation;
-   ground can feel flat between large assets;
-   player navigation depends too much on UI/markers rather than
    environment.

**Do not solve this by simply adding more trees.**

The solution is a structured level-composition system.

------------------------------------------------------------------------

# 4. World composition model

Build environments in this order:

``` text
ZONE
  ↓
LANDMARK
  ↓
PATH
  ↓
VEGETATION CLUSTERS
  ↓
GAMEPLAY OBJECTS
  ↓
AMBIENT DECORATION
```

Never begin a zone by randomly scattering decorative assets.

------------------------------------------------------------------------

# 5. Forest visual layers

## Layer 1 --- Canopy / natural boundaries

Use large trees and dense vegetation to shape playable areas.

Purposes:

-   establish outer boundaries;
-   create corridors;
-   hide inaccessible space;
-   frame clearings;
-   control sight lines.

Avoid excessive invisible walls where vegetation can communicate the
boundary naturally.

Large canopy objects may partially occlude the player. If necessary,
implement fading/transparency when Alex walks behind foreground canopy.

------------------------------------------------------------------------

## Layer 2 --- Midground vegetation

Includes:

-   medium/small trees;
-   bushes;
-   ferns;
-   shrubs;
-   logs;
-   stumps;
-   medium rocks.

Do **not** uniformly randomize these across the map.

Create vegetation clusters.

Conceptual data structure:

``` ts
type VegetationCluster = {
  center: [number, number]
  radius: number
  density: number
  palette: VegetationType[]
  scaleRange: [number, number]
  rotationVariance: number
}
```

Procedural placement should occur **inside intentionally authored
cluster regions**.

------------------------------------------------------------------------

## Layer 3 --- Ground clutter

The current world needs more small-scale grounding.

Possible elements:

-   grass tufts;
-   small plants;
-   tiny flowers;
-   fallen leaves;
-   twigs;
-   mushrooms;
-   pebbles;
-   roots;
-   mud patches;
-   subtle terrain/ground variation.

Do not distribute them uniformly.

Different zones should have different ground signatures.

Examples:

-   river → wet ground, rocks, reeds;
-   dense forest → leaves, roots, mushrooms;
-   path → reduced grass and subtle soil;
-   clearing → grass and flowers;
-   damaged forest → stumps, branches, exposed soil.

------------------------------------------------------------------------

## Layer 4 --- Landmarks

Every important area should have something memorable.

Candidate landmarks:

  Zone              Landmark
  ----------------- -------------------------------------
  Arrival           giant fallen tree
  Early forest      unusual rock/tree formation
  Medicinal Grove   distinctive flowering/ancient tree
  River             large rocks / crossing / log bridge
  Ancient Forest    Koudou carving/totem
  Cave              cliff/rock formation
  Cabin Clearing    abandoned cabin
  South Forest      visibly cut trees / human traces

A player should be able to remember:

> "The medicinal plants were near the flowering tree."

instead of:

> "They were somewhere among many similar trees."

------------------------------------------------------------------------

## Layer 5 --- Gameplay objects

Examples:

-   QuestPlant;
-   Animal;
-   Clue;
-   NPC;
-   Collectible;
-   InteractionPoint.

Gameplay objects need **visual breathing room**.

Avoid placing an important interactive plant in the middle of equally
saturated, equally large decoration.

Prefer micro-compositions where nearby decoration frames the interactive
object.

------------------------------------------------------------------------

# 6. Paths are diegetic navigation UI

The environment itself should guide movement.

Use:

-   gaps in vegetation;
-   tree corridors;
-   subtle dirt;
-   lower grass density;
-   rock alignment;
-   fallen logs;
-   lighting;
-   terrain shape;
-   composition pointing toward destinations.

Avoid depending on giant arrows or permanent waypoint markers whenever
environmental guidance can do the job.

A path does not need to look like a road.

------------------------------------------------------------------------

# 7. Authored vs procedural generation

Use a hybrid approach.

## Hand-authored

These should have intentional positions:

-   zone boundaries;
-   primary and secondary paths;
-   landmarks;
-   river;
-   cave;
-   cabin;
-   village structures;
-   story clues;
-   quest targets;
-   major interaction points;
-   player spawn;
-   transitions.

## Procedural / semi-procedural

Good candidates:

-   grass;
-   small rocks;
-   ferns;
-   bushes;
-   leaf litter;
-   minor tree variation;
-   tiny props;
-   some ambient vegetation.

Principle:

> **Designer controls macro layout. Algorithms handle
> micro-decoration.**

Use deterministic seeds so the same authored scene remains reproducible.

------------------------------------------------------------------------

# 8. Proposed Chapter 1 level structure

Chapter 1 should be a sequence of memorable spaces rather than one
homogeneous forest.

Suggested progression:

``` text
Arrival Clearing
      ↓
Forêt Claire / Early Forest
      ↓
Medicinal Grove
      ↓
River / Survival Area
      ↓
Ancient Forest / Koudou Mystery
      ↓
Cave / Camp
      ↓
Abandoned Cabin
      ↓
Human Traces / Southern Path
      ↓
Chapter 2
```

Side paths may contain optional plants, fauna, collectibles and language
revision.

------------------------------------------------------------------------

## Z0 --- Arrival Clearing

Purpose:

-   establish Alex being lost;
-   teach movement;
-   teach interaction;
-   introduce notebook;
-   provide visual calm before dense forest.

Keep vegetation density low.

The first few minutes should not overwhelm the player.

------------------------------------------------------------------------

## Z1 --- Early Forest

Purpose:

-   first Fiche Espèce;
-   first plant identification;
-   introduce the core exploration-learning loop.

Use one obvious landmark and simple navigation.

------------------------------------------------------------------------

## Z2 --- Medicinal Grove

Purpose:

-   introduce multiple useful plants;
-   begin spaced repetition;
-   introduce Feuille's assistance;
-   teach player that vegetation composition communicates meaningful
    areas.

This zone should visually differ from ordinary forest.

------------------------------------------------------------------------

## Z3 --- River / Survival Area

Change the gameplay rhythm.

Alex needs to understand French survival instructions and find objects
such as:

-   dry branches;
-   a suitable stone;
-   dry grass/tinder.

The French text has an immediate gameplay consequence: the player must
understand it to locate the correct resources.

------------------------------------------------------------------------

## Z4 --- Ancient Forest / Mystery

Begin the Koudou mystery **before Chapter 2**.

Possible environmental clues:

-   old carved Koudou symbol;
-   damaged totem;
-   unusual footprints;
-   abandoned observation point;
-   Feuille reacting to something;
-   an old drawing or symbol.

Do not explain everything.

Alex can record something like:

> *Un symbole étrange... Qu'est-ce que cela signifie ?*

The purpose is narrative curiosity.

------------------------------------------------------------------------

## Z5 --- Cave / Camp

Safe zone and pacing reset.

Use for:

-   campfire;
-   Journal de Bord;
-   reflection;
-   vocabulary/grammar recall;
-   day/night transition.

This closes the learning loop for knowledge encountered during
exploration.

------------------------------------------------------------------------

## Z6 --- Abandoned Cabin Clearing

This should be a Chapter 1 visual climax.

Before arrival:

-   dense forest;
-   narrow sight lines;
-   increased enclosure.

Then reveal:

-   a large clearing;
-   stronger/open lighting;
-   cabin centered or strongly composed;
-   reduced vegetation immediately around it.

The world itself tells the player:

> Someone has been here.

Cabin content can introduce:

-   supplies;
-   books;
-   old documents;
-   forest-protection material;
-   human clue;
-   story progression;
-   future cooking/resource mechanics.

------------------------------------------------------------------------

## Z7 --- Human Traces / Southern Route

The environment becomes increasingly affected by people.

Examples:

-   fresh axe marks;
-   cut stumps;
-   traps;
-   footprints;
-   cloth;
-   disturbed soil;
-   abandoned fire;
-   discarded objects.

This naturally points toward Chapter 2.

------------------------------------------------------------------------

# 9. Chapter 1 quest philosophy

Avoid:

``` text
Walk to marker
→ popup quiz
→ answer
→ XP
```

Prefer:

``` text
Need / curiosity
→ observe environment
→ interact
→ French information
→ use information
→ world consequence
→ later recall
```

Example:

1.  Alex needs a useful plant.
2.  Player discovers it.
3.  Fiche Espèce introduces name/function.
4.  Player recalls its name to collect/use it.
5.  Plant becomes an inventory/survival resource.
6.  At camp, Journal de Bord asks about it again.
7.  Chapter 2 NPC later asks Alex about the same plant.

------------------------------------------------------------------------

# 10. Koudou mystery arc

Koudou must not suddenly become important only in the village.

Seed the mystery throughout Chapter 1.

Potential progression:

### Early

Player sees an unfamiliar animal/totem symbol.

### Middle

The same symbol appears again in a more deliberate location.

### Cabin

Player discovers an old drawing/note/photo referencing the animal or
local belief.

### Village

Player learns that Koudou is the community's missing totem animal.

### Later

Environmental evidence suggests habitat degradation caused it to leave.

### Resolution

Village/environment restoration leads to evidence of Koudou returning.

The mystery should connect:

-   exploration;
-   environmental sustainability;
-   village narrative;
-   educational goals;
-   final emotional payoff.

------------------------------------------------------------------------

# 11. Chapter 2 village strategy

Do not create the village as a random cluster of attractive houses.

Build it as a spatial quest hub.

Suggested structure:

``` text
Forest Gate
     ↓
Residential Area
     ↓
Central Square
  ↙       ↘
Chief     Storage/Logging
House
  ↓
Farm / Livestock
  ↓
Herbal Garden
  ↓
Sacred / Koudou Area
```

Each district should have:

-   a visual identity;
-   a gameplay function;
-   one or more NPCs;
-   one or more language mechanics;
-   a visible environmental problem.

------------------------------------------------------------------------

# 12. Village before/after transformation

When Alex first arrives, show problems physically:

-   excessive cut timber;
-   barren ground;
-   damaged farm soil;
-   uncontrolled livestock;
-   trash;
-   missing vegetation;
-   damaged forest edge.

As quests are completed, modify the actual scene:

-   trees replanted;
-   garden established;
-   fencing added;
-   waste removed;
-   livestock organized;
-   forest edge recovers;
-   community spaces improve;
-   Koudou-related area restored.

Do not represent sustainability only as a numerical meter.

The player should **see the village change**.

------------------------------------------------------------------------

# 13. French learning mechanics

Maintain four broad learning dimensions:

-   vocabulary;
-   reading comprehension;
-   listening comprehension;
-   expression/interaction.

But embed them into different mechanics.

## Vocabulary

Good contexts:

-   Fiche Espèce;
-   Herbier;
-   fauna observation;
-   tools/resources;
-   environment.

## Reading

Good contexts:

-   survival guide;
-   notebook;
-   old documents;
-   signs;
-   village rules;
-   planting instructions.

## Listening

Good contexts:

-   NPC dialogue;
-   radio;
-   voice messages;
-   environmental/NPC instructions.

Whenever possible, dialogue and species cards should support audio
pronunciation.

## Interaction / expression

Good contexts:

-   meeting villagers;
-   politeness;
-   negotiation;
-   asking questions;
-   convincing the chief;
-   resolving disagreements.

Avoid obviously absurd multiple-choice distractors too often. Prefer
plausible alternatives distinguished by:

-   politeness;
-   register;
-   grammar;
-   context;
-   social consequence.

------------------------------------------------------------------------

# 14. Feedback philosophy

No hard game-over is required for normal language mistakes.

Wrong answers should produce:

-   concise explanation;
-   contextual hint;
-   retry;
-   small consequence if useful;
-   future repetition.

Correct answers should produce:

-   immediate acknowledgement;
-   meaningful world/gameplay progress;
-   optional concise grammar/vocabulary explanation.

Avoid excessive modal interruptions.

------------------------------------------------------------------------

# 15. HUD redesign

The current large permanent left-side stats panel should be
reconsidered.

During exploration, prioritize the world.

Suggested minimal exploration HUD:

-   small notebook icon;
-   inventory/backpack;
-   contextual interaction prompt;
-   temporary quest objective when needed.

Move detailed stats into notebook/menu:

-   Niveau de français;
-   Langage XP;
-   Biodiversité;
-   Confiance;
-   Herbier;
-   Faune;
-   Journal;
-   chapter progress.

The world should occupy most of the screen.

------------------------------------------------------------------------

# 16. Navigation philosophy

Use three layers of guidance.

## Layer A --- environmental guidance

Default.

Paths, openings, lighting, landmarks and composition.

## Layer B --- contextual hints

If the player appears lost:

-   Feuille reacts;
-   Alex comments;
-   notebook updates;
-   subtle environmental highlight.

## Layer C --- explicit navigation

Only when necessary:

-   mini-map;
-   objective marker;
-   direction indicator.

Avoid starting immediately with Layer C for every objective.

------------------------------------------------------------------------

# 17. Asset strategy

Koudou may combine assets from multiple free itch.io packages.

That is acceptable.

The objective is not "one asset pack only."

Instead build a unified **Koudou asset vocabulary**.

Suggested organization:

``` text
assets/world/
  forest/
    canopy/
    trees/
    bushes/
    ferns/
    grass/
    flowers/
  terrain/
    rocks/
    cliffs/
    river/
    ground/
  props/
    logs/
    stumps/
    mushrooms/
    branches/
  structures/
    cave/
    cabin/
    village/
  story/
    koudou/
    human-clues/
    traps/
  interactive/
    medicinal-plants/
    animals/
```

------------------------------------------------------------------------

# 18. Asset normalization requirements

Assets from different packages must be normalized according to at least:

1.  **scale**
2.  **roughness**
3.  **saturation**
4.  **lighting response**
5.  **shadow behavior**
6.  **outline treatment**
7.  **polygon density**

Create a documented normalization layer rather than manually fixing
individual usages throughout scene code.

Possible metadata concept:

``` ts
type AssetStyleProfile = {
  canonicalScale: number
  saturationMultiplier?: number
  roughnessOverride?: number
  metalnessOverride?: number
  castShadow: boolean
  receiveShadow: boolean
  outlineMode?: 'none' | 'subtle' | 'strong'
  lodClass?: 'tiny' | 'low' | 'medium' | 'hero'
}
```

Do not blindly modify original source assets if runtime
normalization/configuration is sufficient.

------------------------------------------------------------------------

# 19. R3F architecture direction

Avoid giant scene components containing hundreds of hard-coded meshes.

Prefer data-driven composition.

Potential structure:

``` text
Game
├── World
│   ├── Chapter
│   │   ├── Zones
│   │   ├── Paths
│   │   ├── Landmarks
│   │   ├── Vegetation
│   │   ├── StoryObjects
│   │   └── Interactables
│   └── EnvironmentSystems
├── Player
├── InteractionSystem
├── QuestSystem
├── DialogueSystem
├── LearningSystem
├── AudioSystem
└── UI
```

Example zone configuration:

``` ts
type ForestZoneConfig = {
  id: string
  bounds: ZoneBounds
  biome: BiomeId
  landmark?: LandmarkConfig
  paths: PathConfig[]
  vegetationClusters: VegetationClusterConfig[]
  ambientProps: AmbientPropConfig[]
  questPoints: QuestPointConfig[]
  storyClues: StoryClueConfig[]
  transitions: ZoneTransitionConfig[]
}
```

The exact types should be adapted to the existing codebase rather than
imposed blindly.

------------------------------------------------------------------------

# 20. Zustand direction

Do not create one enormous store if concerns can remain separate.

Possible slices:

``` text
player
world
quests
learning
dialogue
inventory
progression
settings
audio
ui
```

Persist only data that actually needs persistence.

World decoration should generally be derived from zone
configuration/seed rather than stored as huge mutable arrays.

------------------------------------------------------------------------

# 21. Interaction system

Prefer a generic interaction contract.

Conceptually:

``` ts
interface Interactable {
  id: string
  type: InteractableType
  interactionRadius: number
  prompt: string
  canInteract(state): boolean
  interact(): void
}
```

Support:

-   plants;
-   animals;
-   clues;
-   NPCs;
-   doors;
-   books;
-   campfire;
-   story objects.

Keep visual detection, quest logic and educational content decoupled
where practical.

------------------------------------------------------------------------

# 22. Performance requirements

Because this is a browser WebGL game:

Use/consider:

-   instancing for repeated vegetation;
-   shared geometries/materials;
-   GLTF reuse;
-   texture atlases where appropriate;
-   compressed textures when practical;
-   Draco/Meshopt where appropriate;
-   LOD for expensive assets;
-   distance-based visibility;
-   reduced shadow casters;
-   deterministic vegetation;
-   object pooling where beneficial.

Do not enable dynamic shadows on every plant.

Hero objects may cast better shadows; ambient clutter generally should
not.

Measure performance before premature optimization.

------------------------------------------------------------------------

# 23. Camera / 2.5D depth

Use camera composition intentionally.

Foreground canopy can create depth.

Potential technique:

-   foreground trees partially occlude screen edges;
-   player passes behind canopy;
-   canopy fades when it blocks Alex excessively;
-   background tree walls frame the playable corridor;
-   important clearings open the camera composition.

Avoid making every object equally readable at all depths.

------------------------------------------------------------------------

# 24. Recommended implementation order

**Do not attempt to rebuild everything simultaneously.**

## Phase 0 --- Audit existing code

Before editing:

1.  inspect repository structure;
2.  identify current scene architecture;
3.  identify asset loading pipeline;
4.  identify Zustand stores;
5.  identify quest/dialogue/learning implementation;
6.  identify collision/navigation approach;
7.  identify performance bottlenecks;
8.  document assumptions.

Do not rewrite functioning systems without a reason.

------------------------------------------------------------------------

## Phase 1 --- Build one vertical slice

Use a small portion of Chapter 1:

``` text
Arrival Clearing
→ Early Forest
→ Medicinal Grove
```

Implement the new design system here first.

Success criteria:

-   obvious path without intrusive waypoint;
-   at least one memorable landmark;
-   vegetation clusters;
-   readable quest plant;
-   ground clutter;
-   stable player movement;
-   functioning Fiche Espèce;
-   clean HUD;
-   acceptable browser performance.

Do not redesign the entire forest until this slice feels correct.

------------------------------------------------------------------------

## Phase 2 --- Extract reusable systems

After the vertical slice works:

-   Zone configuration;
-   VegetationCluster;
-   Landmark;
-   Path;
-   QuestPOI;
-   asset normalization;
-   interaction system;
-   environmental guidance helpers.

------------------------------------------------------------------------

## Phase 3 --- Complete Chapter 1 world

Add:

-   River;
-   Ancient Forest;
-   Koudou mystery clues;
-   Cave;
-   Cabin;
-   Human Traces;
-   Chapter 2 transition.

------------------------------------------------------------------------

## Phase 4 --- Improve learning loop

Connect:

``` text
Fiche Espèce
→ inventory/use
→ Journal de Bord
→ later recall
```

Add audio where appropriate.

------------------------------------------------------------------------

## Phase 5 --- Build Chapter 2 village

Only after Chapter 1 establishes stable environment/interaction systems.

Build village districts as quest hubs and support visible before/after
transformations.

------------------------------------------------------------------------

# 25. Definition of success for Chapter 1

A new player should be able to:

1.  understand how to move without reading a long tutorial;
2.  know where exploration is likely possible;
3.  distinguish decoration from interactable objects;
4.  remember at least several locations by visual landmarks;
5.  encounter French because the situation requires it;
6.  reuse previously learned French;
7.  understand that something mysterious is happening in the forest;
8.  discover evidence of human presence naturally;
9.  reach the cabin without following a giant floating arrow
    continuously;
10. become curious about Koudou and Chapter 2.

------------------------------------------------------------------------

# 26. Rules for Antigravity

When implementing this brief:

### DO

-   inspect existing implementation first;
-   preserve working features where possible;
-   make incremental changes;
-   create reusable systems;
-   keep configuration data separate from rendering logic;
-   test each milestone in browser;
-   compare before/after;
-   report changed files;
-   report architectural decisions;
-   report unresolved risks;
-   keep changes reversible and reviewable.

### DO NOT

-   rewrite the entire project without approval;
-   replace the current stack unnecessarily;
-   introduce large dependencies without justification;
-   procedurally randomize important level geometry;
-   scatter assets uniformly;
-   add excessive quest arrows to solve bad level design;
-   make every object cast dynamic shadows;
-   solve asset inconsistency by manually patching every scene instance;
-   build Chapter 2 before validating the Chapter 1 vertical slice;
-   turn French exercises into unrelated popup quizzes.

------------------------------------------------------------------------

# 27. Immediate task for Antigravity

Start with **analysis, not code**.

1.  Read this document.
2.  Inspect the entire relevant Koudou repository.
3.  Find the implementation of the current Chapter 1 scene.
4.  Map existing code to the systems described above.
5.  Identify:
    -   what can remain;
    -   what should be refactored;
    -   what is missing;
    -   technical risks.
6.  Produce a proposed implementation plan for **Phase 1 vertical slice
    only**.
7.  List exact files/components likely to change.
8.  Propose data structures/interfaces.
9.  Explain migration strategy from the current forest.
10. Wait for approval before performing a broad refactor.

The first implementation target is:

> **Arrival Clearing → Early Forest → Medicinal Grove**

Do not begin by rebuilding the whole game.

------------------------------------------------------------------------

# 28. Questions Antigravity should answer after repository audit

Return concrete answers to:

1.  How is the current forest generated?
2.  Are trees individually hard-coded, procedurally generated, or
    data-driven?
3.  How are GLTF/assets loaded and cached?
4.  How is collision currently implemented?
5.  How does the player controller work?
6.  What is the camera strategy?
7.  How are interactable objects detected?
8.  How are quests represented?
9.  How is French educational content represented?
10. How is Zustand currently divided?
11. What data is persisted?
12. Which current systems are reusable?
13. What systems create technical debt?
14. What is the safest migration path to `ForestZoneConfig`-style
    composition?
15. What is the estimated performance cost of the current vegetation
    approach?
16. Can repeated trees/vegetation use instancing without breaking
    interaction?
17. Which assets currently violate visual consistency most strongly?
18. What is the smallest code change that can demonstrate the new forest
    composition convincingly?

------------------------------------------------------------------------

# 29. Working principle

The goal is **not** to make Koudou larger.

The goal is to make a relatively small game world:

-   readable;
-   memorable;
-   narratively meaningful;
-   visually cohesive;
-   educationally integrated;
-   technically maintainable.

A small, carefully composed forest is better than a huge procedural
forest with no identity.

------------------------------------------------------------------------

## Final directive

Treat the current demo as a **functional prototype**.

Preserve its useful mechanics, but redesign the world around this
principle:

> **Every important place has a purpose, every important object has
> visual space, every French interaction has context, and every major
> action leaves a visible or narrative consequence.**

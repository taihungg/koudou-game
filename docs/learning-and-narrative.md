# Learning Mechanics & Narrative Design

This document details the pedagogical framework, French as a Foreign Language (**FLE**) learning loops, dialogue mechanics, and narrative structure in **KOUDOU**.

---

## 1. Pedagogical Philosophy (FLE A2–B2)

### 1. The Core Learning Problem
Language learners at the **A2–B1** level face the steepest attrition rate: they have mastered introductory basics, but standard gamified flashcards (e.g. Duolingo) become repetitive because they lack emotional stakes, immersion, and real-world utility.

Koudou solves this by making French **an indispensable instrument of exploration, survival, and social negotiation**, rather than an arbitrary quiz layer.

### 2. The Desired Pedagogical Loop
Instead of:
> *Walk to quest marker → screen freezes → answer arbitrary grammar question → resume walking.*

Koudou enforces:
> **Observe the world → Understand French clues → Act based on understanding → Receive tangible consequence/reward → Encounter and reuse the language in new contexts later.**

```
Step 1: Encounter plant in the forest
   │
   ▼
Step 2: Read Fiche d'Espèce (scientific & cultural context)
   │
   ▼
Step 3: Comprehension check (identifying key traits / medicinal uses)
   │
   ▼
Step 4: Collect plant into inventory (backpack resource)
   │
   ▼
Step 5: Recall at Campfire / Journal de Bord (spelling / usage)
   │
   ▼
Step 6: Dialogue with NPC in Chapter 2 (proving botanical knowledge to Kofi)
```

### 3. Non-Punitive Feedback Philosophy
Mistakes are treated as learning opportunities:
- **Incorrect answers** do not trigger a game over or block progression. Instead, they provide immediate contextual feedback, highlight why the distractor was inaccurate, and provide a hint for the player to retry.
- **Plausible Distractors**: Distractors are not cartoonish nonsense; they represent plausible alternatives distinguished by politeness register, grammatical agreement, or ecological function.

---

## 2. The Fiche d'Espèce Data Model

Learning content is defined in [`src/data/learningEntities.json`](file:///Users/tai_hungg/coding/koudou-game/src/data/learningEntities.json) and structured according to the specifications in [`card.md`](file:///Users/tai_hungg/coding/koudou-game/card.md).

### Entity Data Shape (`LearningEntityData`)
```ts
export interface LearningEntityData {
  id: string;               // e.g. "Flower_n_01", "Flower_n_02"
  modelPath: string;        // Path in public/models/
  cardType: string;         // "Plante", "Arbre", "Insecte", "Mammifère"
  frenchName: string;       // e.g. "Fleur de Trésor", "Liane du Roi"
  scientificName: string;   // e.g. "Gazania rigens", "Thunbergia erecta"
  type: string;             // Family / classification
  status: string;           // IUCN Conservation Status (e.g. "Préoccupation mineure (LC)")
  description: string;      // Natural French description (A2-B1 vocabulary)
  leftPanel: {
    Habitat?: string;       // Geographic & ecological habitat
    Usages?: string;        // Traditional medicinal, ornamental, or practical uses
    Détail?: string;        // Botanical details
  };
  rightPanel: {
    Danger?: string;        // Toxicity or harvesting rules
    Densité?: string;       // Rarity indicator (●●●○○)
    Tip?: string;           // Companion Feuille's mnemonic tip
  };
  exercise: {
    question: string;       // In-world contextual question
    options: string[];      // 4 multiple-choice answers
    correctAnswer: number;  // 0-indexed correct option
    feedbackSuccess: string;// Congratulatory text + vocabulary reminder
    feedbackFail: string;   // Helpful explanation guiding player to retry
  } | null;
}
```

### Pedagogical Features of the Card
1. **Feuille's Tip**: Alex is accompanied by **Feuille**, a small forest creature who provides memorable mnemonic hints (e.g. *"Cette fleur se ferme la nuit ! Si elle est ouverte, le soleil est là."*).
2. **IUCN Status Integration**: Introduces authentic conservation vocabulary (*"Préoccupation mineure"*, *"Vulnérable"*, *"En danger"*).
3. **Audio-Ready Content**: All French descriptions and quiz prompts are formatted to support text-to-speech (TTS) and audio pronunciation.

---

## 3. UN Sustainable Development Goals & Scoring System

Scoring in Koudou is tied directly to the United Nations Sustainable Development Goals:

```
┌─────────────────────────────────────────────────────────────┐
│                       KOUDOU SCOREBOARD                     │
├───────────────────┬───────────────────┬─────────────────────┤
│   🗣️ Langage XP   │ 🌿 Biodiversité   │ 🤝 Confiance       │
│      Niveau A2    │      ODD 15       │      ODD 16         │
└───────────────────┴───────────────────┴─────────────────────┘
```

1. **`xp_langage` (Language Proficiency)**:
   - Reflects the player's vocabulary and grammar mastery.
   - Correct answer: **+5 XP**.
   - Incorrect answer: **-5 XP** (or **-2 XP** in dialogue).
   - Once a quiz is completed, its ID is saved in `completedExercises` to prevent XP farming while keeping the species in the unlocked encyclopedia.
2. **`indice_biodiversite` (UN SDG 15: Life on Land)**:
   - Awarded for identifying flora/fauna, understanding plant ecological roles, and recognizing non-destructive harvesting practices.
   - Correct species card: **+5 Points**.
3. **`lien_confiance` (UN SDG 16: Peace, Justice & Institutions)**:
   - Awarded for diplomatic, respectful, and cooperative dialogue choices with local villagers and authorities.
   - Successful dialogue step: **+5 Points**.

---

## 4. In-World Dialogue System (`useDialogueStore.ts`)

Dialogue sequences test oral comprehension and pragmatic language skills (politeness, register, cultural context):

### Dialogue Structure
```ts
export interface DialogueStep {
  id: number;
  text: string;               // NPC line or setting context
  options: DialogueOption[];  // 4 speech choices for Alex
  hint?: string;              // Contextual hint on fail
}
```

### Concrete Example: The Meeting with Kofi (`kofiDialogue`)
When Alex first crosses paths with Kofi in the southern forest edge:

1. **Step 1: The Initial Encounter**:
   - *Kofi*: *"Hé ! Qui es-tu ? Qu'est-ce que tu fais ici dans notre forêt ?"*
   - *Alex*:
     - A) *"Je suis perdu. Je cherche mes amis."* ✅ (Natural, honest response)
     - B) *"Je suis médecin. Je viens soigner les animaux."* ✗
     - C) *"Je ne sais pas."* ✗
     - D) *"Cette forêt n'appartient pas qu'à vous."* ✗ (Aggressive/hostile)
2. **Step 2: Proving Intentions**:
   - *Alex*: *"Je suis étudiant en botanique..."*
   - *Kofi*: *"Un botaniste ? C'est quoi exactement ton travail ?"*
   - *Alex*:
     - A) *"Mon travail, c'est d'étudier les plantes — leurs noms, comment les protéger."* ✅
3. **Step 3: Applied Knowledge Verification**:
   - *Kofi*: *"Tu dis que tu connais les plantes… Alors, dis-moi : cette plante-là, tu sais ce que c'est ?"*
   - *Alex*:
     - C) *"C'est l'Alchornée cordifolia. Les feuilles peuvent être utilisées comme médicament naturel contre la fièvre."* ✅ (Reuses knowledge from the Fiche Espèce in Zone 2!)
4. **Step 4: Politeness Registers (Grammar in Action)**:
   - *Alex*:
     - A) *"Dites à votre chef de venir me voir immédiatement."* ✗ (Imperative, rude)
     - B) *"Est-ce que je pourrais rencontrer votre chef ?"* ✅ (Conditionnel de politesse)
     - *Hint*: *"Nous utilisons le conditionnel de politesse (« pourrait ») pour témoigner notre respect."*

---

## 5. Overarching Narrative Arc

### 1. Protagonist
- **Alex Nguyễn**: A young Vietnamese botany researcher interning with a Francophone international conservation mission in Central Africa. Separated from the expedition, Alex must navigate an unfamiliar tropical forest using field guides, botanical training, and French communication.

### 2. Chapter 1: The Strange Forest (*La Forêt étrange*)
- **The Mystery of Professor Dubois**: Alex's mentor, Professor Dubois, a renowned environmental researcher, has mysteriously vanished, leaving behind only an annotated field map.
- **Environmental Storytelling**:
  - The northern zones (Arrival, Early Forest, Grove) are vibrant and biodiverse.
  - As Alex crosses the river heading south, signs of human degradation emerge: cut tree trunks, metal traps, discarded barrels, and fresh axe marks.
- **The Koudou Legend**:
  - Alex discovers ancient carved symbols and totems depicting **Koudou**, the forest's sacred antelope/spirit (*Céphalophe d'Ogilby*).
  - The totem animal has not been seen for years, coinciding with encroaching deforestation.

### 3. Chapter 2: The Village of Koudou (*Le Village de Koudou*)
- Reaching the village, Alex discovers that the community is struggling: soil erosion, timber over-harvesting, and resource depletion.
- Alex works with the village chief and residents to introduce agroforestry, replant medicinal flora, and resolve local disputes through cooperative policies.
- As the ecosystem heals, tangible environmental transformations take place in the 3D scene, culminating in the reappearance of the legendary Koudou.

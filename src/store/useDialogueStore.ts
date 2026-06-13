import { create } from 'zustand';

export interface DialogueOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface DialogueStep {
  id: number;
  text: string;
  options: DialogueOption[];
  hint?: string;
}

export const kofiDialogue: DialogueStep[] = [
  {
    id: 1,
    text: "Kofi : Hé ! Qui es-tu? Qu'est-ce que tu fais ici dans notre forêt?",
    options: [
      { id: "A", text: "Je suis perdu. Je cherche mes amis.", isCorrect: true },
      { id: "B", text: "Je suis médecin. Je viens soigner les animaux de la forêt.", isCorrect: false },
      { id: "C", text: "Je ne sais pas.", isCorrect: false },
      { id: "D", text: "Cette forêt n'appartient pas qu'à vous.", isCorrect: false }
    ],
    hint: "Réfléchissez à ce qu'Alex a vécu récemment."
  },
  {
    id: 2,
    text: "Alex : Je m'appelle Alex. Je suis étudiant en botanique, je faisais des recherches avec mon groupe quand je me suis perdu. Et vous, vous êtes qui?\n\nKofi : Un botaniste ? C'est quoi exactement ton travail?",
    options: [
      { id: "A", text: "Mon travail, c'est d'étudier les plantes - leurs noms, comment les protéger.", isCorrect: true },
      { id: "B", text: "Je travaille pour une grande entreprise qui veut acheter cette forêt.", isCorrect: false },
      { id: "C", text: "Je ne peux pas expliquer, c'est trop compliqué pour vous.", isCorrect: false },
      { id: "D", text: "Je prends des photos et c'est tout.", isCorrect: false }
    ],
    hint: "Un botaniste étudie les plantes."
  },
  {
    id: 3,
    text: "Kofi : Tu dis que tu connais les plantes… Alors, dis-moi : cette plante-là, tu sais ce que c'est ?",
    options: [
      { id: "A", text: "Je ne suis pas sûr, mais je pense que c'est bon à manger.", isCorrect: false },
      { id: "B", text: "C'est une plante que je ne connais pas encore.", isCorrect: false },
      { id: "C", text: "C'est l'Alchornée cordifolia. Les feuilles peuvent être utilisées comme médicament naturel contre la fièvre.", isCorrect: true },
      { id: "D", text: "C'est une très belle plante. J'aime beaucoup sa couleur.", isCorrect: false }
    ],
    hint: "Utilisez les connaissances que vous avez apprises dans la Fiche Espèce."
  },
  {
    id: 4,
    text: "Alex : Je voudrais parler à votre chef, si c'est possible. J'ai des informations importantes sur cette forêt.",
    options: [
      { id: "A", text: "Dites à votre chef de venir me voir immédiatement.", isCorrect: false },
      { id: "B", text: "Est-ce que je pourrais rencontrer votre chef ?", isCorrect: true },
      { id: "C", text: "Votre chef doit savoir ce que vous faites ici, c'est dangereux.", isCorrect: false },
      { id: "D", text: "Je veux voir le chef. Maintenant. S'il vous plaît.", isCorrect: false }
    ],
    hint: "Nous utilisons le conditionnel de politesse (« pourrait ») pour témoigner notre respect."
  }
];

interface DialogueState {
  isOpen: boolean;
  currentSequence: DialogueStep[] | null;
  currentStepIndex: number;
  nearbyNPCId: string | null;
  
  openDialogue: (sequence: DialogueStep[]) => void;
  closeDialogue: () => void;
  nextStep: () => void;
  setNearbyNPCId: (id: string | null) => void;
}

export const useDialogueStore = create<DialogueState>((set) => ({
  isOpen: false,
  currentSequence: null,
  currentStepIndex: 0,
  nearbyNPCId: null,

  openDialogue: (sequence) => set({ 
    isOpen: true, 
    currentSequence: sequence,
    currentStepIndex: 0 
  }),
  
  closeDialogue: () => set({ 
    isOpen: false, 
    currentSequence: null,
    currentStepIndex: 0 
  }),
  
  nextStep: () => set((state) => ({
    currentStepIndex: state.currentStepIndex + 1
  })),

  setNearbyNPCId: (id) => set({ nearbyNPCId: id }),
}));

import { create } from 'zustand';

export interface LearningEntityData {
  id: string;
  modelPath: string;
  cardType: string;
  frenchName: string;
  scientificName: string;
  type: string;
  status: string;
  description: string;
  leftPanel: Record<string, string>;
  rightPanel: Record<string, string>;
  exercise: {
    question: string;
    options: string[];
    correctAnswer: number;
    feedbackSuccess: string;
    feedbackFail: string;
  } | null;
  category?: string;
  sensorRadius?: number;
}

interface LearningState {
  activeEntity: LearningEntityData | null;
  setActiveEntity: (entity: LearningEntityData | null) => void;
  nearbyEntity: LearningEntityData | null;
  setNearbyEntity: (entity: LearningEntityData | null) => void;
  completedExercises: string[]; // store IDs of completed exercises so we don't grant XP multiple times
  markExerciseCompleted: (id: string) => void;
}

export const useLearningStore = create<LearningState>((set) => ({
  activeEntity: null,
  setActiveEntity: (entity) => set({ activeEntity: entity }),
  nearbyEntity: null,
  setNearbyEntity: (entity) => set({ nearbyEntity: entity }),
  completedExercises: [],
  markExerciseCompleted: (id) => set((state) => ({ 
    completedExercises: [...state.completedExercises, id] 
  })),
}));

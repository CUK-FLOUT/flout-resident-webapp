import { create } from 'zustand';

interface GuideProgressState {
  completed: Record<string, string[]>;
  resolved: Record<string, boolean>;
  setChecked: (assessmentId: string, itemId: string, checked: boolean) => void;
  setResolved: (assessmentId: string, resolved: boolean) => void;
}

export const useGuideProgress = create<GuideProgressState>()((set) => ({
  completed: {},
  resolved: {},
  setChecked: (assessmentId, itemId, checked) =>
    set((state) => {
      const current = state.completed[assessmentId] ?? [];
      return {
        completed: {
          ...state.completed,
          [assessmentId]: checked
            ? [...new Set([...current, itemId])]
            : current.filter((id) => id !== itemId),
        },
      };
    }),
  setResolved: (assessmentId, resolved) =>
    set((state) => ({
      resolved: { ...state.resolved, [assessmentId]: resolved },
    })),
}));

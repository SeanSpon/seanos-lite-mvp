import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal, Milestone } from '@/types';
import { generateId } from '@/lib/utils';

interface GoalState {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'milestones'>) => void;
  deleteGoal: (id: string) => void;
  addMilestone: (goalId: string, title: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  getProgress: (goalId: string) => number;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      addGoal: (goal) =>
        set((s) => ({
          goals: [
            { ...goal, id: generateId(), milestones: [], createdAt: Date.now() },
            ...s.goals,
          ],
        })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      addMilestone: (goalId, title) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  milestones: [
                    ...g.milestones,
                    { id: generateId(), title, completed: false } as Milestone,
                  ],
                }
              : g
          ),
        })),
      toggleMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  milestones: g.milestones.map((m) =>
                    m.id === milestoneId
                      ? { ...m, completed: !m.completed, completedAt: !m.completed ? Date.now() : undefined }
                      : m
                  ),
                }
              : g
          ),
        })),
      deleteMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? { ...g, milestones: g.milestones.filter((m) => m.id !== milestoneId) }
              : g
          ),
        })),
      getProgress: (goalId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal || goal.milestones.length === 0) return 0;
        return Math.round((goal.milestones.filter((m) => m.completed).length / goal.milestones.length) * 100);
      },
    }),
    { name: 'seanos-goals' }
  )
);

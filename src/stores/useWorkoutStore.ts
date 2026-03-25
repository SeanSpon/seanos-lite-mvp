import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkoutPlan, WorkoutLog } from '@/types';
import { generateId } from '@/lib/utils';

interface WorkoutState {
  plans: WorkoutPlan[];
  logs: WorkoutLog[];
  addPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => void;
  updatePlan: (id: string, updates: Partial<WorkoutPlan>) => void;
  deletePlan: (id: string) => void;
  addLog: (log: Omit<WorkoutLog, 'id' | 'createdAt'>) => void;
  deleteLog: (id: string) => void;
  getTodayPlan: () => WorkoutPlan | undefined;
  getLogsForDate: (date: string) => WorkoutLog[];
  getRecentLogs: (count: number) => WorkoutLog[];
  getWeekWorkoutCount: () => number;
  getAvgStruggle: (days: number) => number;
  getStrengthProgress: () => { exercise: string; latest: number; previous: number }[];
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      plans: [],
      logs: [],
      addPlan: (plan) =>
        set((s) => ({
          plans: [...s.plans, { ...plan, id: generateId(), createdAt: Date.now() }],
        })),
      updatePlan: (id, updates) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deletePlan: (id) =>
        set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),
      addLog: (log) =>
        set((s) => ({
          logs: [{ ...log, id: generateId(), createdAt: Date.now() }, ...s.logs],
        })),
      deleteLog: (id) =>
        set((s) => ({ logs: s.logs.filter((l) => l.id !== id) })),
      getTodayPlan: () => {
        const dayOfWeek = new Date().getDay();
        return get().plans.find((p) => p.days.includes(dayOfWeek));
      },
      getLogsForDate: (date) => get().logs.filter((l) => l.date === date),
      getRecentLogs: (count) => get().logs.slice(0, count),
      getWeekWorkoutCount: () => {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        return get().logs.filter((l) => l.date >= weekAgoStr).length;
      },
      getAvgStruggle: (days) => {
        const today = new Date();
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        const recent = get().logs.filter((l) => l.date >= cutoffStr);
        if (recent.length === 0) return 0;
        return recent.reduce((sum, l) => sum + l.struggleRating, 0) / recent.length;
      },
      getStrengthProgress: () => {
        const logs = get().logs;
        const exerciseMap = new Map<string, { latest: number; previous: number }>();
        for (const log of logs) {
          for (const ex of log.exercises) {
            const maxWeight = Math.max(...ex.sets.map((s) => s.weight || 0), 0);
            if (maxWeight > 0) {
              const existing = exerciseMap.get(ex.name);
              if (!existing) {
                exerciseMap.set(ex.name, { latest: maxWeight, previous: maxWeight });
              } else {
                exerciseMap.set(ex.name, { latest: existing.latest, previous: maxWeight });
              }
            }
          }
        }
        return Array.from(exerciseMap.entries()).map(([exercise, data]) => ({
          exercise,
          ...data,
        }));
      },
    }),
    { name: 'seanos-workouts' }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HealthEntry, Workout } from '@/types';
import { generateId, todayStr } from '@/lib/utils';

interface HealthState {
  entries: HealthEntry[];
  getToday: () => HealthEntry;
  updateToday: (updates: Partial<HealthEntry>) => void;
  addWater: () => void;
  removeWater: () => void;
  addCalories: (amount: number) => void;
  addProtein: (amount: number) => void;
  setSteps: (steps: number) => void;
  setSleep: (hours: number) => void;
  setWeight: (weight: number) => void;
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt'>) => void;
  deleteWorkout: (entryId: string, workoutId: string) => void;
}

function ensureToday(entries: HealthEntry[]): HealthEntry[] {
  const today = todayStr();
  const exists = entries.find((e) => e.date === today);
  if (exists) return entries;
  return [
    {
      id: generateId(),
      date: today,
      waterGlasses: 0,
      calories: 0,
      protein: 0,
      steps: 0,
      workouts: [],
    },
    ...entries,
  ];
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      entries: [],
      getToday: () => {
        const today = todayStr();
        const entries = ensureToday(get().entries);
        return entries.find((e) => e.date === today)!;
      },
      updateToday: (updates) =>
        set((s) => {
          const entries = ensureToday(s.entries);
          const today = todayStr();
          return {
            entries: entries.map((e) =>
              e.date === today ? { ...e, ...updates } : e
            ),
          };
        }),
      addWater: () =>
        set((s) => {
          const entries = ensureToday(s.entries);
          const today = todayStr();
          return {
            entries: entries.map((e) =>
              e.date === today ? { ...e, waterGlasses: e.waterGlasses + 1 } : e
            ),
          };
        }),
      removeWater: () =>
        set((s) => {
          const entries = ensureToday(s.entries);
          const today = todayStr();
          return {
            entries: entries.map((e) =>
              e.date === today
                ? { ...e, waterGlasses: Math.max(0, e.waterGlasses - 1) }
                : e
            ),
          };
        }),
      addCalories: (amount) =>
        set((s) => {
          const entries = ensureToday(s.entries);
          const today = todayStr();
          return {
            entries: entries.map((e) =>
              e.date === today ? { ...e, calories: (e.calories || 0) + amount } : e
            ),
          };
        }),
      addProtein: (amount) =>
        set((s) => {
          const entries = ensureToday(s.entries);
          const today = todayStr();
          return {
            entries: entries.map((e) =>
              e.date === today ? { ...e, protein: (e.protein || 0) + amount } : e
            ),
          };
        }),
      setSteps: (steps) =>
        set((s) => {
          const entries = ensureToday(s.entries);
          const today = todayStr();
          return {
            entries: entries.map((e) =>
              e.date === today ? { ...e, steps } : e
            ),
          };
        }),
      setSleep: (hours) =>
        set((s) => {
          const entries = ensureToday(s.entries);
          const today = todayStr();
          return {
            entries: entries.map((e) =>
              e.date === today ? { ...e, sleepHours: hours } : e
            ),
          };
        }),
      setWeight: (weight) =>
        set((s) => {
          const entries = ensureToday(s.entries);
          const today = todayStr();
          return {
            entries: entries.map((e) =>
              e.date === today ? { ...e, weight } : e
            ),
          };
        }),
      addWorkout: (workout) =>
        set((s) => {
          const entries = ensureToday(s.entries);
          const today = todayStr();
          return {
            entries: entries.map((e) =>
              e.date === today
                ? {
                    ...e,
                    workouts: [
                      ...e.workouts,
                      { ...workout, id: generateId(), createdAt: Date.now() },
                    ],
                  }
                : e
            ),
          };
        }),
      deleteWorkout: (entryId, workoutId) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === entryId
              ? { ...e, workouts: e.workouts.filter((w) => w.id !== workoutId) }
              : e
          ),
        })),
    }),
    { name: 'seanos-health' }
  )
);

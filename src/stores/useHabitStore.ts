import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Habit, HabitLog } from '@/types';
import { generateId, todayStr } from '@/lib/utils';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (habitId: string, date?: string) => void;
  isCompleted: (habitId: string, date?: string) => boolean;
  getStreak: (habitId: string) => number;
  getTodayProgress: () => { completed: number; total: number };
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [
        { id: 'piano', name: 'Piano Practice', icon: 'Music', color: '#8b5cf6', frequency: 'daily', createdAt: Date.now() },
        { id: 'gym', name: 'Gym', icon: 'Dumbbell', color: '#ef4444', frequency: 'daily', createdAt: Date.now() },
        { id: 'water', name: 'Drink Water', icon: 'Droplets', color: '#3b82f6', frequency: 'daily', createdAt: Date.now() },
        { id: 'code', name: 'Code', icon: 'Code2', color: '#22c55e', frequency: 'daily', createdAt: Date.now() },
      ],
      logs: [],
      addHabit: (habit) =>
        set((s) => ({
          habits: [...s.habits, { ...habit, id: generateId(), createdAt: Date.now() }],
        })),
      deleteHabit: (id) =>
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
          logs: s.logs.filter((l) => l.habitId !== id),
        })),
      toggleHabit: (habitId, date) => {
        const d = date || todayStr();
        set((s) => {
          const existing = s.logs.find((l) => l.habitId === habitId && l.date === d);
          if (existing) {
            return {
              logs: s.logs.map((l) =>
                l.habitId === habitId && l.date === d
                  ? { ...l, completed: !l.completed }
                  : l
              ),
            };
          }
          return {
            logs: [...s.logs, { habitId, date: d, completed: true }],
          };
        });
      },
      isCompleted: (habitId, date) => {
        const d = date || todayStr();
        return get().logs.some((l) => l.habitId === habitId && l.date === d && l.completed);
      },
      getStreak: (habitId) => {
        const logs = get().logs.filter((l) => l.habitId === habitId && l.completed);
        const dates = logs.map((l) => l.date).sort().reverse();
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          if (dates.includes(dateStr)) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }
        return streak;
      },
      getTodayProgress: () => {
        const { habits, logs } = get();
        const today = todayStr();
        const completed = logs.filter((l) => l.date === today && l.completed).length;
        return { completed, total: habits.length };
      },
    }),
    { name: 'seanos-habits' }
  )
);

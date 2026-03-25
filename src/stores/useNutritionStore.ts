import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FoodLog, FoodItem } from '@/types';
import { generateId } from '@/lib/utils';

interface NutritionState {
  logs: FoodLog[];
  customFoods: FoodItem[];
  recentFoodIds: string[];
  addLog: (log: Omit<FoodLog, 'id' | 'createdAt'>) => void;
  deleteLog: (id: string) => void;
  addCustomFood: (food: Omit<FoodItem, 'id'>) => void;
  deleteCustomFood: (id: string) => void;
  getLogsForDate: (date: string) => FoodLog[];
  getDayTotals: (date: string) => { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  getMealLogs: (date: string, meal: FoodLog['meal']) => FoodLog[];
  getWeekTotals: () => { date: string; calories: number; protein: number }[];
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      logs: [],
      customFoods: [],
      recentFoodIds: [],
      addLog: (log) =>
        set((s) => {
          const newRecentIds = [log.foodId || log.name, ...s.recentFoodIds.filter((id) => id !== (log.foodId || log.name))].slice(0, 20);
          return {
            logs: [{ ...log, id: generateId(), createdAt: Date.now() }, ...s.logs],
            recentFoodIds: newRecentIds,
          };
        }),
      deleteLog: (id) =>
        set((s) => ({ logs: s.logs.filter((l) => l.id !== id) })),
      addCustomFood: (food) =>
        set((s) => ({
          customFoods: [...s.customFoods, { ...food, id: `custom-${generateId()}` }],
        })),
      deleteCustomFood: (id) =>
        set((s) => ({ customFoods: s.customFoods.filter((f) => f.id !== id) })),
      getLogsForDate: (date) => get().logs.filter((l) => l.date === date),
      getDayTotals: (date) => {
        const logs = get().logs.filter((l) => l.date === date);
        return logs.reduce(
          (acc, l) => ({
            calories: acc.calories + l.calories * l.servings,
            protein: acc.protein + l.protein * l.servings,
            carbs: acc.carbs + l.carbs * l.servings,
            fat: acc.fat + l.fat * l.servings,
            fiber: acc.fiber + l.fiber * l.servings,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
        );
      },
      getMealLogs: (date, meal) => get().logs.filter((l) => l.date === date && l.meal === meal),
      getWeekTotals: () => {
        const result: { date: string; calories: number; protein: number }[] = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const totals = get().getDayTotals(dateStr);
          result.push({ date: dateStr, calories: totals.calories, protein: totals.protein });
        }
        return result;
      },
    }),
    { name: 'seanos-nutrition' }
  )
);

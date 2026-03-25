import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '@/types';

interface SettingsState extends AppSettings {
  update: (settings: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      userName: 'Sean',
      calorieGoal: 3000,
      proteinGoal: 160,
      carbGoal: 350,
      fatGoal: 80,
      fiberGoal: 30,
      waterGoal: 8,
      stepsGoal: 10000,
      theme: 'dark',
      accentColor: '#6366f1',
      update: (settings) => set(settings),
    }),
    { name: 'seanos-settings' }
  )
);

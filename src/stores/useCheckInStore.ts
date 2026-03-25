import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyCheckIn } from '@/types';
import { generateId, todayStr } from '@/lib/utils';

interface CheckInState {
  checkIns: DailyCheckIn[];
  addCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'createdAt'>) => void;
  updateCheckIn: (id: string, updates: Partial<DailyCheckIn>) => void;
  getTodayCheckIn: () => DailyCheckIn | undefined;
  getCheckInForDate: (date: string) => DailyCheckIn | undefined;
  getRecentCheckIns: (count: number) => DailyCheckIn[];
  getAvgMood: (days: number) => number;
  getAvgEnergy: (days: number) => number;
  getMoodTrend: () => { date: string; mood: number; energy: number }[];
}

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      checkIns: [],
      addCheckIn: (checkIn) =>
        set((s) => {
          const existing = s.checkIns.find((c) => c.date === checkIn.date);
          if (existing) {
            return {
              checkIns: s.checkIns.map((c) =>
                c.date === checkIn.date ? { ...c, ...checkIn } : c
              ),
            };
          }
          return {
            checkIns: [{ ...checkIn, id: generateId(), createdAt: Date.now() }, ...s.checkIns],
          };
        }),
      updateCheckIn: (id, updates) =>
        set((s) => ({
          checkIns: s.checkIns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      getTodayCheckIn: () => get().checkIns.find((c) => c.date === todayStr()),
      getCheckInForDate: (date) => get().checkIns.find((c) => c.date === date),
      getRecentCheckIns: (count) => get().checkIns.slice(0, count),
      getAvgMood: (days) => {
        const today = new Date();
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        const recent = get().checkIns.filter((c) => c.date >= cutoffStr);
        if (recent.length === 0) return 0;
        return recent.reduce((sum, c) => sum + c.mood, 0) / recent.length;
      },
      getAvgEnergy: (days) => {
        const today = new Date();
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        const recent = get().checkIns.filter((c) => c.date >= cutoffStr);
        if (recent.length === 0) return 0;
        return recent.reduce((sum, c) => sum + c.energy, 0) / recent.length;
      },
      getMoodTrend: () => {
        const result: { date: string; mood: number; energy: number }[] = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const checkIn = get().checkIns.find((c) => c.date === dateStr);
          if (checkIn) {
            result.push({ date: dateStr, mood: checkIn.mood, energy: checkIn.energy });
          }
        }
        return result;
      },
    }),
    { name: 'seanos-checkins' }
  )
);

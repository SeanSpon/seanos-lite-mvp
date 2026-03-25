import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PracticeLog } from '@/types';
import { generateId } from '@/lib/utils';

interface PracticeState {
  logs: PracticeLog[];
  skills: string[];
  addLog: (log: Omit<PracticeLog, 'id' | 'createdAt'>) => void;
  deleteLog: (id: string) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  getLogsForDate: (date: string) => PracticeLog[];
  getLogsForSkill: (skill: string) => PracticeLog[];
  getTotalMinutes: (skill: string) => number;
  getWeekMinutes: (skill: string) => number;
  getStreak: (skill: string) => number;
  getAvgRating: (skill: string, days: number) => number;
  getRecentLogs: (count: number) => PracticeLog[];
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      logs: [],
      skills: ['Piano', 'Guitar', 'Coding', 'Reading'],
      addLog: (log) =>
        set((s) => ({
          logs: [{ ...log, id: generateId(), createdAt: Date.now() }, ...s.logs],
        })),
      deleteLog: (id) =>
        set((s) => ({ logs: s.logs.filter((l) => l.id !== id) })),
      addSkill: (skill) =>
        set((s) => ({
          skills: s.skills.includes(skill) ? s.skills : [...s.skills, skill],
        })),
      removeSkill: (skill) =>
        set((s) => ({
          skills: s.skills.filter((sk) => sk !== skill),
          logs: s.logs.filter((l) => l.skill !== skill),
        })),
      getLogsForDate: (date) => get().logs.filter((l) => l.date === date),
      getLogsForSkill: (skill) => get().logs.filter((l) => l.skill === skill),
      getTotalMinutes: (skill) =>
        get().logs.filter((l) => l.skill === skill).reduce((sum, l) => sum + l.duration, 0),
      getWeekMinutes: (skill) => {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        return get().logs
          .filter((l) => l.skill === skill && l.date >= weekAgoStr)
          .reduce((sum, l) => sum + l.duration, 0);
      },
      getStreak: (skill) => {
        const logs = get().logs.filter((l) => l.skill === skill);
        const dates = [...new Set(logs.map((l) => l.date))].sort().reverse();
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
      getAvgRating: (skill, days) => {
        const today = new Date();
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        const recent = get().logs.filter((l) => l.skill === skill && l.date >= cutoffStr);
        if (recent.length === 0) return 0;
        return recent.reduce((sum, l) => sum + l.rating, 0) / recent.length;
      },
      getRecentLogs: (count) => get().logs.slice(0, count),
    }),
    { name: 'seanos-practice' }
  )
);

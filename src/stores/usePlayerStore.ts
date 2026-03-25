import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerStats, Achievement } from '@/types';

const XP_PER_LEVEL = 500;

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-log', name: 'First Log', description: 'Log your first meal', icon: '🍽️' },
  { id: 'week-streak', name: 'Week Warrior', description: '7-day streak', icon: '🔥' },
  { id: 'month-streak', name: 'Monthly Beast', description: '30-day streak', icon: '💪' },
  { id: 'first-workout', name: 'Iron Starter', description: 'Complete your first workout', icon: '🏋️' },
  { id: 'ten-workouts', name: 'Gym Regular', description: 'Complete 10 workouts', icon: '⚡' },
  { id: 'fifty-workouts', name: 'Fitness Machine', description: 'Complete 50 workouts', icon: '🤖' },
  { id: 'piano-10hr', name: 'Piano Apprentice', description: '10 hours of piano practice', icon: '🎹' },
  { id: 'perfect-day', name: 'Perfect Day', description: 'Hit all daily goals in one day', icon: '⭐' },
  { id: 'level-5', name: 'Rising Star', description: 'Reach Level 5', icon: '🌟' },
  { id: 'level-10', name: 'Dedicated', description: 'Reach Level 10', icon: '🏆' },
  { id: 'level-25', name: 'Legend', description: 'Reach Level 25', icon: '👑' },
  { id: 'body-score-80', name: 'Peak Performance', description: 'Body score above 80', icon: '💎' },
];

interface PlayerState {
  stats: PlayerStats;
  achievements: Achievement[];
  addXp: (amount: number, source?: string) => void;
  updateBodyScore: (score: number) => void;
  updateStat: (stat: keyof PlayerStats['stats'], value: number) => void;
  updateStreak: (days: number) => void;
  unlockAchievement: (id: string) => void;
  isUnlocked: (id: string) => boolean;
  getXpToNextLevel: () => number;
  getXpProgress: () => number;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      stats: {
        level: 1,
        xp: 0,
        totalXp: 0,
        bodyScore: 50,
        streakDays: 0,
        longestStreak: 0,
        stats: {
          strength: 10,
          endurance: 10,
          discipline: 10,
          nutrition: 10,
          recovery: 10,
          mind: 10,
        },
      },
      achievements: DEFAULT_ACHIEVEMENTS,
      addXp: (amount) =>
        set((s) => {
          let newXp = s.stats.xp + amount;
          let newLevel = s.stats.level;
          const newTotalXp = s.stats.totalXp + amount;
          while (newXp >= XP_PER_LEVEL * newLevel) {
            newXp -= XP_PER_LEVEL * newLevel;
            newLevel++;
          }
          return {
            stats: { ...s.stats, xp: newXp, level: newLevel, totalXp: newTotalXp },
          };
        }),
      updateBodyScore: (score) =>
        set((s) => ({
          stats: { ...s.stats, bodyScore: Math.min(100, Math.max(0, Math.round(score))) },
        })),
      updateStat: (stat, value) =>
        set((s) => ({
          stats: {
            ...s.stats,
            stats: { ...s.stats.stats, [stat]: Math.min(100, Math.max(0, Math.round(value))) },
          },
        })),
      updateStreak: (days) =>
        set((s) => ({
          stats: {
            ...s.stats,
            streakDays: days,
            longestStreak: Math.max(s.stats.longestStreak, days),
          },
        })),
      unlockAchievement: (id) =>
        set((s) => ({
          achievements: s.achievements.map((a) =>
            a.id === id && !a.unlockedAt ? { ...a, unlockedAt: Date.now() } : a
          ),
        })),
      isUnlocked: (id) => {
        const a = get().achievements.find((a) => a.id === id);
        return !!a?.unlockedAt;
      },
      getXpToNextLevel: () => {
        const { level } = get().stats;
        return XP_PER_LEVEL * level;
      },
      getXpProgress: () => {
        const { xp, level } = get().stats;
        return xp / (XP_PER_LEVEL * level);
      },
    }),
    { name: 'seanos-player' }
  )
);

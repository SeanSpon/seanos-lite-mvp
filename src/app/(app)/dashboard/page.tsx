'use client';
import { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useNutritionStore } from '@/stores/useNutritionStore';
import { useHealthStore } from '@/stores/useHealthStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useCheckInStore } from '@/stores/useCheckInStore';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { TopBar } from '@/components/layout/TopBar';
import { getGreeting, todayStr, formatDate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Flame, Droplets, Footprints, Dumbbell, Zap, ChevronRight,
  Music, BookOpen, Timer, Calendar, CheckSquare,
  TrendingUp, UtensilsCrossed, Brain, Shield, Heart, Swords,
  Wind, Trophy,
} from 'lucide-react';
import Link from 'next/link';

const MOOD_EMOJIS = ['😫', '😔', '😐', '😊', '🔥'];
const ENERGY_COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'];

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

export default function DashboardPage() {
  const hydrated = useHydration();
  const userName = useSettingsStore((s) => s.userName);
  const calorieGoal = useSettingsStore((s) => s.calorieGoal);
  const proteinGoal = useSettingsStore((s) => s.proteinGoal);
  const playerStats = usePlayerStore((s) => s.stats);
  const achievements = usePlayerStore((s) => s.achievements);
  const getXpToNextLevel = usePlayerStore((s) => s.getXpToNextLevel);
  const getXpProgress = usePlayerStore((s) => s.getXpProgress);
  const getDayTotals = useNutritionStore((s) => s.getDayTotals);
  const getToday = useHealthStore((s) => s.getToday);
  const habitProgress = useHabitStore((s) => s.getTodayProgress);
  const getTodayCheckIn = useCheckInStore((s) => s.getTodayCheckIn);
  const addCheckIn = useCheckInStore((s) => s.addCheckIn);
  const weekWorkouts = useWorkoutStore((s) => s.getWeekWorkoutCount);

  const [checkInMood, setCheckInMood] = useState<number | null>(null);
  const [checkInEnergy, setCheckInEnergy] = useState<number | null>(null);

  if (!hydrated) return <div className="min-h-screen bg-[#0a0a0f]" />;

  const today = todayStr();
  const nutrition = getDayTotals(today);
  const health = getToday();
  const habits = habitProgress();
  const todayCheckIn = getTodayCheckIn();
  const xpProgress = getXpProgress();
  const xpNeeded = getXpToNextLevel();
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt).sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0));

  const bodyScoreColor = playerStats.bodyScore >= 80 ? '#10b981' : playerStats.bodyScore >= 60 ? '#22c55e' : playerStats.bodyScore >= 40 ? '#f59e0b' : '#ef4444';

  const statConfig = [
    { key: 'strength' as const, label: 'STR', color: '#ef4444', icon: Swords },
    { key: 'endurance' as const, label: 'END', color: '#f59e0b', icon: Wind },
    { key: 'discipline' as const, label: 'DSC', color: '#8b5cf6', icon: Shield },
    { key: 'nutrition' as const, label: 'NUT', color: '#22c55e', icon: Heart },
    { key: 'recovery' as const, label: 'REC', color: '#3b82f6', icon: Zap },
    { key: 'mind' as const, label: 'MND', color: '#06b6d4', icon: Brain },
  ];

  const handleQuickCheckIn = () => {
    if (checkInMood && checkInEnergy) {
      addCheckIn({
        date: today,
        mood: checkInMood as 1 | 2 | 3 | 4 | 5,
        energy: checkInEnergy as 1 | 2 | 3 | 4 | 5,
        stress: 3,
        sleepQuality: 3,
      });
    }
  };

  return (
    <div>
      <TopBar
        title={`${getGreeting()}, ${userName}`}
        subtitle={formatDate(new Date())}
      />

      <div className="px-4 space-y-4 mt-2">
        {/* RPG Header Card */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0}>
          <GlassCard glow className="relative overflow-hidden">
            <div className="flex items-center gap-4 mb-3">
              {/* Level Badge */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <span className="text-xl font-black text-indigo-300">{playerStats.level}</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-indigo-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white">
                  LVL
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-300">Level {playerStats.level}</span>
                  <span className="text-xs text-slate-500">{playerStats.xp}/{xpNeeded} XP</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <div className="text-2xl font-black" style={{ color: bodyScoreColor }}>{playerStats.bodyScore}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">Body Score</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-full">
                <Flame size={14} className="text-orange-400" />
                <span className="text-sm font-bold text-orange-300">{playerStats.streakDays}</span>
                <span className="text-[10px] text-orange-400/60">day streak</span>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-300">{weekWorkouts()}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">Workouts/wk</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick Check-in */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={1}>
          {!todayCheckIn ? (
            <GlassCard>
              <p className="text-xs text-slate-400 mb-2">How are you feeling?</p>
              <div className="flex justify-between mb-3">
                {MOOD_EMOJIS.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => setCheckInMood(i + 1)}
                    className={cn(
                      'w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all',
                      checkInMood === i + 1
                        ? 'bg-indigo-500/30 scale-110 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                        : 'bg-white/[0.04] hover:bg-white/[0.08]'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mb-2">Energy level</p>
              <div className="flex justify-between mb-3">
                {ENERGY_COLORS.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setCheckInEnergy(i + 1)}
                    className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center transition-all text-sm font-bold',
                      checkInEnergy === i + 1
                        ? 'scale-110 shadow-lg'
                        : 'opacity-50 hover:opacity-80'
                    )}
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              {checkInMood && checkInEnergy && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleQuickCheckIn}
                  className="w-full py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium"
                >
                  Check In
                </motion.button>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{MOOD_EMOJIS[(todayCheckIn.mood || 3) - 1]}</span>
                <div>
                  <p className="text-sm font-medium">Checked in</p>
                  <p className="text-xs text-slate-400">Energy: {todayCheckIn.energy}/5</p>
                </div>
              </div>
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">✓</span>
            </GlassCard>
          )}
        </motion.div>

        {/* Today's Stats */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={2}>
          <div className="grid grid-cols-2 gap-3">
            <GlassCard className="flex items-center gap-3">
              <ProgressRing value={nutrition.calories} max={calorieGoal} size={52} color="#f59e0b">
                <Flame size={18} className="text-amber-400" />
              </ProgressRing>
              <div>
                <p className="text-xs text-slate-400">Calories</p>
                <p className="text-lg font-bold">{Math.round(nutrition.calories)}</p>
                <p className="text-[10px] text-slate-500">/ {calorieGoal}</p>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center gap-3">
              <ProgressRing value={nutrition.protein} max={proteinGoal} size={52} color="#ef4444">
                <Dumbbell size={18} className="text-red-400" />
              </ProgressRing>
              <div>
                <p className="text-xs text-slate-400">Protein</p>
                <p className="text-lg font-bold">{Math.round(nutrition.protein)}g</p>
                <p className="text-[10px] text-slate-500">/ {proteinGoal}g</p>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center gap-3">
              <div className="w-[52px] h-[52px] rounded-full bg-blue-500/10 flex items-center justify-center">
                <Droplets size={22} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Water</p>
                <p className="text-lg font-bold">{health.waterGlasses}</p>
                <p className="text-[10px] text-slate-500">glasses</p>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center gap-3">
              <div className="w-[52px] h-[52px] rounded-full bg-green-500/10 flex items-center justify-center">
                <Footprints size={22} className="text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Steps</p>
                <p className="text-lg font-bold">{(health.steps || 0).toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">today</p>
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {/* RPG Stat Bars */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={3}>
          <GlassCard>
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Character Stats</h2>
            <div className="space-y-2.5">
              {statConfig.map((stat) => (
                <div key={stat.key} className="flex items-center gap-2">
                  <stat.icon size={14} style={{ color: stat.color }} />
                  <span className="text-[10px] font-mono text-slate-400 w-7">{stat.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: stat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${playerStats.stats[stat.key]}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 w-6 text-right">
                    {playerStats.stats[stat.key]}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Habits */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={4}>
          <Link href="/habits">
            <GlassCard className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ProgressRing value={habits.completed} max={Math.max(1, habits.total)} size={48} color="#8b5cf6">
                  <span className="text-xs font-bold text-purple-400">{habits.completed}</span>
                </ProgressRing>
                <div>
                  <p className="text-sm font-medium">Habits</p>
                  <p className="text-xs text-slate-400">
                    {habits.completed}/{habits.total} completed today
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-500" />
            </GlassCard>
          </Link>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={5}>
          <h2 className="text-sm font-semibold text-slate-300 mb-2 px-1">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: UtensilsCrossed, label: 'Log Food', href: '/nutrition', color: 'bg-amber-500/10 text-amber-400' },
              { icon: Dumbbell, label: 'Workout', href: '/workouts', color: 'bg-red-500/10 text-red-400' },
              { icon: Music, label: 'Piano', href: '/practice', color: 'bg-violet-500/10 text-violet-400' },
              { icon: Timer, label: 'Focus', href: '/focus', color: 'bg-blue-500/10 text-blue-400' },
              { icon: BookOpen, label: 'Journal', href: '/journal', color: 'bg-emerald-500/10 text-emerald-400' },
              { icon: TrendingUp, label: 'Progress', href: '/progress', color: 'bg-cyan-500/10 text-cyan-400' },
              { icon: CheckSquare, label: 'Tasks', href: '/tasks', color: 'bg-indigo-500/10 text-indigo-400' },
              { icon: Calendar, label: 'Calendar', href: '/calendar', color: 'bg-pink-500/10 text-pink-400' },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <GlassCard className="flex flex-col items-center gap-1.5 py-3 px-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                    <action.icon size={20} />
                  </div>
                  <span className="text-[10px] text-slate-400">{action.label}</span>
                </GlassCard>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={6}>
          <h2 className="text-sm font-semibold text-slate-300 mb-2 px-1">Achievements</h2>
          {unlockedAchievements.length === 0 ? (
            <GlassCard className="text-center py-6">
              <Trophy size={28} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Start logging to earn achievements!</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {unlockedAchievements.slice(0, 3).map((a) => (
                <GlassCard key={a.id} className="flex items-center gap-3 py-3">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-[10px] text-slate-500">{a.description}</p>
                  </div>
                </GlassCard>
              ))}
              <Link href="/progress" className="block text-center text-xs text-indigo-400 py-2">
                View all achievements →
              </Link>
            </div>
          )}
        </motion.div>

        <div className="h-4" />
      </div>
    </div>
  );
}

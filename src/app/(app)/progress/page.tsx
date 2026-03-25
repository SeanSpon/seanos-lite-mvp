'use client';

import { useState, useMemo } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useNutritionStore } from '@/stores/useNutritionStore';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { useCheckInStore } from '@/stores/useCheckInStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { usePracticeStore } from '@/stores/usePracticeStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Flame,
  Zap,
  Target,
  Brain,
  Sparkles,
  Lock,
  Clock,
  Music,
  BookOpen,
  Code2,
  Guitar,
} from 'lucide-react';
import { motion } from 'framer-motion';

type TimeRange = '7D' | '30D' | '90D' | 'All';

function getDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function getDatesInRange(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(getDateStr(i));
  }
  return dates;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getSkillIcon(skill: string) {
  const lower = skill.toLowerCase();
  if (lower.includes('piano') || lower.includes('music')) return Music;
  if (lower.includes('guitar')) return Guitar;
  if (lower.includes('cod') || lower.includes('program')) return Code2;
  if (lower.includes('read')) return BookOpen;
  return Clock;
}

export default function ProgressPage() {
  const hydrated = useHydration();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7D');

  const nutritionStore = useNutritionStore();
  const workoutStore = useWorkoutStore();
  const checkInStore = useCheckInStore();
  const playerStore = usePlayerStore();
  const habitStore = useHabitStore();
  const practiceStore = usePracticeStore();

  const rangeDays = useMemo(() => {
    switch (selectedRange) {
      case '7D': return 7;
      case '30D': return 30;
      case '90D': return 90;
      case 'All': return 365;
    }
  }, [selectedRange]);

  // ── Derived data ──────────────────────────────────────────────

  const currentDates = useMemo(() => getDatesInRange(rangeDays), [rangeDays]);
  const previousDates = useMemo(() => {
    const dates: string[] = [];
    for (let i = rangeDays * 2 - 1; i >= rangeDays; i--) {
      dates.push(getDateStr(i));
    }
    return dates;
  }, [rangeDays]);

  // Workout counts
  const currentWorkouts = useMemo(
    () => workoutStore.logs.filter((l) => currentDates.includes(l.date)).length,
    [workoutStore.logs, currentDates]
  );
  const prevWorkouts = useMemo(
    () => workoutStore.logs.filter((l) => previousDates.includes(l.date)).length,
    [workoutStore.logs, previousDates]
  );

  // Avg daily calories
  const currentCalories = useMemo(() => {
    const totals = currentDates.map((d) => nutritionStore.getDayTotals(d).calories);
    const daysWithData = totals.filter((c) => c > 0);
    return daysWithData.length > 0 ? Math.round(daysWithData.reduce((a, b) => a + b, 0) / daysWithData.length) : 0;
  }, [currentDates, nutritionStore]);

  const prevCalories = useMemo(() => {
    const totals = previousDates.map((d) => nutritionStore.getDayTotals(d).calories);
    const daysWithData = totals.filter((c) => c > 0);
    return daysWithData.length > 0 ? Math.round(daysWithData.reduce((a, b) => a + b, 0) / daysWithData.length) : 0;
  }, [previousDates, nutritionStore]);

  // Daily calorie data for bar chart (max 14 bars)
  const calorieChartData = useMemo(() => {
    const data = currentDates.map((d) => ({
      date: d,
      calories: nutritionStore.getDayTotals(d).calories,
    }));
    return data;
  }, [currentDates, nutritionStore]);

  // Mood trend
  const moodTrend = useMemo(() => checkInStore.getMoodTrend(), [checkInStore]);

  // Workout insights
  const weekWorkouts = workoutStore.getWeekWorkoutCount();
  const avgStruggleCurrent = workoutStore.getAvgStruggle(14);
  const avgStrugglePrevious = workoutStore.getAvgStruggle(28);
  const struggleTrending = avgStruggleCurrent > 0 && avgStrugglePrevious > 0
    ? avgStruggleCurrent > avgStrugglePrevious ? 'up' : 'down'
    : 'neutral';

  // Most trained muscle group
  const mostTrained = useMemo(() => {
    const recentLogs = workoutStore.logs.filter((l) => currentDates.includes(l.date));
    const counts: Record<string, number> = {};
    recentLogs.forEach((log) => {
      const name = log.name.toLowerCase();
      counts[name] = (counts[name] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'None yet';
  }, [workoutStore.logs, currentDates]);

  // Nutrition consistency
  const nutritionConsistency = useMemo(() => {
    const daysWithFood = currentDates.filter(
      (d) => nutritionStore.getDayTotals(d).calories > 0
    ).length;
    return currentDates.length > 0
      ? Math.round((daysWithFood / currentDates.length) * 100)
      : 0;
  }, [currentDates, nutritionStore]);

  // Habit streaks - best streak
  const bestHabitStreak = useMemo(() => {
    let best = { name: '', streak: 0 };
    habitStore.habits.forEach((h) => {
      const streak = habitStore.getStreak(h.id);
      if (streak > best.streak) best = { name: h.name, streak };
    });
    return best;
  }, [habitStore]);

  // Practice data per skill
  const practiceData = useMemo(() => {
    return practiceStore.skills.map((skill) => {
      const totalMin = practiceStore.getTotalMinutes(skill);
      const weekMin = practiceStore.getWeekMinutes(skill);
      // Last week: calculate manually
      const today = new Date();
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0];
      const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
      const lastWeekMin = practiceStore.logs
        .filter(
          (l) =>
            l.skill === skill &&
            l.date >= twoWeeksAgoStr &&
            l.date < oneWeekAgoStr
        )
        .reduce((sum, l) => sum + l.duration, 0);
      const streak = practiceStore.getStreak(skill);
      return { skill, totalMin, weekMin, lastWeekMin, streak };
    });
  }, [practiceStore]);

  // Predictions
  const workoutsPerWeek = useMemo(() => {
    if (rangeDays < 7) return weekWorkouts;
    const weeks = rangeDays / 7;
    return weeks > 0 ? currentWorkouts / weeks : 0;
  }, [rangeDays, currentWorkouts, weekWorkouts]);

  const predictedWorkouts90 = Math.round(workoutsPerWeek * 13);
  const predictDate = new Date();
  predictDate.setDate(predictDate.getDate() + 90);
  const predictDateStr = predictDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (!hydrated) return <div className="min-h-screen bg-[#0f0f14]" />;

  const workoutPctChange = pctChange(currentWorkouts, prevWorkouts);
  const caloriePctChange = pctChange(currentCalories, prevCalories);
  const streak = playerStore.stats.streakDays;
  const bodyScore = playerStore.stats.bodyScore;

  const avgMood = checkInStore.getAvgMood(rangeDays);
  const avgEnergy = checkInStore.getAvgEnergy(rangeDays);

  const maxCalorie = Math.max(...calorieChartData.map((d) => d.calories), 1);

  const moodEmoji = avgMood >= 4 ? '😄' : avgMood >= 3 ? '🙂' : avgMood >= 2 ? '😐' : '😔';
  const energyEmoji = avgEnergy >= 4 ? '⚡' : avgEnergy >= 3 ? '🔋' : avgEnergy >= 2 ? '🪫' : '😴';

  return (
    <div className="pb-28">
      <TopBar title="Progress" subtitle="Your trends & insights" />

      <div className="px-4 space-y-5 mt-2">
        {/* ── Time Range Selector ─────────────────────────────── */}
        <div className="flex gap-2">
          {(['7D', '30D', '90D', 'All'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-semibold transition-all',
                selectedRange === range
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-white/[0.04] text-slate-500 border border-white/[0.06]'
              )}
            >
              {range}
            </button>
          ))}
        </div>

        {/* ── Overview Stats Cards ────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Workouts"
            value={currentWorkouts}
            pct={workoutPctChange}
            icon={<Dumbbell size={16} className="text-red-400" />}
            positiveIsGood
          />
          <StatCard
            label="Avg Calories"
            value={currentCalories.toLocaleString()}
            pct={caloriePctChange}
            icon={<Flame size={16} className="text-amber-400" />}
            positiveIsGood
          />
          <StatCard
            label="Streak"
            value={`${streak} days`}
            icon={<Zap size={16} className="text-yellow-400" />}
          />
          <StatCard
            label="Body Score"
            value={bodyScore}
            icon={<Target size={16} className="text-emerald-400" />}
          />
        </div>

        {/* ── Nutrition Trend ─────────────────────────────────── */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Calorie Trend</h3>
          </div>
          <div className="overflow-x-auto -mx-1 pb-1">
            <div
              className="flex items-end gap-1.5 min-w-max px-1"
              style={{ height: 120 }}
            >
              {calorieChartData.map((d, i) => {
                const heightPct = maxCalorie > 0 ? (d.calories / maxCalorie) * 100 : 0;
                const isToday = i === calorieChartData.length - 1;
                return (
                  <div key={d.date} className="flex flex-col items-center gap-1" style={{ minWidth: 28 }}>
                    <span className="text-[9px] text-slate-500">
                      {d.calories > 0 ? d.calories : ''}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPct, 2)}%` }}
                      transition={{ duration: 0.5, delay: i * 0.02 }}
                      className={cn(
                        'w-5 rounded-t-md',
                        isToday
                          ? 'bg-amber-400'
                          : d.calories > 0
                          ? 'bg-amber-500/40'
                          : 'bg-white/[0.04]'
                      )}
                    />
                    <span className="text-[8px] text-slate-600 -rotate-45 origin-top-left whitespace-nowrap">
                      {rangeDays <= 14
                        ? formatShortDate(d.date)
                        : (i % Math.ceil(calorieChartData.length / 14) === 0
                          ? formatShortDate(d.date)
                          : '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* ── Mood & Energy Trend ─────────────────────────────── */}
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Mood & Energy</h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">
                {moodEmoji} {avgMood > 0 ? avgMood.toFixed(1) : '—'}
              </span>
              <span className="text-slate-400">
                {energyEmoji} {avgEnergy > 0 ? avgEnergy.toFixed(1) : '—'}
              </span>
            </div>
          </div>

          {moodTrend.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              No check-in data yet. Start checking in daily!
            </p>
          ) : (
            <div className="relative" style={{ height: 100 }}>
              {/* Grid lines */}
              {[1, 2, 3, 4, 5].map((v) => (
                <div
                  key={v}
                  className="absolute left-0 right-0 border-t border-white/[0.04]"
                  style={{ bottom: `${((v - 1) / 4) * 100}%` }}
                />
              ))}
              {/* Mood dots */}
              <div className="absolute inset-0 flex items-end justify-between">
                {moodTrend.map((point, i) => {
                  const moodY = ((point.mood - 1) / 4) * 100;
                  const energyY = ((point.energy - 1) / 4) * 100;
                  return (
                    <div key={point.date} className="relative flex-1 flex justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="absolute w-2.5 h-2.5 rounded-full bg-purple-400 border border-purple-300/50"
                        style={{ bottom: `${moodY}%` }}
                        title={`Mood: ${point.mood}`}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 + 0.02 }}
                        className="absolute w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-300/50"
                        style={{ bottom: `${energyY}%` }}
                        title={`Energy: ${point.energy}`}
                      />
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="absolute top-0 right-0 flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> Mood
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" /> Energy
                </span>
              </div>
            </div>
          )}
        </GlassCard>

        {/* ── Workout Insights ────────────────────────────────── */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-white">Workout Insights</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Workouts this week</span>
              <span className="text-sm font-bold text-white">{weekWorkouts}</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Avg struggle</span>
                <span className="text-sm font-bold text-white">
                  {avgStruggleCurrent > 0 ? avgStruggleCurrent.toFixed(1) : '—'}/5
                </span>
              </div>
              {avgStruggleCurrent > 0 && (
                <ProgressBar
                  value={avgStruggleCurrent}
                  max={5}
                  color={
                    avgStruggleCurrent >= 4
                      ? 'bg-red-500'
                      : avgStruggleCurrent >= 3
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Most trained</span>
              <span className="text-sm font-medium text-white capitalize">
                {mostTrained}
              </span>
            </div>

            {avgStruggleCurrent > 0 && (
              <div
                className={cn(
                  'text-xs px-3 py-2 rounded-xl',
                  struggleTrending === 'down'
                    ? 'bg-green-500/10 text-green-400'
                    : struggleTrending === 'up'
                    ? 'bg-orange-500/10 text-orange-400'
                    : 'bg-white/[0.04] text-slate-400'
                )}
              >
                {struggleTrending === 'down'
                  ? "Getting easier! You're adapting \uD83D\uDCAA"
                  : struggleTrending === 'up'
                  ? 'Pushing harder! Great intensity \uD83D\uDD25'
                  : 'Keep at it, consistency is key!'}
              </div>
            )}
          </div>
        </GlassCard>

        {/* ── Predictions ─────────────────────────────────────── */}
        <GlassCard glow>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Predictions</h3>
          </div>

          <div className="space-y-3">
            {workoutsPerWeek > 0 && (
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <p className="text-xs text-slate-300">
                  At this rate, you&apos;ll hit{' '}
                  <span className="text-white font-semibold">
                    {predictedWorkouts90} workouts
                  </span>{' '}
                  by {predictDateStr}
                </p>
              </div>
            )}

            {bestHabitStreak.streak >= 3 && (
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                <p className="text-xs text-slate-300">
                  Your discipline is in the top tier &mdash;{' '}
                  <span className="text-white font-semibold">
                    {bestHabitStreak.streak}-day streak
                  </span>{' '}
                  on {bestHabitStreak.name}. Keep going!
                </p>
              </div>
            )}

            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <p className="text-xs text-slate-300">
                Your nutrition consistency is{' '}
                <span
                  className={cn(
                    'font-semibold',
                    nutritionConsistency >= 80
                      ? 'text-emerald-400'
                      : nutritionConsistency >= 50
                      ? 'text-amber-400'
                      : 'text-red-400'
                  )}
                >
                  {nutritionConsistency}%
                </span>{' '}
                &mdash;{' '}
                {nutritionConsistency >= 80
                  ? 'excellent! Keep fueling the machine.'
                  : nutritionConsistency >= 50
                  ? 'solid foundation. Try logging every meal for a week!'
                  : 'room to grow. Start with just logging breakfast daily.'}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
              <p className="text-xs text-slate-300">
                Adding just{' '}
                <span className="text-white font-semibold">10g more protein daily</span>{' '}
                = ~5 lbs more muscle per year potential
              </p>
            </div>
          </div>
        </GlassCard>

        {/* ── Practice Progress ───────────────────────────────── */}
        {practiceData.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-300 mb-2 px-1">
              Practice Progress
            </h2>
            <div className="space-y-2">
              {practiceData.map((pd) => {
                const Icon = getSkillIcon(pd.skill);
                const weekChange = pctChange(pd.weekMin, pd.lastWeekMin);
                const totalHours = (pd.totalMin / 60).toFixed(1);
                return (
                  <GlassCard key={pd.skill}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Icon size={20} className="text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white truncate">
                            {pd.skill}
                          </p>
                          {pd.streak > 0 && (
                            <span className="text-[10px] text-yellow-400 font-medium">
                              {pd.streak}d streak
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-slate-400">
                            {totalHours}h total
                          </span>
                          <span className="text-xs text-slate-500">|</span>
                          <span className="text-xs text-slate-400">
                            {pd.weekMin}m this week
                          </span>
                          {pd.lastWeekMin > 0 && (
                            <>
                              <span className="text-xs text-slate-500">|</span>
                              <span
                                className={cn(
                                  'text-[10px] font-medium flex items-center gap-0.5',
                                  weekChange >= 0
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                )}
                              >
                                {weekChange >= 0 ? (
                                  <TrendingUp size={10} />
                                ) : (
                                  <TrendingDown size={10} />
                                )}
                                {weekChange >= 0 ? '+' : ''}
                                {weekChange}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Achievements ────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-2 px-1">
            Achievements
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {playerStore.achievements.map((ach) => {
              const unlocked = !!ach.unlockedAt;
              return (
                <motion.div
                  key={ach.id}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'relative rounded-2xl border p-3 text-center transition-all',
                    unlocked
                      ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                      : 'bg-white/[0.02] border-white/[0.06] opacity-40'
                  )}
                >
                  <div className="text-2xl mb-1">{ach.icon}</div>
                  <p
                    className={cn(
                      'text-[10px] font-medium leading-tight',
                      unlocked ? 'text-white' : 'text-slate-500'
                    )}
                  >
                    {ach.name}
                  </p>
                  {!unlocked && (
                    <Lock
                      size={10}
                      className="absolute top-2 right-2 text-slate-600"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card Sub-component ─────────────────────────────────── */

function StatCard({
  label,
  value,
  pct,
  icon,
  positiveIsGood,
}: {
  label: string;
  value: string | number;
  pct?: number;
  icon: React.ReactNode;
  positiveIsGood?: boolean;
}) {
  const showPct = pct !== undefined && pct !== 0;
  const isPositive = (pct ?? 0) > 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {showPct && (
        <div
          className={cn(
            'flex items-center gap-1 mt-1 text-[10px] font-medium',
            isGood ? 'text-green-400' : 'text-red-400'
          )}
        >
          {isPositive ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          {isPositive ? '+' : ''}
          {pct}% vs prev
        </div>
      )}
    </GlassCard>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useNutritionStore } from '@/stores/useNutritionStore';
import { useHealthStore } from '@/stores/useHealthStore';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TopBar } from '@/components/layout/TopBar';
import { getGreeting, todayStr, formatDate } from '@/lib/utils';
import {
  Droplets, Minus, Plus, Footprints, Dumbbell,
  UtensilsCrossed, Play, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  steps: number;
  lastWorkout?: { name: string; date: string; duration: number };
}

export default function DashboardPage() {
  const hydrated = useHydration();
  const userName = useSettingsStore((s) => s.userName);
  const calorieGoal = useSettingsStore((s) => s.calorieGoal);
  const proteinGoal = useSettingsStore((s) => s.proteinGoal);
  const carbGoal = useSettingsStore((s) => s.carbGoal);
  const fatGoal = useSettingsStore((s) => s.fatGoal);
  const waterGoal = useSettingsStore((s) => s.waterGoal);
  const stepsGoal = useSettingsStore((s) => s.stepsGoal);
  const getDayTotals = useNutritionStore((s) => s.getDayTotals);
  const getToday = useHealthStore((s) => s.getToday);
  const addWater = useHealthStore((s) => s.addWater);
  const removeWater = useHealthStore((s) => s.removeWater);
  const getRecentLogs = useWorkoutStore((s) => s.getRecentLogs);

  const [dbData, setDbData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((data) => setDbData(data))
      .catch(() => {});
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#0f0f14]">
        <div className="px-5 pt-16 space-y-4">
          <div className="h-6 w-48 bg-white/[0.04] rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-white/[0.04] rounded-lg animate-pulse" />
          <div className="flex justify-center py-8">
            <div className="w-40 h-40 rounded-full bg-white/[0.04] animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-12 bg-white/[0.04] rounded-xl animate-pulse" />
            <div className="h-12 bg-white/[0.04] rounded-xl animate-pulse" />
            <div className="h-12 bg-white/[0.04] rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const today = todayStr();
  const nutrition = getDayTotals(today);
  const health = getToday();
  const recentWorkouts = getRecentLogs(1);
  const lastWorkout = dbData?.lastWorkout || (recentWorkouts.length > 0 ? {
    name: recentWorkouts[0].name,
    date: recentWorkouts[0].date,
    duration: recentWorkouts[0].duration,
  } : null);

  const calories = dbData?.calories ?? nutrition.calories;
  const protein = dbData?.protein ?? nutrition.protein;
  const carbs = dbData?.carbs ?? nutrition.carbs;
  const fat = dbData?.fat ?? nutrition.fat;
  const water = dbData?.water ?? health.waterGlasses;
  const steps = dbData?.steps ?? (health.steps || 0);

  const calRemaining = Math.max(0, calorieGoal - Math.round(calories));

  function getRelativeDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00');
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(d);
  }

  return (
    <div>
      <TopBar
        title={`${getGreeting()}, ${userName}`}
        subtitle={formatDate(new Date())}
      />

      <div className="px-4 space-y-4 mt-3">
        {/* Calories Ring - Hero Section */}
        <GlassCard className="flex flex-col items-center py-6">
          <ProgressRing
            value={calories}
            max={calorieGoal}
            size={160}
            strokeWidth={10}
            color="#00b4d8"
            trackColor="rgba(255,255,255,0.04)"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-white tracking-tight">
                {Math.round(calories)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                of {calorieGoal} kcal
              </p>
            </div>
          </ProgressRing>
          <p className="text-sm text-slate-400 mt-3">
            <span className="text-[#00b4d8] font-medium">{calRemaining}</span> remaining
          </p>
        </GlassCard>

        {/* Macro Bars */}
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
              <span className="text-sm text-slate-300">Protein</span>
            </div>
            <span className="text-sm text-slate-400 tabular-nums">
              {Math.round(protein)}<span className="text-slate-600">/{proteinGoal}g</span>
            </span>
          </div>
          <ProgressBar value={protein} max={proteinGoal} color="bg-[#4ade80]" size="md" />

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              <span className="text-sm text-slate-300">Carbs</span>
            </div>
            <span className="text-sm text-slate-400 tabular-nums">
              {Math.round(carbs)}<span className="text-slate-600">/{carbGoal}g</span>
            </span>
          </div>
          <ProgressBar value={carbs} max={carbGoal} color="bg-[#f59e0b]" size="md" />

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span className="text-sm text-slate-300">Fat</span>
            </div>
            <span className="text-sm text-slate-400 tabular-nums">
              {Math.round(fat)}<span className="text-slate-600">/{fatGoal}g</span>
            </span>
          </div>
          <ProgressBar value={fat} max={fatGoal} color="bg-[#ef4444]" size="md" />
        </GlassCard>

        {/* Water Tracker */}
        <GlassCard className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets size={20} className="text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">Water</p>
              <p className="text-xs text-slate-500">{water} / {waterGoal} glasses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={removeWater}
              className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
            >
              <Minus size={16} className="text-slate-400" />
            </button>
            <span className="text-lg font-semibold text-white w-8 text-center tabular-nums">{water}</span>
            <button
              onClick={addWater}
              className="w-8 h-8 rounded-lg bg-[#00b4d8]/15 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Plus size={16} className="text-[#00b4d8]" />
            </button>
          </div>
        </GlassCard>

        {/* Steps + Workout Row */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Footprints size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Steps</p>
              <p className="text-lg font-semibold text-white tabular-nums">{steps.toLocaleString()}</p>
              <p className="text-[10px] text-slate-600">/ {stepsGoal.toLocaleString()}</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00b4d8]/10 flex items-center justify-center">
              <Dumbbell size={20} className="text-[#00b4d8]" />
            </div>
            <div className="min-w-0">
              {lastWorkout ? (
                <>
                  <p className="text-xs text-slate-500 truncate">{lastWorkout.name}</p>
                  <p className="text-sm font-medium text-white">{getRelativeDate(lastWorkout.date)}</p>
                  <p className="text-[10px] text-slate-600">{lastWorkout.duration}min</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-500">Last workout</p>
                  <p className="text-sm text-slate-400">None yet</p>
                </>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/nutrition">
            <GlassCard className="flex flex-col items-center gap-2 py-4 active:scale-[0.97] transition-transform">
              <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center">
                <UtensilsCrossed size={20} className="text-[#f59e0b]" />
              </div>
              <span className="text-xs text-slate-400">Log Food</span>
            </GlassCard>
          </Link>
          <Link href="/workouts">
            <GlassCard className="flex flex-col items-center gap-2 py-4 active:scale-[0.97] transition-transform">
              <div className="w-10 h-10 rounded-lg bg-[#00b4d8]/10 flex items-center justify-center">
                <Play size={20} className="text-[#00b4d8]" />
              </div>
              <span className="text-xs text-slate-400">Workout</span>
            </GlassCard>
          </Link>
          <Link href="/progress">
            <GlassCard className="flex flex-col items-center gap-2 py-4 active:scale-[0.97] transition-transform">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ChevronRight size={20} className="text-emerald-400" />
              </div>
              <span className="text-xs text-slate-400">Progress</span>
            </GlassCard>
          </Link>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}

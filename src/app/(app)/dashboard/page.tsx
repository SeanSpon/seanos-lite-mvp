'use client';
import { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useHealthStore } from '@/stores/useHealthStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { TopBar } from '@/components/layout/TopBar';
import { getGreeting, todayStr, formatDate } from '@/lib/utils';
import {
  Flame,
  Droplets,
  Footprints,
  Dumbbell,
  CheckCircle2,
  Circle,
  Music,
  Code2,
  BookOpen,
  Timer,
  Plus,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const hydrated = useHydration();
  const userName = useSettingsStore((s) => s.userName);
  const calorieGoal = useSettingsStore((s) => s.calorieGoal);
  const proteinGoal = useSettingsStore((s) => s.proteinGoal);
  const tasks = useTaskStore((s) => s.tasks);
  const getToday = useHealthStore((s) => s.getToday);
  const habitProgress = useHabitStore((s) => s.getTodayProgress);

  if (!hydrated) {
    return <div className="min-h-screen bg-[#0a0a0f]" />;
  }

  const health = getToday();
  const habits = habitProgress();
  const todayTasks = tasks.filter(
    (t) => t.status !== 'done' && (!t.dueDate || t.dueDate <= todayStr())
  );

  return (
    <div>
      <TopBar
        title={`${getGreeting()}, ${userName}`}
        subtitle={formatDate(new Date())}
      />

      <div className="px-4 space-y-4 mt-2">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="flex items-center gap-3">
            <ProgressRing value={health.calories || 0} max={calorieGoal} size={52} color="#f59e0b">
              <Flame size={18} className="text-amber-400" />
            </ProgressRing>
            <div>
              <p className="text-xs text-slate-400">Calories</p>
              <p className="text-lg font-bold">{health.calories || 0}</p>
              <p className="text-[10px] text-slate-500">/ {calorieGoal}</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-3">
            <ProgressRing value={health.protein || 0} max={proteinGoal} size={52} color="#ef4444">
              <Dumbbell size={18} className="text-red-400" />
            </ProgressRing>
            <div>
              <p className="text-xs text-slate-400">Protein</p>
              <p className="text-lg font-bold">{health.protein || 0}g</p>
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

        {/* Habits Progress */}
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

        {/* Today's Tasks */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-semibold text-slate-300">Today&apos;s Tasks</h2>
            <Link href="/tasks" className="text-xs text-indigo-400">View all</Link>
          </div>
          {todayTasks.length === 0 ? (
            <GlassCard className="text-center py-6">
              <CheckCircle2 size={32} className="text-green-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400">All clear! No tasks due.</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {todayTasks.slice(0, 5).map((task) => (
                <GlassCard key={task.id} className="flex items-center gap-3 py-3">
                  <Circle
                    size={20}
                    className={
                      task.priority === 'high'
                        ? 'text-red-400'
                        : task.priority === 'medium'
                        ? 'text-amber-400'
                        : 'text-slate-500'
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-[10px] text-slate-500">Due {task.dueDate}</p>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-2 px-1">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Plus, label: 'Add Task', href: '/tasks', color: 'bg-indigo-500/10 text-indigo-400' },
              { icon: Flame, label: 'Log Food', href: '/health', color: 'bg-amber-500/10 text-amber-400' },
              { icon: Dumbbell, label: 'Workout', href: '/health', color: 'bg-red-500/10 text-red-400' },
              { icon: Timer, label: 'Focus', href: '/focus', color: 'bg-purple-500/10 text-purple-400' },
              { icon: Music, label: 'Piano', href: '/habits', color: 'bg-violet-500/10 text-violet-400' },
              { icon: BookOpen, label: 'Journal', href: '/journal', color: 'bg-emerald-500/10 text-emerald-400' },
              { icon: Code2, label: 'Code', href: '/habits', color: 'bg-green-500/10 text-green-400' },
              { icon: Footprints, label: 'Steps', href: '/health', color: 'bg-blue-500/10 text-blue-400' },
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
        </div>

        {/* Workouts Today */}
        {health.workouts.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-300 mb-2 px-1">Workouts Today</h2>
            {health.workouts.map((w) => (
              <GlassCard key={w.id} className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Dumbbell size={20} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium capitalize">{w.type}</p>
                  {w.duration && <p className="text-xs text-slate-400">{w.duration} min</p>}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

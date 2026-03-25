'use client';
import { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useHabitStore } from '@/stores/useHabitStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Modal } from '@/components/ui/Modal';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Flame,
  Music,
  Dumbbell,
  Droplets,
  Code2,
  BookOpen,
  Timer,
  Target,
  Brain,
  Zap,
  Plus,
  DollarSign,
  Calendar,
  CheckSquare,
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = {
  Music, Dumbbell, Droplets, Code2, BookOpen, Timer, Target, Brain, Flame, Zap,
};

const moduleLinks = [
  { href: '/practice', label: 'Practice', desc: 'Track skills & hobbies', icon: Music, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { href: '/journal', label: 'Journal', desc: 'Notes & reflections', icon: BookOpen, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { href: '/goals', label: 'Goals', desc: 'Long-term goals', icon: Target, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { href: '/focus', label: 'Focus', desc: 'Pomodoro timer', icon: Timer, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { href: '/tasks', label: 'Tasks', desc: 'To-do lists', icon: CheckSquare, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { href: '/calendar', label: 'Calendar', desc: 'Schedule & events', icon: Calendar, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { href: '/finances', label: 'Finances', desc: 'Budget & expenses', icon: DollarSign, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
];

export default function HabitsPage() {
  const hydrated = useHydration();
  const { habits, toggleHabit, isCompleted, getStreak, getTodayProgress, addHabit } = useHabitStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Target');
  const [selectedColor, setSelectedColor] = useState('#6366f1');

  if (!hydrated) return <div className="min-h-screen bg-[#0f0f14]" />;

  const progress = getTodayProgress();

  const handleAdd = () => {
    if (!name.trim()) return;
    addHabit({ name: name.trim(), icon: selectedIcon, color: selectedColor, frequency: 'daily' });
    setName('');
    setSelectedIcon('Target');
    setSelectedColor('#6366f1');
    setShowAdd(false);
  };

  return (
    <div>
      <TopBar title="More" />

      <div className="px-4 space-y-4 mt-2">
        {/* Today's Habits Section */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-semibold text-slate-300">Today&apos;s Habits</h2>
            <button
              onClick={() => setShowAdd(true)}
              className="text-xs text-indigo-400 flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {/* Progress Ring */}
          <GlassCard glow className="flex items-center gap-4 mb-3">
            <ProgressRing value={progress.completed} max={Math.max(1, progress.total)} size={64} color="#8b5cf6">
              <span className="text-sm font-bold text-purple-400">
                {progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0}%
              </span>
            </ProgressRing>
            <div>
              <p className="text-lg font-bold">Daily Progress</p>
              <p className="text-sm text-slate-400">
                {progress.completed} of {progress.total} completed
              </p>
            </div>
          </GlassCard>

          {/* Habit Cards */}
          <div className="space-y-2">
            {habits.map((habit) => {
              const completed = isCompleted(habit.id);
              const streak = getStreak(habit.id);
              const Icon = iconMap[habit.icon] || Target;

              return (
                <GlassCard
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={cn(
                    'flex items-center gap-3 transition-all',
                    completed && 'border-green-500/20'
                  )}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: completed ? habit.color + '30' : habit.color + '10',
                    }}
                  >
                    {completed ? (
                      <CheckCircle2 size={22} style={{ color: habit.color }} />
                    ) : (
                      <Icon size={22} style={{ color: habit.color }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn('text-sm font-medium', completed && 'text-green-400')}>
                      {habit.name}
                    </p>
                    {streak > 0 && (
                      <p className="text-[10px] text-amber-400 flex items-center gap-1">
                        <Flame size={10} /> {streak} day streak
                      </p>
                    )}
                  </div>
                  {completed ? (
                    <CheckCircle2 size={22} className="text-green-400" />
                  ) : (
                    <Circle size={22} className="text-slate-600" />
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-2 px-1">Modules</h2>
          <div className="grid grid-cols-2 gap-3">
            {moduleLinks.map((mod) => (
              <Link key={mod.href} href={mod.href}>
                <GlassCard className="flex flex-col items-center text-center py-5 px-2 hover:border-white/[0.12] transition-colors">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-2 border', mod.color)}>
                    <mod.icon size={22} />
                  </div>
                  <p className="text-sm font-medium">{mod.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{mod.desc}</p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom spacer for nav */}
        <div className="h-20" />
      </div>

      {/* Add Habit Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Habit">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read 20 minutes"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(iconMap).map(([key, Icon]) => (
                <button
                  key={key}
                  onClick={() => setSelectedIcon(key)}
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-colors border',
                    selectedIcon === key
                      ? 'bg-indigo-500/20 border-indigo-500/30'
                      : 'bg-white/[0.04] border-white/[0.06]'
                  )}
                >
                  <Icon size={20} className="text-slate-300" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Color</label>
            <div className="flex gap-2">
              {['#6366f1', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-transform',
                    selectedColor === c && 'scale-125 ring-2 ring-white/20'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className={cn(
              'w-full py-3 rounded-xl font-medium text-sm active:scale-[0.98] transition-all',
              name.trim()
                ? 'bg-indigo-500 text-white'
                : 'bg-white/[0.06] text-slate-500 cursor-not-allowed'
            )}
          >
            Add Habit
          </button>
        </div>
      </Modal>
    </div>
  );
}

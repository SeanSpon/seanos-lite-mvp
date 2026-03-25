'use client';
import { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useHabitStore } from '@/stores/useHabitStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Modal } from '@/components/ui/Modal';
import { FAB } from '@/components/ui/FAB';
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
  ChevronRight,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>> = {
  Music, Dumbbell, Droplets, Code2, BookOpen, Timer, Target, Brain, Flame, Zap,
};

const moreLinks = [
  { href: '/finances', label: 'Finances', icon: '💰', desc: 'Budget & expenses' },
  { href: '/goals', label: 'Goals', icon: '🎯', desc: 'Long-term goals' },
  { href: '/journal', label: 'Journal', icon: '📝', desc: 'Notes & reflections' },
  { href: '/focus', label: 'Focus Mode', icon: '⏱️', desc: 'Pomodoro timer' },
  { href: '/calendar', label: 'Calendar', icon: '📅', desc: 'Schedule & events' },
];

export default function HabitsPage() {
  const hydrated = useHydration();
  const { habits, toggleHabit, isCompleted, getStreak, getTodayProgress, addHabit } = useHabitStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Target');
  const [selectedColor, setSelectedColor] = useState('#6366f1');

  if (!hydrated) return <div className="min-h-screen bg-[#0a0a0f]" />;

  const progress = getTodayProgress();

  const handleAdd = () => {
    if (!name.trim()) return;
    addHabit({ name: name.trim(), icon: selectedIcon, color: selectedColor, frequency: 'daily' });
    setName('');
    setShowAdd(false);
  };

  return (
    <div>
      <TopBar title="Habits & More" />

      <div className="px-4 space-y-4 mt-2">
        {/* Today's Progress */}
        <GlassCard glow className="flex items-center gap-4">
          <ProgressRing value={progress.completed} max={Math.max(1, progress.total)} size={64} color="#8b5cf6">
            <span className="text-sm font-bold text-purple-400">
              {progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0}%
            </span>
          </ProgressRing>
          <div>
            <p className="text-lg font-bold">Today&apos;s Habits</p>
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

        {/* More Modules */}
        <div className="pt-2">
          <h2 className="text-sm font-semibold text-slate-300 mb-2 px-1">More</h2>
          <div className="space-y-2">
            {moreLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <GlassCard className="flex items-center gap-3 py-3 mb-2">
                  <span className="text-2xl">{link.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{link.label}</p>
                    <p className="text-xs text-slate-500">{link.desc}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-500" />
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <FAB onClick={() => setShowAdd(true)} />

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
            className="w-full py-3 rounded-xl bg-indigo-500 text-white font-medium text-sm active:scale-[0.98] transition-transform"
          >
            Add Habit
          </button>
        </div>
      </Modal>
    </div>
  );
}

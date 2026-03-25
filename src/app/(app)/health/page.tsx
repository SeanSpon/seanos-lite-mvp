'use client';
import { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useHealthStore } from '@/stores/useHealthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Modal } from '@/components/ui/Modal';
import { FAB } from '@/components/ui/FAB';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import {
  Flame,
  Dumbbell,
  Droplets,
  Moon,
  Scale,
  Footprints,
  Plus,
  Minus,
  Beef,
} from 'lucide-react';

type ModalType = 'food' | 'workout' | 'weight' | 'sleep' | 'steps' | null;

export default function HealthPage() {
  const hydrated = useHydration();
  const health = useHealthStore((s) => s.getToday);
  const { addWater, removeWater, addCalories, addProtein, setSteps, setSleep, setWeight, addWorkout } = useHealthStore();
  const { calorieGoal, proteinGoal } = useSettingsStore();
  const [modal, setModal] = useState<ModalType>(null);
  const [inputVal, setInputVal] = useState('');
  const [inputVal2, setInputVal2] = useState('');
  const [workoutType, setWorkoutType] = useState('push');
  const [workoutNotes, setWorkoutNotes] = useState('');

  if (!hydrated) return <div className="min-h-screen bg-[#0a0a0f]" />;

  const today = health();

  const handleSubmit = () => {
    const val = parseFloat(inputVal);
    if (modal === 'food' && !isNaN(val)) {
      addCalories(val);
      const p = parseFloat(inputVal2);
      if (!isNaN(p)) addProtein(p);
    }
    if (modal === 'weight' && !isNaN(val)) setWeight(val);
    if (modal === 'sleep' && !isNaN(val)) setSleep(val);
    if (modal === 'steps' && !isNaN(val)) setSteps(val);
    if (modal === 'workout') {
      addWorkout({
        type: workoutType,
        exercises: [],
        duration: !isNaN(val) ? val : undefined,
        notes: workoutNotes || undefined,
      });
    }
    setInputVal('');
    setInputVal2('');
    setWorkoutNotes('');
    setModal(null);
  };

  const caloriesLeft = Math.max(0, calorieGoal - (today.calories || 0));
  const proteinLeft = Math.max(0, proteinGoal - (today.protein || 0));

  return (
    <div>
      <TopBar title="Fitness" subtitle="Track your body" />

      <div className="px-4 space-y-4 mt-2">
        {/* Calories & Protein */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard glow onClick={() => setModal('food')}>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={18} className="text-amber-400" />
              <span className="text-xs text-slate-400">Calories</span>
            </div>
            <p className="text-2xl font-bold">{today.calories || 0}</p>
            <ProgressBar value={today.calories || 0} max={calorieGoal} color="bg-amber-500" className="mt-2" />
            <p className="text-[10px] text-slate-500 mt-1">{caloriesLeft} left</p>
          </GlassCard>

          <GlassCard onClick={() => setModal('food')}>
            <div className="flex items-center gap-2 mb-2">
              <Beef size={18} className="text-red-400" />
              <span className="text-xs text-slate-400">Protein</span>
            </div>
            <p className="text-2xl font-bold">{today.protein || 0}g</p>
            <ProgressBar value={today.protein || 0} max={proteinGoal} color="bg-red-500" className="mt-2" />
            <p className="text-[10px] text-slate-500 mt-1">{proteinLeft}g left</p>
          </GlassCard>
        </div>

        {/* Water */}
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets size={18} className="text-blue-400" />
              <span className="text-sm font-medium">Water</span>
            </div>
            <span className="text-sm text-slate-400">{today.waterGlasses} glasses</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={removeWater}
              className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
            >
              <Minus size={18} className="text-slate-400" />
            </button>
            <div className="flex-1 flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 h-8 rounded-lg transition-colors',
                    i < today.waterGlasses ? 'bg-blue-500/30' : 'bg-white/[0.04]'
                  )}
                />
              ))}
            </div>
            <button
              onClick={addWater}
              className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Plus size={18} className="text-blue-400" />
            </button>
          </div>
        </GlassCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <GlassCard onClick={() => setModal('steps')} className="text-center py-3">
            <Footprints size={20} className="text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{(today.steps || 0).toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">steps</p>
          </GlassCard>

          <GlassCard onClick={() => setModal('sleep')} className="text-center py-3">
            <Moon size={20} className="text-indigo-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{today.sleepHours || '—'}</p>
            <p className="text-[10px] text-slate-500">hrs sleep</p>
          </GlassCard>

          <GlassCard onClick={() => setModal('weight')} className="text-center py-3">
            <Scale size={20} className="text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{today.weight || '—'}</p>
            <p className="text-[10px] text-slate-500">lbs</p>
          </GlassCard>
        </div>

        {/* Workouts */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-semibold text-slate-300">Workouts</h2>
            <button
              onClick={() => setModal('workout')}
              className="text-xs text-indigo-400"
            >
              + Add
            </button>
          </div>
          {today.workouts.length === 0 ? (
            <GlassCard className="text-center py-6">
              <Dumbbell size={28} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No workouts logged today</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {today.workouts.map((w) => (
                <GlassCard key={w.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Dumbbell size={20} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{w.type} Day</p>
                    <p className="text-xs text-slate-400">
                      {w.duration ? `${w.duration} min` : ''}
                      {w.notes ? ` — ${w.notes}` : ''}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <FAB onClick={() => setModal('food')} />

      {/* Food Modal */}
      <Modal open={modal === 'food'} onClose={() => setModal(null)} title="Log Food">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Calories</label>
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. 500"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Protein (g)</label>
            <input
              type="number"
              value={inputVal2}
              onChange={(e) => setInputVal2(e.target.value)}
              placeholder="e.g. 30"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-red-500/50"
            />
          </div>
          {/* Quick Add Buttons */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Quick Add</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Protein Shake', cal: 250, pro: 30 },
                { name: 'Cereal + Milk', cal: 350, pro: 10 },
                { name: 'Qdoba Bowl', cal: 800, pro: 45 },
                { name: 'Chick-fil-A', cal: 600, pro: 35 },
                { name: 'PB&J', cal: 400, pro: 15 },
                { name: 'Eggs (3)', cal: 240, pro: 18 },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    addCalories(item.cal);
                    addProtein(item.pro);
                    setModal(null);
                  }}
                  className="text-left px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] active:scale-[0.97] transition-transform"
                >
                  <p className="text-xs font-medium">{item.name}</p>
                  <p className="text-[10px] text-slate-500">{item.cal} cal / {item.pro}g</p>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-amber-500 text-white font-medium text-sm active:scale-[0.98] transition-transform"
          >
            Log Food
          </button>
        </div>
      </Modal>

      {/* Workout Modal */}
      <Modal open={modal === 'workout'} onClose={() => setModal(null)} title="Log Workout">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['push', 'pull', 'legs', 'upper', 'lower', 'full body'].map((t) => (
                <button
                  key={t}
                  onClick={() => setWorkoutType(t)}
                  className={cn(
                    'py-2 rounded-xl text-xs font-medium border capitalize transition-colors',
                    workoutType === t
                      ? 'bg-red-500/20 border-red-500/30 text-red-400'
                      : 'bg-white/[0.04] border-white/[0.06] text-slate-500'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Duration (min)</label>
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. 60"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-red-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Notes</label>
            <textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="e.g. Bench felt strong, PR on squats"
              rows={2}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-red-500/50 resize-none"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-red-500 text-white font-medium text-sm active:scale-[0.98] transition-transform"
          >
            Log Workout
          </button>
        </div>
      </Modal>

      {/* Number Input Modals */}
      {(modal === 'weight' || modal === 'sleep' || modal === 'steps') && (
        <Modal
          open={true}
          onClose={() => setModal(null)}
          title={modal === 'weight' ? 'Log Weight' : modal === 'sleep' ? 'Log Sleep' : 'Log Steps'}
        >
          <div className="space-y-4">
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                modal === 'weight' ? 'lbs' : modal === 'sleep' ? 'hours' : 'steps'
              }
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-indigo-500 text-white font-medium text-sm active:scale-[0.98] transition-transform"
            >
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

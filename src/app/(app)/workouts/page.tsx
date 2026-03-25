'use client';
import { useState, useMemo, useEffect } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { EXERCISE_LIBRARY } from '@/data/foodDatabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { Modal } from '@/components/ui/Modal';
import { TopBar } from '@/components/layout/TopBar';
import { todayStr, generateId, cn } from '@/lib/utils';
import {
  Dumbbell,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Clock,
  Calendar,
  Play,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  PlannedExercise,
  LoggedExercise,
  CompletedSet,
} from '@/types';

type Tab = 'today' | 'plans' | 'history';
type ModalType =
  | 'log-workout'
  | 'create-plan'
  | 'edit-plan'
  | 'add-exercise'
  | null;

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STRUGGLE_EMOJIS = ['', '\u{1F60E}', '\u{1F60A}', '\u{1F610}', '\u{1F613}', '\u{1F62B}'];
const ENERGY_COLORS = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-400', 'bg-green-500'];
const MUSCLE_GROUPS = [...new Set(EXERCISE_LIBRARY.map((e) => e.muscleGroup))];

export default function WorkoutsPage() {
  const hydrated = useHydration();
  const {
    plans,
    logs,
    addPlan,
    updatePlan,
    deletePlan,
    addLog,
    deleteLog,
    getTodayPlan,
    getRecentLogs,
    getWeekWorkoutCount,
    getAvgStruggle,
  } = useWorkoutStore();
  const { addXp } = usePlayerStore();

  const [tab, setTab] = useState<Tab>('today');
  const [modal, setModal] = useState<ModalType>(null);

  // Log workout state
  const [logName, setLogName] = useState('');
  const [logPlanId, setLogPlanId] = useState<string | undefined>();
  const [logExercises, setLogExercises] = useState<LoggedExercise[]>([]);
  const [logDuration, setLogDuration] = useState('');
  const [logStruggle, setLogStruggle] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [logEnergy, setLogEnergy] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [logNotes, setLogNotes] = useState('');

  // Create plan state
  const [planName, setPlanName] = useState('');
  const [planDays, setPlanDays] = useState<number[]>([]);
  const [planExercises, setPlanExercises] = useState<PlannedExercise[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Exercise picker state
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState('All');
  const [exercisePickerTarget, setExercisePickerTarget] = useState<'plan' | 'log'>('log');

  // History expansion
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Try fetching from API
  useEffect(() => {
    fetch('/api/workouts')
      .then((r) => r.json())
      .catch(() => {});
  }, []);

  const filteredExercises = useMemo(() => {
    return EXERCISE_LIBRARY.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
      const matchesGroup = exerciseFilter === 'All' || ex.muscleGroup === exerciseFilter;
      return matchesSearch && matchesGroup;
    });
  }, [exerciseSearch, exerciseFilter]);

  const weekDays = useMemo(() => {
    const now = new Date();
    const currentDow = now.getDay();
    const mondayOffset = (currentDow + 6) % 7;
    const monday = new Date(now);
    monday.setDate(monday.getDate() - mondayOffset);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const dow = d.getDay();
      const dateStr = d.toISOString().split('T')[0];
      const hasPlanned = plans.some((p) => p.days.includes(dow));
      const hasLogged = logs.some((l) => l.date === dateStr);
      const isToday = dateStr === todayStr();
      return { dow, dateStr, hasPlanned, hasLogged, isToday };
    });
  }, [plans, logs]);

  if (!hydrated) return <div className="min-h-screen bg-[#0f0f14]" />;

  const todayPlan = getTodayPlan();
  const weekCount = getWeekWorkoutCount();

  // ---------- Helpers ----------

  const openLogWorkout = (fromPlan?: boolean) => {
    if (fromPlan && todayPlan) {
      setLogName(todayPlan.name);
      setLogPlanId(todayPlan.id);
      setLogExercises(
        todayPlan.exercises.map((ex) => ({
          id: generateId(),
          name: ex.name,
          sets: Array.from({ length: ex.targetSets }, () => ({
            reps: ex.targetReps,
            weight: ex.targetWeight || 0,
          })),
        }))
      );
    } else {
      setLogName('Quick Workout');
      setLogPlanId(undefined);
      setLogExercises([]);
    }
    setLogDuration('');
    setLogStruggle(3);
    setLogEnergy(3);
    setLogNotes('');
    setModal('log-workout');
  };

  const finishWorkout = () => {
    const dur = parseInt(logDuration) || 0;
    addLog({
      planId: logPlanId,
      name: logName,
      exercises: logExercises,
      duration: dur,
      struggleRating: logStruggle,
      energyLevel: logEnergy,
      notes: logNotes || undefined,
      date: todayStr(),
    });
    addXp(50);
    setModal(null);
  };

  const addSetToExercise = (exIdx: number) => {
    setLogExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] }
          : ex
      )
    );
  };

  const updateSet = (exIdx: number, setIdx: number, field: keyof CompletedSet, value: number) => {
    setLogExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: value } : s)) }
          : ex
      )
    );
  };

  const removeSetFromExercise = (exIdx: number, setIdx: number) => {
    setLogExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) }
          : ex
      )
    );
  };

  const removeLogExercise = (exIdx: number) => {
    setLogExercises((prev) => prev.filter((_, i) => i !== exIdx));
  };

  const openExercisePicker = (target: 'plan' | 'log') => {
    setExercisePickerTarget(target);
    setExerciseSearch('');
    setExerciseFilter('All');
    setModal('add-exercise');
  };

  const pickExercise = (name: string, muscleGroup: string) => {
    if (exercisePickerTarget === 'log') {
      setLogExercises((prev) => [
        ...prev,
        { id: generateId(), name, sets: [{ reps: 0, weight: 0 }] },
      ]);
      setModal('log-workout');
    } else {
      setPlanExercises((prev) => [
        ...prev,
        { id: generateId(), name, muscleGroup, targetSets: 3, targetReps: 10 },
      ]);
      setModal(editingPlanId ? 'edit-plan' : 'create-plan');
    }
  };

  const openCreatePlan = () => {
    setPlanName('');
    setPlanDays([]);
    setPlanExercises([]);
    setEditingPlanId(null);
    setModal('create-plan');
  };

  const openEditPlan = (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    setPlanName(plan.name);
    setPlanDays([...plan.days]);
    setPlanExercises([...plan.exercises]);
    setEditingPlanId(id);
    setModal('edit-plan');
  };

  const savePlan = () => {
    if (!planName.trim()) return;
    if (editingPlanId) {
      updatePlan(editingPlanId, { name: planName, days: planDays, exercises: planExercises });
    } else {
      addPlan({ name: planName, days: planDays, exercises: planExercises });
    }
    setModal(null);
  };

  const updatePlanExercise = (idx: number, field: keyof PlannedExercise, value: number | string) => {
    setPlanExercises((prev) =>
      prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex))
    );
  };

  const removePlanExercise = (idx: number) => {
    setPlanExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const togglePlanDay = (day: number) => {
    setPlanDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const recentLogs = getRecentLogs(20);
  const avgStruggle = getAvgStruggle(7);
  const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Helper: get muscle group distribution for a workout log
  function getMuscleDistribution(exercises: LoggedExercise[]): { group: string; pct: number }[] {
    const groups: Record<string, number> = {};
    let total = 0;
    for (const ex of exercises) {
      const found = EXERCISE_LIBRARY.find((e) => e.name === ex.name);
      const group = found?.muscleGroup || 'Other';
      const setCount = ex.sets.length;
      groups[group] = (groups[group] || 0) + setCount;
      total += setCount;
    }
    if (total === 0) return [];
    return Object.entries(groups)
      .map(([group, count]) => ({ group, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3);
  }

  return (
    <div className="pb-24">
      <TopBar title="Workouts" subtitle={`${weekCount} this week`} />

      {/* Tab Pills */}
      <div className="px-4 mt-2 mb-4">
        <div className="flex gap-1 p-1 rounded-xl bg-[#1a1a24] border border-white/[0.06]">
          {(['today', 'plans', 'history'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all',
                tab === t
                  ? 'bg-[#00b4d8]/15 text-[#00b4d8]'
                  : 'text-slate-500'
              )}
            >
              {t === 'today' ? 'Today' : t === 'plans' ? 'Plans' : 'History'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        <AnimatePresence mode="wait">
          {/* ============ TODAY TAB ============ */}
          {tab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {/* Start Workout Button - Big and Prominent */}
              <button
                onClick={() => openLogWorkout(!!todayPlan)}
                className="w-full py-4 rounded-xl bg-[#00b4d8] text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-[#00b4d8]/20"
              >
                <Play size={20} /> Start Workout
              </button>

              {/* Week Overview */}
              <GlassCard>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#00b4d8]" />
                    <span className="text-sm font-medium text-slate-300">This Week</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {weekCount} workout{weekCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  {weekDays.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-slate-500">{weekLabels[i]}</span>
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                          day.isToday && 'ring-2 ring-[#00b4d8] ring-offset-2 ring-offset-[#0f0f14]',
                          day.hasLogged
                            ? 'bg-[#00b4d8]'
                            : day.hasPlanned
                              ? 'bg-[#00b4d8]/20'
                              : 'bg-white/[0.04]'
                        )}
                      >
                        {day.hasLogged ? (
                          <Dumbbell size={12} className="text-white" />
                        ) : day.hasPlanned ? (
                          <div className="w-2 h-2 rounded-full bg-[#00b4d8]" />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Today's Plan */}
              {todayPlan && (
                <GlassCard>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#00b4d8]/10 flex items-center justify-center">
                      <Dumbbell size={18} className="text-[#00b4d8]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{todayPlan.name}</p>
                      <p className="text-xs text-slate-500">
                        {todayPlan.exercises.length} exercise{todayPlan.exercises.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {todayPlan.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.03]"
                      >
                        <div>
                          <p className="text-xs font-medium text-slate-300">{ex.name}</p>
                          <p className="text-[10px] text-slate-500">{ex.muscleGroup}</p>
                        </div>
                        <p className="text-xs text-slate-400 tabular-nums">
                          {ex.targetSets}x{ex.targetReps}
                          {ex.targetWeight ? ` @ ${ex.targetWeight}lb` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Today's logged workouts */}
              {logs.filter((l) => l.date === todayStr()).length > 0 && (
                <div>
                  <h3 className="text-xs text-slate-400 font-medium mb-2 px-1">
                    Completed Today
                  </h3>
                  <div className="space-y-2">
                    {logs
                      .filter((l) => l.date === todayStr())
                      .map((log) => (
                        <GlassCard key={log.id} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Dumbbell size={16} className="text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{log.name}</p>
                            <p className="text-xs text-slate-500">
                              {log.duration}min · {log.exercises.length} exercise{log.exercises.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </GlassCard>
                      ))}
                  </div>
                </div>
              )}

              {!todayPlan && logs.filter((l) => l.date === todayStr()).length === 0 && (
                <GlassCard className="text-center py-6">
                  <Dumbbell size={28} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No plan scheduled for today</p>
                  <p className="text-xs text-slate-500 mt-1">Hit the button above to start a workout</p>
                </GlassCard>
              )}
            </motion.div>
          )}

          {/* ============ PLANS TAB ============ */}
          {tab === 'plans' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              <button
                onClick={openCreatePlan}
                className="w-full py-3 rounded-xl bg-[#00b4d8]/15 border border-[#00b4d8]/20 text-[#00b4d8] font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Plus size={16} /> New Plan
              </button>

              {plans.length === 0 ? (
                <GlassCard className="text-center py-8">
                  <Dumbbell size={28} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No workout plans yet</p>
                  <p className="text-xs text-slate-500 mt-1">Create a plan to schedule your training</p>
                </GlassCard>
              ) : (
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <GlassCard key={plan.id}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 cursor-pointer" onClick={() => openEditPlan(plan.id)}>
                          <p className="text-sm font-medium text-white">{plan.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {plan.exercises.length} exercise{plan.exercises.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex gap-1.5 mb-3">
                        {DAY_LABELS.map((label, dow) => (
                          <span
                            key={dow}
                            className={cn(
                              'w-7 h-7 rounded-lg text-[10px] font-medium flex items-center justify-center',
                              plan.days.includes(dow)
                                ? 'bg-[#00b4d8]/15 text-[#00b4d8]'
                                : 'bg-white/[0.03] text-slate-600'
                            )}
                          >
                            {label.charAt(0)}
                          </span>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {plan.exercises.slice(0, 3).map((ex) => (
                          <p key={ex.id} className="text-xs text-slate-400 truncate">
                            {ex.name} · {ex.targetSets}x{ex.targetReps}
                            {ex.targetWeight ? ` @ ${ex.targetWeight}lb` : ''}
                          </p>
                        ))}
                        {plan.exercises.length > 3 && (
                          <p className="text-[10px] text-slate-500">+{plan.exercises.length - 3} more</p>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ============ HISTORY TAB ============ */}
          {tab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3">
                <GlassCard className="text-center py-3">
                  <p className="text-2xl font-bold text-white">{weekCount}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">This Week</p>
                </GlassCard>
                <GlassCard className="text-center py-3">
                  <p className="text-2xl font-bold text-white">
                    {avgStruggle > 0 ? avgStruggle.toFixed(1) : '--'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Avg Difficulty</p>
                </GlassCard>
              </div>

              {recentLogs.length === 0 ? (
                <GlassCard className="text-center py-8">
                  <Clock size={24} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No workouts logged yet</p>
                </GlassCard>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    const muscles = getMuscleDistribution(log.exercises);
                    const totalSets = log.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

                    return (
                      <GlassCard key={log.id} className="!p-0 overflow-hidden">
                        <div
                          className="flex items-center gap-3 p-4 cursor-pointer"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#00b4d8]/10 flex items-center justify-center shrink-0">
                            <Dumbbell size={18} className="text-[#00b4d8]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{log.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-slate-500">
                                {new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span className="text-[10px] text-slate-600">·</span>
                              <span className="text-[10px] text-slate-500">{log.duration}min</span>
                              <span className="text-[10px] text-slate-600">·</span>
                              <span className="text-[10px] text-slate-500">{totalSets} sets</span>
                            </div>
                            {muscles.length > 0 && (
                              <div className="flex gap-1 mt-1.5">
                                {muscles.map((m) => (
                                  <span key={m.group} className="text-[9px] text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                                    {m.group} {m.pct}%
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-slate-500 shrink-0" />
                          ) : (
                            <ChevronDown size={16} className="text-slate-500 shrink-0" />
                          )}
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-0 space-y-2 border-t border-white/[0.04]">
                                {log.exercises.map((ex) => (
                                  <div key={ex.id} className="pt-2">
                                    <p className="text-xs font-medium text-slate-300 mb-1">{ex.name}</p>
                                    <div className="space-y-0.5">
                                      {ex.sets.map((set, si) => (
                                        <p key={si} className="text-[10px] text-slate-500 pl-2">
                                          Set {si + 1}: {set.reps} reps
                                          {set.weight ? ` @ ${set.weight}lb` : ''}
                                          {set.rpe ? ` (RPE ${set.rpe})` : ''}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                                {log.notes && (
                                  <p className="text-[10px] text-slate-500 italic pt-1">
                                    &ldquo;{log.notes}&rdquo;
                                  </p>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteLog(log.id);
                                    setExpandedLogId(null);
                                  }}
                                  className="flex items-center gap-1 text-[10px] text-red-400/60 hover:text-red-400 pt-1 transition-colors"
                                >
                                  <Trash2 size={10} /> Delete
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============ LOG WORKOUT MODAL ============ */}
      <Modal open={modal === 'log-workout'} onClose={() => setModal(null)} title="Log Workout">
        <div className="space-y-5">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Workout Name</label>
            <input
              type="text"
              value={logName}
              onChange={(e) => setLogName(e.target.value)}
              placeholder="e.g. Push Day"
              className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00b4d8]/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400">Exercises</label>
              <button
                onClick={() => openExercisePicker('log')}
                className="text-xs text-[#00b4d8] flex items-center gap-1"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            {logExercises.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">
                No exercises yet. Tap + Add to begin.
              </p>
            )}

            <div className="space-y-3">
              {logExercises.map((ex, exIdx) => (
                <div key={ex.id} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-300">{ex.name}</p>
                    <button onClick={() => removeLogExercise(exIdx)} className="text-slate-500 hover:text-red-400 p-1">
                      <X size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-[2rem_1fr_1fr_1.5rem] gap-2 mb-1 px-1">
                    <span className="text-[9px] text-slate-500">Set</span>
                    <span className="text-[9px] text-slate-500">Reps</span>
                    <span className="text-[9px] text-slate-500">Weight</span>
                    <span />
                  </div>

                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} className="grid grid-cols-[2rem_1fr_1fr_1.5rem] gap-2 items-center mb-1.5">
                      <span className="text-[10px] text-slate-500 text-center">{setIdx + 1}</span>
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white/[0.06] border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white text-center outline-none focus:border-[#00b4d8]/50"
                      />
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white/[0.06] border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white text-center outline-none focus:border-[#00b4d8]/50"
                      />
                      <button onClick={() => removeSetFromExercise(exIdx, setIdx)} className="text-slate-600 hover:text-red-400 p-0.5">
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addSetToExercise(exIdx)}
                    className="text-[10px] text-[#00b4d8] mt-1 flex items-center gap-1"
                  >
                    <Plus size={10} /> Add Set
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Duration (minutes)</label>
            <input
              type="number"
              value={logDuration}
              onChange={(e) => setLogDuration(e.target.value)}
              placeholder="e.g. 60"
              className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00b4d8]/50"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">How hard was it?</label>
            <div className="flex justify-between">
              {([1, 2, 3, 4, 5] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setLogStruggle(val)}
                  className={cn(
                    'w-12 h-12 rounded-xl text-xl flex items-center justify-center transition-all border',
                    logStruggle === val
                      ? 'bg-[#00b4d8]/15 border-[#00b4d8]/30 scale-110'
                      : 'bg-white/[0.04] border-white/[0.06]'
                  )}
                >
                  {STRUGGLE_EMOJIS[val]}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1 px-1">
              <span className="text-[9px] text-slate-500">Easy</span>
              <span className="text-[9px] text-slate-500">Brutal</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">Energy Level</label>
            <div className="flex justify-between">
              {([1, 2, 3, 4, 5] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setLogEnergy(val)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border transition-all',
                    logEnergy === val
                      ? 'bg-white/[0.08] border-white/[0.12] scale-105'
                      : 'border-transparent'
                  )}
                >
                  <div className={cn('w-4 h-4 rounded-full', ENERGY_COLORS[val])} />
                  <span className="text-[9px] text-slate-500">{val}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Quick Notes</label>
            <textarea
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="How did it feel? Any PRs?"
              rows={2}
              className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00b4d8]/50 resize-none"
            />
          </div>

          <button
            onClick={finishWorkout}
            className="w-full py-3 rounded-xl bg-[#00b4d8] text-white font-medium text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Dumbbell size={16} /> Finish Workout
          </button>
        </div>
      </Modal>

      {/* ============ CREATE / EDIT PLAN MODAL ============ */}
      <Modal
        open={modal === 'create-plan' || modal === 'edit-plan'}
        onClose={() => setModal(null)}
        title={editingPlanId ? 'Edit Plan' : 'Create Plan'}
      >
        <div className="space-y-5">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Plan Name</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g. Push Day, Upper Body"
              className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00b4d8]/50"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">Schedule Days</label>
            <div className="flex gap-2">
              {DAY_LABELS.map((label, dow) => (
                <button
                  key={dow}
                  onClick={() => togglePlanDay(dow)}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg text-xs font-medium border transition-all',
                    planDays.includes(dow)
                      ? 'bg-[#00b4d8]/15 border-[#00b4d8]/30 text-[#00b4d8]'
                      : 'bg-white/[0.04] border-white/[0.06] text-slate-500'
                  )}
                >
                  {label.slice(0, 2)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400">Exercises</label>
              <button
                onClick={() => openExercisePicker('plan')}
                className="text-xs text-[#00b4d8] flex items-center gap-1"
              >
                <Plus size={12} /> Add Exercise
              </button>
            </div>

            {planExercises.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">No exercises added yet</p>
            )}

            <div className="space-y-2">
              {planExercises.map((ex, idx) => (
                <div key={ex.id} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-medium text-slate-300">{ex.name}</p>
                      <p className="text-[10px] text-slate-500">{ex.muscleGroup}</p>
                    </div>
                    <button onClick={() => removePlanExercise(idx)} className="text-slate-500 hover:text-red-400 p-1">
                      <X size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 block mb-0.5">Sets</label>
                      <input
                        type="number"
                        value={ex.targetSets || ''}
                        onChange={(e) => updatePlanExercise(idx, 'targetSets', parseInt(e.target.value) || 0)}
                        className="w-full bg-white/[0.06] border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white text-center outline-none focus:border-[#00b4d8]/50"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 block mb-0.5">Reps</label>
                      <input
                        type="number"
                        value={ex.targetReps || ''}
                        onChange={(e) => updatePlanExercise(idx, 'targetReps', parseInt(e.target.value) || 0)}
                        className="w-full bg-white/[0.06] border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white text-center outline-none focus:border-[#00b4d8]/50"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 block mb-0.5">Weight</label>
                      <input
                        type="number"
                        value={ex.targetWeight || ''}
                        onChange={(e) => updatePlanExercise(idx, 'targetWeight', parseFloat(e.target.value) || 0)}
                        placeholder="opt"
                        className="w-full bg-white/[0.06] border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white text-center outline-none focus:border-[#00b4d8]/50 placeholder-slate-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={savePlan}
            disabled={!planName.trim()}
            className={cn(
              'w-full py-3 rounded-xl font-medium text-sm active:scale-[0.98] transition-transform',
              planName.trim()
                ? 'bg-[#00b4d8] text-white'
                : 'bg-white/[0.06] text-slate-500 cursor-not-allowed'
            )}
          >
            {editingPlanId ? 'Update Plan' : 'Save Plan'}
          </button>
        </div>
      </Modal>

      {/* ============ EXERCISE PICKER MODAL ============ */}
      <Modal
        open={modal === 'add-exercise'}
        onClose={() =>
          setModal(
            exercisePickerTarget === 'log'
              ? 'log-workout'
              : editingPlanId
                ? 'edit-plan'
                : 'create-plan'
          )
        }
        title="Add Exercise"
      >
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00b4d8]/50"
              autoFocus
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {['All', ...MUSCLE_GROUPS].map((group) => (
              <button
                key={group}
                onClick={() => setExerciseFilter(group)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap border transition-colors',
                  exerciseFilter === group
                    ? 'bg-[#00b4d8]/15 border-[#00b4d8]/30 text-[#00b4d8]'
                    : 'bg-white/[0.04] border-white/[0.06] text-slate-500'
                )}
              >
                {group}
              </button>
            ))}
          </div>

          <div className="space-y-1 max-h-[40vh] overflow-y-auto">
            {filteredExercises.map((ex) => (
              <button
                key={ex.name}
                onClick={() => pickExercise(ex.name, ex.muscleGroup)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.08] transition-colors text-left"
              >
                <div>
                  <p className="text-xs font-medium text-white">{ex.name}</p>
                  <p className="text-[10px] text-slate-500">{ex.muscleGroup}</p>
                </div>
                <Plus size={14} className="text-slate-500" />
              </button>
            ))}
            {filteredExercises.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No exercises found</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

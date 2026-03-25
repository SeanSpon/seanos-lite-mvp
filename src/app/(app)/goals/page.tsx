'use client';
import { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useGoalStore } from '@/stores/useGoalStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Modal } from '@/components/ui/Modal';
import { FAB } from '@/components/ui/FAB';
import { TopBar } from '@/components/layout/TopBar';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GoalsPage() {
  const hydrated = useHydration();
  const { goals, addGoal, deleteGoal, addMilestone, toggleMilestone, getProgress } = useGoalStore();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState('');

  if (!hydrated) return <div className="min-h-screen bg-[#0a0a0f]" />;

  const handleAdd = () => {
    if (!title.trim()) return;
    addGoal({ title: title.trim(), description: description.trim() || undefined });
    setTitle('');
    setDescription('');
    setShowAdd(false);
  };

  const handleAddMilestone = (goalId: string) => {
    if (!newMilestone.trim()) return;
    addMilestone(goalId, newMilestone.trim());
    setNewMilestone('');
  };

  return (
    <div>
      <TopBar title="Goals" subtitle={`${goals.length} goals`} />

      <div className="px-4 space-y-3 mt-2">
        {goals.length === 0 ? (
          <GlassCard className="text-center py-10">
            <p className="text-3xl mb-2">🎯</p>
            <p className="text-sm text-slate-400">No goals yet. Set your first one.</p>
          </GlassCard>
        ) : (
          goals.map((goal) => {
            const progress = getProgress(goal.id);
            const isExpanded = expanded === goal.id;

            return (
              <GlassCard key={goal.id}>
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : goal.id)}
                >
                  <ProgressRing value={progress} max={100} size={48} color="#8b5cf6">
                    <span className="text-[10px] font-bold text-purple-400">{progress}%</span>
                  </ProgressRing>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{goal.title}</p>
                    {goal.description && (
                      <p className="text-xs text-slate-500 truncate">{goal.description}</p>
                    )}
                    <p className="text-[10px] text-slate-600">
                      {goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length} milestones
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
                    {goal.milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => toggleMilestone(goal.id, m.id)}
                        className="flex items-center gap-2 cursor-pointer py-1"
                      >
                        {m.completed ? (
                          <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                        ) : (
                          <Circle size={18} className="text-slate-600 shrink-0" />
                        )}
                        <span className={cn('text-sm', m.completed && 'line-through text-slate-500')}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input
                        value={newMilestone}
                        onChange={(e) => setNewMilestone(e.target.value)}
                        placeholder="Add milestone..."
                        className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(goal.id)}
                      />
                      <button
                        onClick={() => handleAddMilestone(goal.id)}
                        className="px-3 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-xs"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })
        )}
      </div>

      <FAB onClick={() => setShowAdd(true)} />

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Goal">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Goal</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hit 150 lbs bodyweight"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={2}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none resize-none"
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-full py-3 rounded-xl bg-purple-500 text-white font-medium text-sm active:scale-[0.98] transition-transform"
          >
            Create Goal
          </button>
        </div>
      </Modal>
    </div>
  );
}

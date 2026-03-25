'use client';
import { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { usePracticeStore } from '@/stores/usePracticeStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Modal } from '@/components/ui/Modal';
import { TopBar } from '@/components/layout/TopBar';
import { todayStr, formatDate, cn } from '@/lib/utils';
import {
  Star,
  Clock,
  Flame,
  TrendingUp,
  Plus,
  Trash2,
  Music,
  FileText,
  CalendarDays,
} from 'lucide-react';

function StarRating({
  value,
  onChange,
  size = 20,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          disabled={!onChange}
          className={cn('transition-colors', onChange && 'active:scale-110')}
        >
          <Star
            size={size}
            className={i <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
          />
        </button>
      ))}
    </div>
  );
}

export default function PracticePage() {
  const hydrated = useHydration();
  const {
    skills,
    addLog,
    deleteLog,
    addSkill,
    getLogsForDate,
    getLogsForSkill,
    getTotalMinutes,
    getWeekMinutes,
    getStreak,
    getAvgRating,
  } = usePracticeStore();
  const addXp = usePlayerStore((s) => s.addXp);

  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [showLog, setShowLog] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');

  // Log form state
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');
  const [pieces, setPieces] = useState('');

  if (!hydrated) return <div className="min-h-screen bg-[#0f0f14]" />;

  // Default to first skill if none selected
  const activeSkill = selectedSkill || skills[0] || '';

  const totalMinutes = activeSkill ? getTotalMinutes(activeSkill) : 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainderMins = totalMinutes % 60;
  const weekMins = activeSkill ? getWeekMinutes(activeSkill) : 0;
  const streak = activeSkill ? getStreak(activeSkill) : 0;
  const avgRating = activeSkill ? getAvgRating(activeSkill, 30) : 0;

  const todaySessions = activeSkill
    ? getLogsForDate(todayStr()).filter((l) => l.skill === activeSkill)
    : [];

  const recentForSkill = activeSkill
    ? getLogsForSkill(activeSkill).slice(0, 10)
    : [];

  const handleSubmitLog = () => {
    const dur = parseInt(duration);
    if (!dur || dur <= 0 || !activeSkill) return;

    addLog({
      skill: activeSkill,
      duration: dur,
      rating,
      notes: notes.trim() || undefined,
      pieces: pieces.trim()
        ? pieces.split(',').map((p) => p.trim()).filter(Boolean)
        : undefined,
      date: todayStr(),
    });
    addXp(15);

    // Reset form
    setDuration('');
    setRating(3);
    setNotes('');
    setPieces('');
    setShowLog(false);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    addSkill(newSkillName.trim());
    setSelectedSkill(newSkillName.trim());
    setNewSkillName('');
    setShowAddSkill(false);
  };

  return (
    <div>
      <TopBar title="Practice" />

      <div className="px-4 space-y-4 mt-2">
        {/* Skill Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {skills.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                activeSkill === skill
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
              )}
            >
              {skill}
            </button>
          ))}
          <button
            onClick={() => setShowAddSkill(true)}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Skill Overview Card */}
        {activeSkill && (
          <GlassCard glow>
            <div className="flex items-center gap-2 mb-3">
              <Music size={18} className="text-indigo-400" />
              <h2 className="text-lg font-bold">{activeSkill}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock size={14} className="text-blue-400" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total</span>
                </div>
                <p className="text-lg font-bold">
                  {totalHours}h {remainderMins}m
                </p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">This Week</span>
                </div>
                <p className="text-lg font-bold">{weekMins}m</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Flame size={14} className="text-amber-400" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Streak</span>
                </div>
                <p className="text-lg font-bold">
                  {streak} <span className="text-sm text-slate-400">days</span>
                </p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Star size={14} className="text-amber-400" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Avg Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <StarRating value={Math.round(avgRating)} size={14} onChange={undefined as never} />
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Log Practice Button */}
        <button
          onClick={() => setShowLog(true)}
          className="w-full py-3.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Plus size={18} />
          Log Practice
        </button>

        {/* Today's Sessions */}
        {todaySessions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2 px-1">
              Today&apos;s Sessions
            </h3>
            <div className="space-y-2">
              {todaySessions.map((log) => (
                <GlassCard key={log.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Clock size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{log.duration}m</p>
                      <StarRating value={log.rating} size={12} onChange={undefined as never} />
                    </div>
                    {log.notes && (
                      <p className="text-xs text-slate-400 truncate">{log.notes}</p>
                    )}
                    {log.pieces && log.pieces.length > 0 && (
                      <p className="text-[10px] text-slate-500 truncate">
                        {log.pieces.join(', ')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Recent History */}
        {recentForSkill.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2 px-1">
              Recent History
            </h3>
            <div className="space-y-2">
              {recentForSkill.map((log) => (
                <GlassCard key={log.id} className="py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-slate-500" />
                      <span className="text-xs text-slate-400">
                        {formatDate(new Date(log.date + 'T00:00:00'))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{log.duration}m</span>
                      <StarRating value={log.rating} size={11} onChange={undefined as never} />
                    </div>
                  </div>
                  {log.notes && (
                    <p className="text-xs text-slate-400 mt-1 flex items-start gap-1.5">
                      <FileText size={12} className="text-slate-500 mt-0.5 flex-shrink-0" />
                      {log.notes}
                    </p>
                  )}
                  {log.pieces && log.pieces.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {log.pieces.map((piece, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        >
                          {piece}
                        </span>
                      ))}
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {activeSkill && todaySessions.length === 0 && recentForSkill.length === 0 && (
          <GlassCard className="text-center py-8">
            <Music size={36} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No practice sessions yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Tap &quot;Log Practice&quot; to get started!
            </p>
          </GlassCard>
        )}

        {/* No skills empty state */}
        {skills.length === 0 && (
          <GlassCard className="text-center py-8">
            <Plus size={36} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Add a skill to start tracking.</p>
          </GlassCard>
        )}

        {/* Bottom spacer for nav */}
        <div className="h-20" />
      </div>

      {/* Log Practice Modal */}
      <Modal open={showLog} onClose={() => setShowLog(false)} title="Log Practice">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Skill</label>
            <div className="bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white">
              {activeSkill}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Duration (minutes)</label>
            <input
              type="number"
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 30"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">Rating</label>
            <StarRating value={rating} onChange={(v) => setRating(v as 1 | 2 | 3 | 4 | 5)} size={28} />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you work on?"
              rows={3}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Pieces / Topics (comma separated, optional)
            </label>
            <input
              value={pieces}
              onChange={(e) => setPieces(e.target.value)}
              placeholder="e.g. Clair de Lune, Scales"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
            />
          </div>

          <button
            onClick={handleSubmitLog}
            disabled={!duration || parseInt(duration) <= 0}
            className={cn(
              'w-full py-3 rounded-xl font-medium text-sm active:scale-[0.98] transition-all',
              duration && parseInt(duration) > 0
                ? 'bg-indigo-500 text-white'
                : 'bg-white/[0.06] text-slate-500 cursor-not-allowed'
            )}
          >
            Save Session (+15 XP)
          </button>
        </div>
      </Modal>

      {/* Add Skill Modal */}
      <Modal open={showAddSkill} onClose={() => setShowAddSkill(false)} title="Add Skill">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Skill Name</label>
            <input
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. Drums, Drawing, Spanish"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
            />
          </div>
          <button
            onClick={handleAddSkill}
            disabled={!newSkillName.trim()}
            className={cn(
              'w-full py-3 rounded-xl font-medium text-sm active:scale-[0.98] transition-all',
              newSkillName.trim()
                ? 'bg-indigo-500 text-white'
                : 'bg-white/[0.06] text-slate-500 cursor-not-allowed'
            )}
          >
            Add Skill
          </button>
        </div>
      </Modal>
    </div>
  );
}

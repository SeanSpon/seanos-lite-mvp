'use client';
import { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useJournalStore } from '@/stores/useJournalStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Modal } from '@/components/ui/Modal';
import { FAB } from '@/components/ui/FAB';
import { TopBar } from '@/components/layout/TopBar';
import { formatDate } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import type { JournalEntry } from '@/types';

const moods: { value: JournalEntry['mood']; emoji: string }[] = [
  { value: 'great', emoji: '🔥' },
  { value: 'good', emoji: '😊' },
  { value: 'okay', emoji: '😐' },
  { value: 'bad', emoji: '😔' },
  { value: 'awful', emoji: '😫' },
];

export default function JournalPage() {
  const hydrated = useHydration();
  const { entries, addEntry, deleteEntry } = useJournalStore();
  const [showAdd, setShowAdd] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>(undefined);
  const [title, setTitle] = useState('');

  if (!hydrated) return <div className="min-h-screen bg-[#0a0a0f]" />;

  const handleAdd = () => {
    if (!content.trim()) return;
    addEntry({ content: content.trim(), title: title.trim() || undefined, mood, tags: [] });
    setContent('');
    setTitle('');
    setMood(undefined);
    setShowAdd(false);
  };

  return (
    <div>
      <TopBar title="Journal" subtitle={`${entries.length} entries`} />

      <div className="px-4 space-y-3 mt-2">
        {entries.length === 0 ? (
          <GlassCard className="text-center py-10">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm text-slate-400">No journal entries yet.</p>
            <p className="text-xs text-slate-500 mt-1">Tap + to write your first one.</p>
          </GlassCard>
        ) : (
          entries.map((entry) => (
            <GlassCard key={entry.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  {entry.title && <p className="text-sm font-semibold">{entry.title}</p>}
                  <p className="text-xs text-slate-500">{formatDate(entry.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {entry.mood && (
                    <span className="text-lg">
                      {moods.find((m) => m.value === entry.mood)?.emoji}
                    </span>
                  )}
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-1 rounded hover:bg-white/10 text-slate-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap line-clamp-4">
                {entry.content}
              </p>
            </GlassCard>
          ))
        )}
      </div>

      <FAB onClick={() => setShowAdd(true)} />

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Entry">
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={5}
            className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 resize-none"
            autoFocus
          />
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Mood</label>
            <div className="flex gap-3">
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(mood === m.value ? undefined : m.value)}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    mood === m.value ? 'bg-white/10 scale-110' : 'opacity-50'
                  }`}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="w-full py-3 rounded-xl bg-emerald-500 text-white font-medium text-sm active:scale-[0.98] transition-transform"
          >
            Save Entry
          </button>
        </div>
      </Modal>
    </div>
  );
}

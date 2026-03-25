'use client';
import { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useTaskStore } from '@/stores/useTaskStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Modal } from '@/components/ui/Modal';
import { FAB } from '@/components/ui/FAB';
import { TopBar } from '@/components/layout/TopBar';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { cn, todayStr } from '@/lib/utils';
import type { Task } from '@/types';

type Filter = 'all' | 'todo' | 'done';

export default function TasksPage() {
  const hydrated = useHydration();
  const { tasks, projects, addTask, toggleTask, deleteTask } = useTaskStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');

  if (!hydrated) return <div className="min-h-screen bg-[#0a0a0f]" />;

  const filtered = tasks.filter((t) => {
    if (filter === 'todo') return t.status !== 'done';
    if (filter === 'done') return t.status === 'done';
    return true;
  });

  const handleAdd = () => {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      status: 'todo',
      priority,
      dueDate: dueDate || undefined,
      projectId: projectId || undefined,
    });
    setTitle('');
    setPriority('medium');
    setDueDate('');
    setProjectId('');
    setShowAdd(false);
  };

  return (
    <div>
      <TopBar title="Tasks" subtitle={`${tasks.filter((t) => t.status !== 'done').length} pending`} />

      {/* Filters */}
      <div className="flex gap-2 px-4 mt-2 mb-3">
        {(['all', 'todo', 'done'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium transition-colors',
              filter === f
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
            )}
          >
            {f === 'all' ? 'All' : f === 'todo' ? 'To Do' : 'Done'}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="px-4 space-y-2">
        {filtered.length === 0 ? (
          <GlassCard className="text-center py-8">
            <p className="text-sm text-slate-400">No tasks yet. Tap + to add one.</p>
          </GlassCard>
        ) : (
          filtered.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            return (
              <GlassCard key={task.id} className="flex items-center gap-3 py-3">
                <button onClick={() => toggleTask(task.id)} className="shrink-0">
                  {task.status === 'done' ? (
                    <CheckCircle2 size={22} className="text-green-400" />
                  ) : (
                    <Circle
                      size={22}
                      className={
                        task.priority === 'high'
                          ? 'text-red-400'
                          : task.priority === 'medium'
                          ? 'text-amber-400'
                          : 'text-slate-500'
                      }
                    />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium truncate',
                      task.status === 'done' && 'line-through text-slate-500'
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {project && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: project.color + '20',
                          color: project.color,
                        }}
                      >
                        {project.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-[10px] text-slate-500">{task.dueDate}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500"
                >
                  <Trash2 size={16} />
                </button>
              </GlassCard>
            );
          })
        )}
      </div>

      <FAB onClick={() => setShowAdd(true)} />

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Task">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-medium border transition-colors capitalize',
                    priority === p
                      ? p === 'high'
                        ? 'bg-red-500/20 border-red-500/30 text-red-400'
                        : p === 'medium'
                        ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                        : 'bg-slate-500/20 border-slate-500/30 text-slate-400'
                      : 'bg-white/[0.04] border-white/[0.06] text-slate-500'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Project</label>
            <div className="flex gap-2 flex-wrap">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProjectId(projectId === p.id ? '' : p.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    projectId === p.id
                      ? 'border-white/20 text-white'
                      : 'border-white/[0.06] text-slate-500'
                  )}
                  style={
                    projectId === p.id
                      ? { backgroundColor: p.color + '20', borderColor: p.color + '40' }
                      : undefined
                  }
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-3 rounded-xl bg-indigo-500 text-white font-medium text-sm active:scale-[0.98] transition-transform"
          >
            Add Task
          </button>
        </div>
      </Modal>
    </div>
  );
}

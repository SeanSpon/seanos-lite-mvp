import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Project } from '@/types';
import { generateId } from '@/lib/utils';

interface TaskState {
  tasks: Task[];
  projects: Project[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addProject: (name: string, color: string) => void;
  deleteProject: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      projects: [
        { id: 'school', name: 'School', color: '#3b82f6', createdAt: Date.now() },
        { id: 'seezee', name: 'SeeZee', color: '#8b5cf6', createdAt: Date.now() },
        { id: 'personal', name: 'Personal', color: '#22c55e', createdAt: Date.now() },
      ],
      addTask: (task) =>
        set((s) => ({
          tasks: [{ ...task, id: generateId(), createdAt: Date.now() }, ...s.tasks],
        })),
      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === 'done' ? 'todo' : 'done',
                  completedAt: t.status === 'done' ? undefined : Date.now(),
                }
              : t
          ),
        })),
      addProject: (name, color) =>
        set((s) => ({
          projects: [...s.projects, { id: generateId(), name, color, createdAt: Date.now() }],
        })),
      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
    }),
    { name: 'seanos-tasks' }
  )
);

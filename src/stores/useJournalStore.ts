import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JournalEntry } from '@/types';
import { generateId } from '@/lib/utils';

interface JournalState {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((s) => ({
          entries: [
            { ...entry, id: generateId(), createdAt: Date.now(), updatedAt: Date.now() },
            ...s.entries,
          ],
        })),
      updateEntry: (id, updates) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: Date.now() } : e
          ),
        })),
      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    { name: 'seanos-journal' }
  )
);

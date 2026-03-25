import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FocusSession, FocusSettings } from '@/types';
import { generateId } from '@/lib/utils';

interface FocusState {
  settings: FocusSettings;
  sessions: FocusSession[];
  isRunning: boolean;
  isPaused: boolean;
  currentType: 'work' | 'break';
  secondsRemaining: number;
  sessionCount: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  completeSession: () => void;
  updateSettings: (s: Partial<FocusSettings>) => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      settings: {
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        sessionsBeforeLongBreak: 4,
      },
      sessions: [],
      isRunning: false,
      isPaused: false,
      currentType: 'work',
      secondsRemaining: 25 * 60,
      sessionCount: 0,
      startTimer: () => set({ isRunning: true, isPaused: false }),
      pauseTimer: () => set({ isRunning: false, isPaused: true }),
      resetTimer: () => {
        const { settings, currentType } = get();
        const mins = currentType === 'work' ? settings.workMinutes : settings.shortBreakMinutes;
        set({ isRunning: false, isPaused: false, secondsRemaining: mins * 60 });
      },
      tick: () => {
        const { secondsRemaining } = get();
        if (secondsRemaining <= 1) {
          get().completeSession();
        } else {
          set({ secondsRemaining: secondsRemaining - 1 });
        }
      },
      completeSession: () => {
        const { settings, currentType, sessionCount } = get();
        const session: FocusSession = {
          id: generateId(),
          duration: currentType === 'work' ? settings.workMinutes * 60 : settings.shortBreakMinutes * 60,
          elapsed: currentType === 'work' ? settings.workMinutes * 60 : settings.shortBreakMinutes * 60,
          type: currentType,
          completedAt: Date.now(),
        };
        const newCount = currentType === 'work' ? sessionCount + 1 : sessionCount;
        const nextType = currentType === 'work' ? 'break' : 'work';
        const nextMins =
          nextType === 'work'
            ? settings.workMinutes
            : newCount % settings.sessionsBeforeLongBreak === 0
            ? settings.longBreakMinutes
            : settings.shortBreakMinutes;

        set({
          sessions: [session, ...get().sessions].slice(0, 50),
          isRunning: false,
          isPaused: false,
          currentType: nextType,
          secondsRemaining: nextMins * 60,
          sessionCount: newCount,
        });
      },
      updateSettings: (s) =>
        set((state) => ({
          settings: { ...state.settings, ...s },
          secondsRemaining: state.isRunning
            ? state.secondsRemaining
            : (s.workMinutes || state.settings.workMinutes) * 60,
        })),
    }),
    {
      name: 'seanos-focus',
      partialize: (state) => ({
        settings: state.settings,
        sessions: state.sessions,
        sessionCount: state.sessionCount,
      }),
    }
  )
);

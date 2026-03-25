'use client';
import { useEffect, useRef } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useFocusStore } from '@/stores/useFocusStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { TopBar } from '@/components/layout/TopBar';
import { Play, Pause, RotateCcw, SkipForward, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FocusPage() {
  const hydrated = useHydration();
  const {
    settings,
    sessions,
    isRunning,
    isPaused,
    currentType,
    secondsRemaining,
    sessionCount,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    completeSession,
  } = useFocusStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  if (!hydrated) return <div className="min-h-screen bg-[#0a0a0f]" />;

  const totalSeconds =
    currentType === 'work'
      ? settings.workMinutes * 60
      : settings.shortBreakMinutes * 60;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const todaySessions = sessions.filter((s) => {
    const today = new Date().toISOString().split('T')[0];
    const sessionDay = new Date(s.completedAt).toISOString().split('T')[0];
    return sessionDay === today && s.type === 'work';
  });

  const totalFocusMinutes = todaySessions.reduce((acc, s) => acc + s.duration / 60, 0);

  return (
    <div>
      <TopBar title="Focus Mode" subtitle={currentType === 'work' ? 'Work Session' : 'Break Time'} />

      <div className="px-4 space-y-6 mt-4">
        {/* Timer */}
        <div className="flex flex-col items-center">
          <ProgressRing
            value={totalSeconds - secondsRemaining}
            max={totalSeconds}
            size={220}
            strokeWidth={6}
            color={currentType === 'work' ? '#6366f1' : '#22c55e'}
          >
            <div className="text-center">
              <p className="text-4xl font-mono font-bold tracking-wider">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase">
                {currentType === 'work' ? 'Focus' : 'Break'}
              </p>
            </div>
          </ProgressRing>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={resetTimer}
              className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
            >
              <RotateCcw size={20} className="text-slate-400" />
            </button>

            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-lg',
                currentType === 'work'
                  ? 'bg-indigo-500 shadow-indigo-500/30'
                  : 'bg-green-500 shadow-green-500/30'
              )}
            >
              {isRunning ? (
                <Pause size={28} className="text-white" />
              ) : (
                <Play size={28} className="text-white ml-1" />
              )}
            </button>

            <button
              onClick={completeSession}
              className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
            >
              <SkipForward size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Session Counter */}
          <div className="flex gap-2 mt-6">
            {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-3 h-3 rounded-full transition-colors',
                  i < (sessionCount % settings.sessionsBeforeLongBreak)
                    ? 'bg-indigo-500'
                    : 'bg-white/[0.08]'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Session {(sessionCount % settings.sessionsBeforeLongBreak) + 1} of {settings.sessionsBeforeLongBreak}
          </p>
        </div>

        {/* Today's Stats */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-indigo-400" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <span className="text-sm text-slate-400">
              {todaySessions.length} sessions / {totalFocusMinutes} min
            </span>
          </div>
        </GlassCard>

        {/* Recent Sessions */}
        {todaySessions.length > 0 && (
          <div>
            <h3 className="text-xs text-slate-500 mb-2 px-1">Recent</h3>
            <div className="space-y-1">
              {todaySessions.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 px-1">
                  <span className="text-xs text-slate-400">
                    {new Date(s.completedAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-xs text-slate-500">{s.duration / 60} min</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

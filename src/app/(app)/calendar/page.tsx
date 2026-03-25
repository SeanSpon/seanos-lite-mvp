'use client';
import { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { GlassCard } from '@/components/ui/GlassCard';
import { Modal } from '@/components/ui/Modal';
import { FAB } from '@/components/ui/FAB';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalendarEvent } from '@/types';

// Inline store for calendar
const useCalendarStore = create<{
  events: CalendarEvent[];
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
}>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (e) =>
        set((s) => ({
          events: [...s.events, { ...e, id: crypto.randomUUID() }],
        })),
      deleteEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    { name: 'seanos-calendar' }
  )
);

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  const hydrated = useHydration();
  const { events, addEvent, deleteEvent } = useCalendarStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);

  if (!hydrated) return <div className="min-h-screen bg-[#0f0f14]" />;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dayEvents = events.filter((e) => {
    const d = new Date(e.startTime).toISOString().split('T')[0];
    return d === selectedDateStr;
  });

  const handleAdd = () => {
    if (!title.trim()) return;
    const dateStr = selectedDateStr;
    const start = new Date(`${dateStr}T${startTime}`).getTime();
    const end = new Date(`${dateStr}T${endTime}`).getTime();
    addEvent({ title: title.trim(), startTime: start, endTime: end, isAllDay: allDay });
    setTitle('');
    setShowAdd(false);
  };

  return (
    <div>
      <TopBar title="Calendar" subtitle={`${MONTHS[month]} ${year}`} />

      <div className="px-4 space-y-4 mt-2">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/10">
            <ChevronLeft size={20} className="text-slate-400" />
          </button>
          <h2 className="text-base font-semibold">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/10">
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] text-slate-500 font-medium py-1">
              {d}
            </div>
          ))}

          {/* Empty cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const hasEvents = events.some((e) => new Date(e.startTime).toISOString().split('T')[0] === dateStr);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-colors relative',
                  isSelected
                    ? 'bg-indigo-500 text-white'
                    : isToday
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'hover:bg-white/[0.06] text-slate-300'
                )}
              >
                {day}
                {hasEvents && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Events */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-2 px-1">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>
          {dayEvents.length === 0 ? (
            <GlassCard className="text-center py-6">
              <p className="text-sm text-slate-500">No events</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {dayEvents.map((e) => (
                <GlassCard key={e.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Clock size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{e.title}</p>
                    {!e.isAllDay && (
                      <p className="text-xs text-slate-400">
                        {new Date(e.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        {' - '}
                        {new Date(e.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEvent(e.id)}
                    className="text-xs text-slate-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <FAB onClick={() => setShowAdd(true)} />

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Event">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 flex items-center gap-2">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="rounded"
              />
              All day
            </label>
          </div>
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none"
                />
              </div>
            </div>
          )}
          <button
            onClick={handleAdd}
            className="w-full py-3 rounded-xl bg-indigo-500 text-white font-medium text-sm active:scale-[0.98] transition-transform"
          >
            Add Event
          </button>
        </div>
      </Modal>
    </div>
  );
}

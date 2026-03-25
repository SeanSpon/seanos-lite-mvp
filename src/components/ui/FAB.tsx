'use client';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FAB({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/30',
        'flex items-center justify-center active:scale-90 transition-transform',
        className
      )}
    >
      <Plus size={24} />
    </button>
  );
}

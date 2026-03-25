'use client';
import { cn } from '@/lib/utils';

export function ProgressBar({
  value,
  max,
  color = 'bg-indigo-500',
  className,
  showLabel,
}: {
  value: number;
  max: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{value.toLocaleString()}</span>
          <span>{max.toLocaleString()}</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

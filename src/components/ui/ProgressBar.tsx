'use client';
import { cn } from '@/lib/utils';

export function ProgressBar({
  value,
  max,
  color = 'bg-[#00b4d8]',
  className,
  showLabel,
  label,
  size = 'md',
}: {
  value: number;
  max: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3';

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>{label || ''}</span>
          <span className="text-slate-500">
            {Math.round(value)} / {Math.round(max)}
          </span>
        </div>
      )}
      <div className={cn(heightClass, 'rounded-full bg-white/[0.06] overflow-hidden')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

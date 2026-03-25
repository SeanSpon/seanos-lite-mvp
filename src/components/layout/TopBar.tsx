'use client';
import { cn } from '@/lib/utils';

export function TopBar({
  title,
  subtitle,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('sticky top-0 z-30 px-5 pt-[env(safe-area-inset-top)] bg-[#0a0a0f]/80 backdrop-blur-xl', className)}>
      <div className="flex items-center justify-between h-14">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 -mt-0.5">{subtitle}</p>}
        </div>
        {right && <div>{right}</div>}
      </div>
    </div>
  );
}

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
    <div className={cn('sticky top-0 z-30 px-5 pt-[env(safe-area-inset-top)] bg-[#0f0f14]/95 backdrop-blur-md border-b border-white/[0.04]', className)}>
      <div className="flex items-center justify-between h-14">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-[11px] text-slate-500 -mt-0.5">{subtitle}</p>}
        </div>
        {right && <div>{right}</div>}
      </div>
    </div>
  );
}

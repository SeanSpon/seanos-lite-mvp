'use client';
import { cn } from '@/lib/utils';

export function GlassCard({
  children,
  className,
  glow,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-white/[0.06] bg-[#1a1a24] p-4',
        glow && 'border-[#00b4d8]/20',
        onClick && 'cursor-pointer active:scale-[0.98] transition-transform',
        className
      )}
    >
      {children}
    </div>
  );
}

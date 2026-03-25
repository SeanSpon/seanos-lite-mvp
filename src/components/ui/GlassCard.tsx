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
        'relative rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-4',
        glow && 'shadow-[0_0_30px_rgba(99,102,241,0.15)]',
        onClick && 'cursor-pointer active:scale-[0.98] transition-transform',
        className
      )}
    >
      {children}
    </div>
  );
}

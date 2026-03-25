'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, Dumbbell, TrendingUp, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/nutrition', icon: UtensilsCrossed, label: 'Food' },
  { href: '/workouts', icon: Dumbbell, label: 'Train' },
  { href: '/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/habits', icon: MoreHorizontal, label: 'More' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0f0f14]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors',
                active ? 'text-[#00b4d8]' : 'text-slate-600'
              )}
            >
              <tab.icon size={22} strokeWidth={active ? 2.2 : 1.5} />
              <span className="text-[9px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

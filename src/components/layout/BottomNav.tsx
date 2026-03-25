'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Dumbbell,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Today' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/health', icon: Dumbbell, label: 'Fitness' },
  { href: '/habits', icon: MoreHorizontal, label: 'More' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[60px]',
                active ? 'text-indigo-400' : 'text-slate-500'
              )}
            >
              <tab.icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

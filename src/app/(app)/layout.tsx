'use client';
import { BottomNav } from '@/components/layout/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f14] text-slate-100">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}

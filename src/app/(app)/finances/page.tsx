'use client';
import { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { GlassCard } from '@/components/ui/GlassCard';
import { Modal } from '@/components/ui/Modal';
import { FAB } from '@/components/ui/FAB';
import { TopBar } from '@/components/layout/TopBar';
import { cn, todayStr } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction } from '@/types';

const useFinanceStore = create<{
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
}>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (t) =>
        set((s) => ({
          transactions: [
            { ...t, id: crypto.randomUUID(), createdAt: Date.now() },
            ...s.transactions,
          ],
        })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
    }),
    { name: 'seanos-finances' }
  )
);

const CATEGORIES = ['Food', 'Gas', 'Shopping', 'Bills', 'Entertainment', 'Home Depot', 'SeeZee', 'Other'];

export default function FinancesPage() {
  const hydrated = useHydration();
  const { transactions, addTransaction, deleteTransaction } = useFinanceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');

  if (!hydrated) return <div className="min-h-screen bg-[#0a0a0f]" />;

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthTxns = transactions.filter((t) => t.date.startsWith(thisMonth));
  const income = monthTxns.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expenses = monthTxns.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const balance = income - expenses;

  const handleAdd = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    addTransaction({
      type,
      amount: val,
      category,
      description: description.trim() || undefined,
      date: todayStr(),
    });
    setAmount('');
    setDescription('');
    setShowAdd(false);
  };

  return (
    <div>
      <TopBar title="Finances" subtitle={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />

      <div className="px-4 space-y-4 mt-2">
        {/* Balance */}
        <GlassCard glow className="text-center py-4">
          <p className="text-xs text-slate-400 mb-1">Monthly Balance</p>
          <p className={cn('text-3xl font-bold', balance >= 0 ? 'text-green-400' : 'text-red-400')}>
            ${Math.abs(balance).toFixed(2)}
          </p>
        </GlassCard>

        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Income</p>
              <p className="text-sm font-bold text-green-400">${income.toFixed(2)}</p>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <TrendingDown size={16} className="text-red-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Expenses</p>
              <p className="text-sm font-bold text-red-400">${expenses.toFixed(2)}</p>
            </div>
          </GlassCard>
        </div>

        {/* Transactions */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-2 px-1">Recent</h2>
          {transactions.length === 0 ? (
            <GlassCard className="text-center py-6">
              <DollarSign size={28} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No transactions yet</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 20).map((t) => (
                <GlassCard key={t.id} className="flex items-center gap-3 py-3">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center',
                      t.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                    )}
                  >
                    {t.type === 'income' ? (
                      <TrendingUp size={16} className="text-green-400" />
                    ) : (
                      <TrendingDown size={16} className="text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {t.description || t.category}
                    </p>
                    <p className="text-[10px] text-slate-500">{t.category} · {t.date}</p>
                  </div>
                  <p className={cn('text-sm font-semibold', t.type === 'income' ? 'text-green-400' : 'text-red-400')}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="p-1 rounded hover:bg-white/10 text-slate-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <FAB onClick={() => setShowAdd(true)} />

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Transaction">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setType('expense')}
              className={cn(
                'py-2.5 rounded-xl text-sm font-medium border transition-colors',
                type === 'expense'
                  ? 'bg-red-500/20 border-red-500/30 text-red-400'
                  : 'bg-white/[0.04] border-white/[0.06] text-slate-500'
              )}
            >
              Expense
            </button>
            <button
              onClick={() => setType('income')}
              className={cn(
                'py-2.5 rounded-xl text-sm font-medium border transition-colors',
                type === 'income'
                  ? 'bg-green-500/20 border-green-500/30 text-green-400'
                  : 'bg-white/[0.04] border-white/[0.06] text-slate-500'
              )}
            >
              Income
            </button>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-lg text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    category === c
                      ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                      : 'bg-white/[0.04] border-white/[0.06] text-slate-500'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Note</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>
          <button
            onClick={handleAdd}
            className={cn(
              'w-full py-3 rounded-xl text-white font-medium text-sm active:scale-[0.98] transition-transform',
              type === 'expense' ? 'bg-red-500' : 'bg-green-500'
            )}
          >
            Add {type === 'income' ? 'Income' : 'Expense'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useNutritionStore } from '@/stores/useNutritionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { FOOD_DATABASE } from '@/data/foodDatabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { TopBar } from '@/components/layout/TopBar';
import { todayStr, formatDate, cn } from '@/lib/utils';
import type { FoodItem, FoodLog } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Trash2,
  Minus,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Cookie,
  Sparkles,
  UtensilsCrossed,
  Coffee,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type MealType = FoodLog['meal'];

const MEALS: { key: MealType; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: <Coffee size={18} />, color: 'text-amber-400' },
  { key: 'lunch', label: 'Lunch', icon: <Sun size={18} />, color: 'text-green-400' },
  { key: 'dinner', label: 'Dinner', icon: <Moon size={18} />, color: 'text-blue-400' },
  { key: 'snack', label: 'Snack', icon: <Cookie size={18} />, color: 'text-purple-400' },
];

const CATEGORIES = ['all', 'protein', 'grain', 'fruit', 'vegetable', 'dairy', 'snack', 'drink', 'meal'] as const;

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function NutritionPage() {
  const hydrated = useHydration();

  // Stores
  const { addLog, deleteLog, getDayTotals, getMealLogs, customFoods, addCustomFood, recentFoodIds } =
    useNutritionStore();
  const { calorieGoal, proteinGoal, carbGoal, fatGoal, fiberGoal } = useSettingsStore();
  const addXp = usePlayerStore((s) => s.addXp);

  // State
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('all');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState('1');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [expandedMeals, setExpandedMeals] = useState<Record<MealType, boolean>>({
    breakfast: true,
    lunch: true,
    dinner: true,
    snack: true,
  });

  // Custom food form state
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customFiber, setCustomFiber] = useState('');
  const [customServing, setCustomServing] = useState('1 serving');

  if (!hydrated) return <div className="min-h-screen bg-[#0a0a0f]" />;

  const totals = getDayTotals(selectedDate);
  const calRemaining = Math.max(0, calorieGoal - Math.round(totals.calories));
  const proteinPct = Math.min(100, Math.round((totals.protein / proteinGoal) * 100));
  const carbPct = Math.min(100, Math.round((totals.carbs / carbGoal) * 100));
  const fatPct = Math.min(100, Math.round((totals.fat / fatGoal) * 100));

  const isToday = selectedDate === todayStr();
  const displayDate = formatDate(new Date(selectedDate + 'T12:00:00'));

  // All foods combined
  const allFoods = [...FOOD_DATABASE, ...customFoods];

  // Recent foods
  const recentFoods = recentFoodIds
    .map((rid) => allFoods.find((f) => f.id === rid || f.name === rid))
    .filter(Boolean) as FoodItem[];

  // Filtered foods for search
  const filteredFoods = allFoods.filter((f) => {
    const matchesSearch =
      searchQuery === '' ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.brand && f.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleMeal = (meal: MealType) => {
    setExpandedMeals((prev) => ({ ...prev, [meal]: !prev[meal] }));
  };

  const openAddModal = (meal: MealType) => {
    setSelectedMeal(meal);
    setSelectedFood(null);
    setServings('1');
    setSearchQuery('');
    setSelectedCategory('all');
    setShowAddModal(true);
  };

  const selectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setServings('1');
  };

  const confirmAddFood = () => {
    if (!selectedFood) return;
    const s = parseFloat(servings) || 1;
    addLog({
      foodId: selectedFood.id,
      name: selectedFood.name,
      servings: s,
      calories: selectedFood.calories,
      protein: selectedFood.protein,
      carbs: selectedFood.carbs,
      fat: selectedFood.fat,
      fiber: selectedFood.fiber,
      meal: selectedMeal,
      date: selectedDate,
    });
    addXp(10);
    setShowAddModal(false);
    setSelectedFood(null);
  };

  const openCustomModal = () => {
    setShowAddModal(false);
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setCustomFiber('');
    setCustomServing('1 serving');
    setShowCustomModal(true);
  };

  const confirmCustomFood = () => {
    if (!customName.trim()) return;
    const cal = parseFloat(customCalories) || 0;
    const pro = parseFloat(customProtein) || 0;
    const carb = parseFloat(customCarbs) || 0;
    const fat = parseFloat(customFat) || 0;
    const fib = parseFloat(customFiber) || 0;

    // Save to custom foods
    addCustomFood({
      name: customName.trim(),
      servingSize: customServing || '1 serving',
      calories: cal,
      protein: pro,
      carbs: carb,
      fat: fat,
      fiber: fib,
      category: 'custom',
    });

    // Also log it immediately
    addLog({
      name: customName.trim(),
      servings: 1,
      calories: cal,
      protein: pro,
      carbs: carb,
      fat: fat,
      fiber: fib,
      meal: selectedMeal,
      date: selectedDate,
    });
    addXp(10);
    setShowCustomModal(false);
  };

  const handleDeleteLog = (id: string) => {
    deleteLog(id);
  };

  return (
    <div className="pb-32">
      {/* Top Bar */}
      <TopBar
        title="Nutrition"
        subtitle={isToday ? 'Today' : displayDate}
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
              className="p-2 rounded-xl hover:bg-white/10 active:scale-90 transition-transform"
            >
              <ChevronLeft size={20} className="text-slate-400" />
            </button>
            <button
              onClick={() => {
                if (!isToday) setSelectedDate(shiftDate(selectedDate, 1));
              }}
              className={cn(
                'p-2 rounded-xl hover:bg-white/10 active:scale-90 transition-transform',
                isToday && 'opacity-30 pointer-events-none'
              )}
            >
              <ChevronRight size={20} className="text-slate-400" />
            </button>
          </div>
        }
      />

      <div className="px-4 space-y-4 mt-2">
        {/* ---- Macro Overview Card ---- */}
        <GlassCard glow className="!p-5">
          {/* Calories - Main Ring */}
          <div className="flex items-center justify-center mb-4">
            <ProgressRing value={totals.calories} max={calorieGoal} size={120} strokeWidth={8} color="#f59e0b">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{Math.round(totals.calories)}</p>
                <p className="text-[10px] text-slate-400">/ {calorieGoal}</p>
              </div>
            </ProgressRing>
          </div>

          {/* Remaining Calories */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Flame size={14} className="text-amber-400" />
              <span className="text-sm font-medium text-amber-400">{calRemaining} cal remaining</span>
            </div>
          </div>

          {/* Macro Rings Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Protein */}
            <div className="flex flex-col items-center">
              <ProgressRing value={totals.protein} max={proteinGoal} size={56} strokeWidth={4} color="#ef4444">
                <Beef size={16} className="text-red-400" />
              </ProgressRing>
              <p className="text-xs font-medium text-white mt-1.5">
                {Math.round(totals.protein)}g
              </p>
              <p className="text-[10px] text-slate-500">/ {proteinGoal}g</p>
              <p className="text-[10px] text-red-400/70">{proteinPct}%</p>
            </div>

            {/* Carbs */}
            <div className="flex flex-col items-center">
              <ProgressRing value={totals.carbs} max={carbGoal} size={56} strokeWidth={4} color="#3b82f6">
                <Wheat size={16} className="text-blue-400" />
              </ProgressRing>
              <p className="text-xs font-medium text-white mt-1.5">
                {Math.round(totals.carbs)}g
              </p>
              <p className="text-[10px] text-slate-500">/ {carbGoal}g</p>
              <p className="text-[10px] text-blue-400/70">{carbPct}%</p>
            </div>

            {/* Fat */}
            <div className="flex flex-col items-center">
              <ProgressRing value={totals.fat} max={fatGoal} size={56} strokeWidth={4} color="#a855f7">
                <Droplet size={16} className="text-purple-400" />
              </ProgressRing>
              <p className="text-xs font-medium text-white mt-1.5">
                {Math.round(totals.fat)}g
              </p>
              <p className="text-[10px] text-slate-500">/ {fatGoal}g</p>
              <p className="text-[10px] text-purple-400/70">{fatPct}%</p>
            </div>
          </div>

          {/* Fiber bar */}
          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">Fiber</span>
              <span className="text-[11px] text-slate-500">
                {Math.round(totals.fiber)}g / {fiberGoal}g
              </span>
            </div>
            <ProgressBar value={totals.fiber} max={fiberGoal} color="bg-emerald-500" />
          </div>
        </GlassCard>

        {/* ---- Meal Sections ---- */}
        {MEALS.map(({ key, label, icon, color }) => {
          const mealLogs = getMealLogs(selectedDate, key);
          const mealCals = mealLogs.reduce((sum, l) => sum + l.calories * l.servings, 0);
          const isExpanded = expandedMeals[key];

          return (
            <GlassCard key={key} className="!p-0 overflow-hidden">
              {/* Meal Header */}
              <button
                onClick={() => toggleMeal(key)}
                className="w-full flex items-center justify-between px-4 py-3 active:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn('flex items-center', color)}>{icon}</div>
                  <span className="text-sm font-semibold text-white">{label}</span>
                  <span className="text-xs text-slate-500">
                    {Math.round(mealCals)} cal
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddModal(key);
                    }}
                    className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Plus size={16} className="text-slate-300" />
                  </button>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} className="text-slate-500" />
                  </motion.div>
                </div>
              </button>

              {/* Meal Items */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    {mealLogs.length === 0 ? (
                      <div className="px-4 py-4 border-t border-white/[0.04]">
                        <p className="text-xs text-slate-600 text-center">No foods logged</p>
                      </div>
                    ) : (
                      <div className="border-t border-white/[0.04]">
                        {mealLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.03] last:border-b-0"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-200 truncate">{log.name}</p>
                              <p className="text-[10px] text-slate-500">
                                {log.servings !== 1 && `${log.servings}x \u00B7 `}
                                {Math.round(log.calories * log.servings)} cal \u00B7{' '}
                                {Math.round(log.protein * log.servings)}p \u00B7{' '}
                                {Math.round(log.carbs * log.servings)}c \u00B7{' '}
                                {Math.round(log.fat * log.servings)}f
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 active:scale-90 transition-all ml-2 shrink-0"
                            >
                              <Trash2 size={14} className="text-slate-600 hover:text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          );
        })}
      </div>

      {/* ---- Daily Summary Bar ---- */}
      <div className="fixed bottom-16 left-0 right-0 z-20 px-4 pb-2">
        <div className="rounded-2xl border border-white/[0.08] bg-[#12121a]/90 backdrop-blur-xl px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Flame size={14} className="text-amber-400" />
            <span className="text-xs font-medium text-amber-400">{calRemaining}</span>
            <span className="text-[10px] text-slate-500">left</span>
          </div>
          <div className="h-3 w-px bg-white/[0.08]" />
          <span className="text-xs text-red-400">
            P: {Math.round(totals.protein)}g
          </span>
          <div className="h-3 w-px bg-white/[0.08]" />
          <span className="text-xs text-blue-400">
            C: {Math.round(totals.carbs)}g
          </span>
          <div className="h-3 w-px bg-white/[0.08]" />
          <span className="text-xs text-purple-400">
            F: {Math.round(totals.fat)}g
          </span>
        </div>
      </div>

      {/* ---- Add Food Modal ---- */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title={`Add to ${MEALS.find((m) => m.key === selectedMeal)?.label || 'Meal'}`}>
        {selectedFood ? (
          /* --- Serving Size Adjuster --- */
          <div className="space-y-5">
            <div className="text-center">
              <h3 className="text-base font-semibold text-white">{selectedFood.name}</h3>
              {selectedFood.brand && (
                <p className="text-xs text-slate-400">{selectedFood.brand}</p>
              )}
              <p className="text-[11px] text-slate-500 mt-1">
                Serving: {selectedFood.servingSize}
              </p>
            </div>

            {/* Servings Input */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setServings(String(Math.max(0.5, (parseFloat(servings) || 1) - 0.5)))}
                className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
              >
                <Minus size={18} className="text-slate-400" />
              </button>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                step="0.5"
                min="0.5"
                className="w-20 text-center bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-lg font-bold text-white outline-none focus:border-amber-500/50"
              />
              <button
                onClick={() => setServings(String((parseFloat(servings) || 1) + 0.5))}
                className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
              >
                <Plus size={18} className="text-slate-400" />
              </button>
            </div>
            <p className="text-center text-xs text-slate-500">servings</p>

            {/* Preview Macros */}
            {(() => {
              const s = parseFloat(servings) || 1;
              return (
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 rounded-xl bg-amber-500/10">
                    <p className="text-sm font-bold text-amber-400">{Math.round(selectedFood.calories * s)}</p>
                    <p className="text-[10px] text-slate-500">cal</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-red-500/10">
                    <p className="text-sm font-bold text-red-400">{Math.round(selectedFood.protein * s)}g</p>
                    <p className="text-[10px] text-slate-500">protein</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-blue-500/10">
                    <p className="text-sm font-bold text-blue-400">{Math.round(selectedFood.carbs * s)}g</p>
                    <p className="text-[10px] text-slate-500">carbs</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-purple-500/10">
                    <p className="text-sm font-bold text-purple-400">{Math.round(selectedFood.fat * s)}g</p>
                    <p className="text-[10px] text-slate-500">fat</p>
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFood(null)}
                className="flex-1 py-3 rounded-xl bg-white/[0.06] text-slate-300 font-medium text-sm active:scale-[0.98] transition-transform"
              >
                Back
              </button>
              <button
                onClick={confirmAddFood}
                className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-medium text-sm active:scale-[0.98] transition-transform"
              >
                Log Food
              </button>
            </div>
          </div>
        ) : (
          /* --- Food Search --- */
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search foods..."
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
                autoFocus
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap border transition-colors',
                    selectedCategory === cat
                      ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                      : 'bg-white/[0.04] border-white/[0.06] text-slate-500'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Custom + Quick Add Button */}
            <button
              onClick={openCustomModal}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 active:scale-[0.98] transition-transform"
            >
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-xs font-medium text-indigo-400">Create Custom Food Entry</span>
            </button>

            {/* Recent Foods */}
            {!searchQuery && recentFoods.length > 0 && (
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">
                  Recently Used
                </p>
                <div className="space-y-1">
                  {recentFoods.slice(0, 5).map((food) => (
                    <button
                      key={food.id}
                      onClick={() => selectFood(food)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] active:scale-[0.99] transition-all text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200 truncate">{food.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {food.servingSize} \u00B7 {food.calories} cal \u00B7 {food.protein}g protein
                        </p>
                      </div>
                      <Plus size={16} className="text-slate-600 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Food List */}
            <div>
              {searchQuery && (
                <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">
                  {filteredFoods.length} result{filteredFoods.length !== 1 ? 's' : ''}
                </p>
              )}
              {!searchQuery && (
                <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">
                  All Foods
                </p>
              )}
              <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => selectFood(food)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] active:scale-[0.99] transition-all text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm text-slate-200 truncate">{food.name}</p>
                        {food.brand && (
                          <span className="text-[10px] text-slate-600 shrink-0">{food.brand}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {food.servingSize} \u00B7 {food.calories} cal \u00B7 {food.protein}g P \u00B7 {food.carbs}g C \u00B7 {food.fat}g F
                      </p>
                    </div>
                    <Plus size={16} className="text-slate-600 shrink-0 ml-2" />
                  </button>
                ))}
                {filteredFoods.length === 0 && (
                  <div className="text-center py-6">
                    <UtensilsCrossed size={24} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-600">No foods found</p>
                    <button
                      onClick={openCustomModal}
                      className="text-xs text-amber-400 mt-1"
                    >
                      Create a custom entry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ---- Custom Food Modal ---- */}
      <Modal open={showCustomModal} onClose={() => setShowCustomModal(false)} title="Custom Food">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Food Name *</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Mom's Lasagna"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Serving Size</label>
            <input
              type="text"
              value={customServing}
              onChange={(e) => setCustomServing(e.target.value)}
              placeholder="e.g. 1 cup, 1 slice"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Calories</label>
              <input
                type="number"
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value)}
                placeholder="0"
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Protein (g)</label>
              <input
                type="number"
                value={customProtein}
                onChange={(e) => setCustomProtein(e.target.value)}
                placeholder="0"
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Carbs (g)</label>
              <input
                type="number"
                value={customCarbs}
                onChange={(e) => setCustomCarbs(e.target.value)}
                placeholder="0"
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Fat (g)</label>
              <input
                type="number"
                value={customFat}
                onChange={(e) => setCustomFat(e.target.value)}
                placeholder="0"
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Fiber (g)</label>
            <input
              type="number"
              value={customFiber}
              onChange={(e) => setCustomFiber(e.target.value)}
              placeholder="0"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            onClick={confirmCustomFood}
            disabled={!customName.trim()}
            className={cn(
              'w-full py-3 rounded-xl font-medium text-sm active:scale-[0.98] transition-transform mt-2',
              customName.trim()
                ? 'bg-amber-500 text-white'
                : 'bg-white/[0.06] text-slate-600 cursor-not-allowed'
            )}
          >
            Add Custom Food
          </button>
        </div>
      </Modal>
    </div>
  );
}

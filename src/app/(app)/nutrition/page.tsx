'use client';
import { useState, useEffect } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { useNutritionStore } from '@/stores/useNutritionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
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
  Sparkles,
  UtensilsCrossed,
  Coffee,
  Sun,
  Moon,
  Cookie,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type MealType = FoodLog['meal'];

const MEALS: { key: MealType; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: <Coffee size={16} />, color: 'text-amber-400' },
  { key: 'lunch', label: 'Lunch', icon: <Sun size={16} />, color: 'text-emerald-400' },
  { key: 'dinner', label: 'Dinner', icon: <Moon size={16} />, color: 'text-blue-400' },
  { key: 'snack', label: 'Snacks', icon: <Cookie size={16} />, color: 'text-purple-400' },
];

const CATEGORIES = ['all', 'protein', 'grain', 'fruit', 'vegetable', 'dairy', 'snack', 'drink', 'meal'] as const;

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function NutritionPage() {
  const hydrated = useHydration();

  const { addLog, deleteLog, getDayTotals, getMealLogs, customFoods, addCustomFood, recentFoodIds } =
    useNutritionStore();
  const { calorieGoal, proteinGoal, carbGoal, fatGoal } = useSettingsStore();

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

  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customFiber, setCustomFiber] = useState('');
  const [customServing, setCustomServing] = useState('1 serving');

  // Try fetching from API
  const [, setApiData] = useState(null);
  useEffect(() => {
    fetch(`/api/nutrition?date=${selectedDate}`)
      .then((r) => r.json())
      .then(setApiData)
      .catch(() => {});
  }, [selectedDate]);

  if (!hydrated) return <div className="min-h-screen bg-[#0f0f14]" />;

  const totals = getDayTotals(selectedDate);
  const calRemaining = Math.max(0, calorieGoal - Math.round(totals.calories));

  const isToday = selectedDate === todayStr();
  const displayDate = isToday ? 'Today' : formatDate(new Date(selectedDate + 'T12:00:00'));

  const allFoods = [...FOOD_DATABASE, ...customFoods];
  const recentFoods = recentFoodIds
    .map((rid) => allFoods.find((f) => f.id === rid || f.name === rid))
    .filter(Boolean) as FoodItem[];

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
    const fatVal = parseFloat(customFat) || 0;
    const fib = parseFloat(customFiber) || 0;

    addCustomFood({
      name: customName.trim(),
      servingSize: customServing || '1 serving',
      calories: cal,
      protein: pro,
      carbs: carb,
      fat: fatVal,
      fiber: fib,
      category: 'custom',
    });

    addLog({
      name: customName.trim(),
      servings: 1,
      calories: cal,
      protein: pro,
      carbs: carb,
      fat: fatVal,
      fiber: fib,
      meal: selectedMeal,
      date: selectedDate,
    });
    setShowCustomModal(false);
  };

  return (
    <div className="pb-32">
      {/* Top Bar with Date Nav */}
      <TopBar
        title="Nutrition"
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
              className="p-2 rounded-lg hover:bg-white/[0.06] active:scale-90 transition-transform"
              aria-label="Previous day"
            >
              <ChevronLeft size={18} className="text-slate-400" />
            </button>
            <span className="text-sm font-medium text-slate-300 min-w-[80px] text-center">
              {displayDate}
            </span>
            <button
              onClick={() => {
                if (!isToday) setSelectedDate(shiftDate(selectedDate, 1));
              }}
              className={cn(
                'p-2 rounded-lg hover:bg-white/[0.06] active:scale-90 transition-transform',
                isToday && 'opacity-30 pointer-events-none'
              )}
              aria-label="Next day"
            >
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>
        }
      />

      <div className="px-4 space-y-3 mt-3">
        {/* Macro Summary Card */}
        <GlassCard className="!p-5">
          {/* Calories Ring */}
          <div className="flex items-center gap-5 mb-4">
            <ProgressRing value={totals.calories} max={calorieGoal} size={100} strokeWidth={8} color="#00b4d8">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{Math.round(totals.calories)}</p>
                <p className="text-[9px] text-slate-500">kcal</p>
              </div>
            </ProgressRing>
            <div className="flex-1 space-y-0.5">
              <p className="text-sm text-slate-400 mb-2">
                <span className="text-[#00b4d8] font-semibold">{calRemaining}</span> remaining
              </p>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Eaten</span>
                <span>{Math.round(totals.calories)}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Goal</span>
                <span>{calorieGoal}</span>
              </div>
            </div>
          </div>

          {/* Macro Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
                  <span className="text-xs text-slate-400">Protein</span>
                </div>
                <span className="text-xs text-slate-400 tabular-nums">
                  {Math.round(totals.protein)}<span className="text-slate-600">/{proteinGoal}g</span>
                </span>
              </div>
              <ProgressBar value={totals.protein} max={proteinGoal} color="bg-[#4ade80]" size="md" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <span className="text-xs text-slate-400">Carbs</span>
                </div>
                <span className="text-xs text-slate-400 tabular-nums">
                  {Math.round(totals.carbs)}<span className="text-slate-600">/{carbGoal}g</span>
                </span>
              </div>
              <ProgressBar value={totals.carbs} max={carbGoal} color="bg-[#f59e0b]" size="md" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span className="text-xs text-slate-400">Fat</span>
                </div>
                <span className="text-xs text-slate-400 tabular-nums">
                  {Math.round(totals.fat)}<span className="text-slate-600">/{fatGoal}g</span>
                </span>
              </div>
              <ProgressBar value={totals.fat} max={fatGoal} color="bg-[#ef4444]" size="md" />
            </div>
          </div>
        </GlassCard>

        {/* Meal Sections */}
        {MEALS.map(({ key, label, icon, color }) => {
          const mealLogs = getMealLogs(selectedDate, key);
          const mealCals = mealLogs.reduce((sum, l) => sum + l.calories * l.servings, 0);
          const isExpanded = expandedMeals[key];

          return (
            <GlassCard key={key} className="!p-0 overflow-hidden">
              {/* Meal Header */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleMeal(key)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleMeal(key); }}
                className="w-full flex items-center justify-between px-4 py-3 active:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn('flex items-center', color)}>{icon}</div>
                  <span className="text-sm font-medium text-white">{label}</span>
                  {mealCals > 0 && (
                    <span className="text-xs text-slate-500">
                      {Math.round(mealCals)} cal
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddModal(key);
                    }}
                    className="w-7 h-7 rounded-lg bg-[#00b4d8]/10 flex items-center justify-center active:scale-90 transition-transform"
                    aria-label={`Add food to ${label}`}
                  >
                    <Plus size={14} className="text-[#00b4d8]" />
                  </button>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-slate-500" />
                  </motion.div>
                </div>
              </div>

              {/* Meal Items */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {mealLogs.length === 0 ? (
                      <div className="px-4 py-3 border-t border-white/[0.04]">
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
                                {log.servings !== 1 && `${log.servings}x · `}
                                P:{Math.round(log.protein * log.servings)}g · C:{Math.round(log.carbs * log.servings)}g · F:{Math.round(log.fat * log.servings)}g
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="text-sm text-slate-400 tabular-nums">
                                {Math.round(log.calories * log.servings)}
                              </span>
                              <button
                                onClick={() => deleteLog(log.id)}
                                className="p-1 rounded hover:bg-red-500/10 transition-colors"
                                aria-label="Delete food entry"
                              >
                                <Trash2 size={13} className="text-slate-600 hover:text-red-400" />
                              </button>
                            </div>
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

      {/* Daily Summary Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-20 px-4 pb-2">
        <div className="rounded-xl border border-white/[0.06] bg-[#1a1a24]/95 backdrop-blur-md px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-[#00b4d8] tabular-nums">{calRemaining}</span>
            <span className="text-[10px] text-slate-500">left</span>
          </div>
          <div className="h-3 w-px bg-white/[0.06]" />
          <span className="text-xs text-[#4ade80] tabular-nums">
            P: {Math.round(totals.protein)}g
          </span>
          <div className="h-3 w-px bg-white/[0.06]" />
          <span className="text-xs text-[#f59e0b] tabular-nums">
            C: {Math.round(totals.carbs)}g
          </span>
          <div className="h-3 w-px bg-white/[0.06]" />
          <span className="text-xs text-[#ef4444] tabular-nums">
            F: {Math.round(totals.fat)}g
          </span>
        </div>
      </div>

      {/* Add Food Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title={`Add to ${MEALS.find((m) => m.key === selectedMeal)?.label || 'Meal'}`}>
        {selectedFood ? (
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

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setServings(String(Math.max(0.5, (parseFloat(servings) || 1) - 0.5)))}
                className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
              >
                <Minus size={18} className="text-slate-400" />
              </button>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                step="0.5"
                min="0.5"
                className="w-20 text-center bg-white/[0.06] border border-white/[0.06] rounded-xl px-3 py-2.5 text-lg font-bold text-white outline-none focus:border-[#00b4d8]/50"
              />
              <button
                onClick={() => setServings(String((parseFloat(servings) || 1) + 0.5))}
                className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
              >
                <Plus size={18} className="text-slate-400" />
              </button>
            </div>
            <p className="text-center text-xs text-slate-500">servings</p>

            {(() => {
              const s = parseFloat(servings) || 1;
              return (
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 rounded-xl bg-[#00b4d8]/10">
                    <p className="text-sm font-bold text-[#00b4d8]">{Math.round(selectedFood.calories * s)}</p>
                    <p className="text-[10px] text-slate-500">cal</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-[#4ade80]/10">
                    <p className="text-sm font-bold text-[#4ade80]">{Math.round(selectedFood.protein * s)}g</p>
                    <p className="text-[10px] text-slate-500">protein</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-[#f59e0b]/10">
                    <p className="text-sm font-bold text-[#f59e0b]">{Math.round(selectedFood.carbs * s)}g</p>
                    <p className="text-[10px] text-slate-500">carbs</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-[#ef4444]/10">
                    <p className="text-sm font-bold text-[#ef4444]">{Math.round(selectedFood.fat * s)}g</p>
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
                className="flex-1 py-3 rounded-xl bg-[#00b4d8] text-white font-medium text-sm active:scale-[0.98] transition-transform"
              >
                Log Food
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search foods..."
                className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00b4d8]/50"
                autoFocus
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap border transition-colors',
                    selectedCategory === cat
                      ? 'bg-[#00b4d8]/15 border-[#00b4d8]/30 text-[#00b4d8]'
                      : 'bg-white/[0.04] border-white/[0.06] text-slate-500'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={openCustomModal}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#00b4d8]/10 border border-[#00b4d8]/20 active:scale-[0.98] transition-transform"
            >
              <Sparkles size={16} className="text-[#00b4d8]" />
              <span className="text-xs font-medium text-[#00b4d8]">Create Custom Food</span>
            </button>

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
                          {food.servingSize} · {food.calories} cal · {food.protein}g protein
                        </p>
                      </div>
                      <Plus size={14} className="text-slate-600 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                        {food.servingSize} · {food.calories} cal · {food.protein}g P · {food.carbs}g C · {food.fat}g F
                      </p>
                    </div>
                    <Plus size={14} className="text-slate-600 shrink-0 ml-2" />
                  </button>
                ))}
                {filteredFoods.length === 0 && (
                  <div className="text-center py-6">
                    <UtensilsCrossed size={24} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-600">No foods found</p>
                    <button onClick={openCustomModal} className="text-xs text-[#00b4d8] mt-1">
                      Create a custom entry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Custom Food Modal */}
      <Modal open={showCustomModal} onClose={() => setShowCustomModal(false)} title="Custom Food">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Food Name *</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Mom's Lasagna"
              className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00b4d8]/50"
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
              className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00b4d8]/50"
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
                className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00b4d8]/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Protein (g)</label>
              <input
                type="number"
                value={customProtein}
                onChange={(e) => setCustomProtein(e.target.value)}
                placeholder="0"
                className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00b4d8]/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Carbs (g)</label>
              <input
                type="number"
                value={customCarbs}
                onChange={(e) => setCustomCarbs(e.target.value)}
                placeholder="0"
                className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00b4d8]/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Fat (g)</label>
              <input
                type="number"
                value={customFat}
                onChange={(e) => setCustomFat(e.target.value)}
                placeholder="0"
                className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00b4d8]/50"
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
              className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#00b4d8]/50"
            />
          </div>
          <button
            onClick={confirmCustomFood}
            disabled={!customName.trim()}
            className={cn(
              'w-full py-3 rounded-xl font-medium text-sm active:scale-[0.98] transition-transform mt-2',
              customName.trim()
                ? 'bg-[#00b4d8] text-white'
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

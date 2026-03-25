// ---- Core ----
export type ID = string;
export type Timestamp = number;

// ---- Tasks & Projects ----
export interface Task {
  id: ID;
  title: string;
  description?: string;
  projectId?: ID;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export interface Project {
  id: ID;
  name: string;
  color: string;
  createdAt: Timestamp;
}

// ---- Calendar ----
export interface CalendarEvent {
  id: ID;
  title: string;
  description?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  color?: string;
  isAllDay: boolean;
}

// ---- Finances ----
export interface Transaction {
  id: ID;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  createdAt: Timestamp;
}

export interface Budget {
  category: string;
  limit: number;
}

// ---- Food Database ----
export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  category: 'protein' | 'grain' | 'fruit' | 'vegetable' | 'dairy' | 'snack' | 'drink' | 'meal' | 'custom';
}

export interface FoodLog {
  id: ID;
  foodId?: string;
  name: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  createdAt: Timestamp;
}

// ---- Health (kept for backward compat) ----
export interface HealthEntry {
  id: ID;
  date: string;
  waterGlasses: number;
  sleepHours?: number;
  weight?: number;
  calories?: number;
  protein?: number;
  steps?: number;
  workouts: Workout[];
}

// ---- Workouts ----
export interface Workout {
  id: ID;
  type: string;
  exercises: Exercise[];
  duration?: number;
  notes?: string;
  createdAt: Timestamp;
}

export interface Exercise {
  id: ID;
  name: string;
  sets: ExerciseSet[];
}

export interface ExerciseSet {
  reps?: number;
  weight?: number;
  duration?: number;
}

export interface WorkoutPlan {
  id: ID;
  name: string;
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  exercises: PlannedExercise[];
  createdAt: Timestamp;
}

export interface PlannedExercise {
  id: ID;
  name: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
}

export interface WorkoutLog {
  id: ID;
  planId?: ID;
  name: string;
  exercises: LoggedExercise[];
  duration: number;
  struggleRating: 1 | 2 | 3 | 4 | 5;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  mood?: string;
  date: string;
  createdAt: Timestamp;
}

export interface LoggedExercise {
  id: ID;
  name: string;
  sets: CompletedSet[];
  notes?: string;
}

export interface CompletedSet {
  reps: number;
  weight: number;
  rpe?: number;
}

// ---- RPG / Player Stats ----
export interface PlayerStats {
  level: number;
  xp: number;
  totalXp: number;
  bodyScore: number;
  streakDays: number;
  longestStreak: number;
  stats: {
    strength: number;
    endurance: number;
    discipline: number;
    nutrition: number;
    recovery: number;
    mind: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Timestamp;
}

// ---- Practice (Piano, etc.) ----
export interface PracticeLog {
  id: ID;
  skill: string;
  duration: number;
  notes?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  pieces?: string[];
  date: string;
  createdAt: Timestamp;
}

// ---- Daily Check-in ----
export interface DailyCheckIn {
  id: ID;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  quickNote?: string;
  createdAt: Timestamp;
}

// ---- Habits ----
export interface Habit {
  id: ID;
  name: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekdays' | 'custom';
  customDays?: number[];
  createdAt: Timestamp;
}

export interface HabitLog {
  habitId: ID;
  date: string;
  completed: boolean;
}

// ---- Goals ----
export interface Goal {
  id: ID;
  title: string;
  description?: string;
  targetDate?: string;
  milestones: Milestone[];
  createdAt: Timestamp;
}

export interface Milestone {
  id: ID;
  title: string;
  completed: boolean;
  completedAt?: Timestamp;
}

// ---- Journal ----
export interface JournalEntry {
  id: ID;
  title?: string;
  content: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'awful';
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ---- Focus ----
export interface FocusSession {
  id: ID;
  duration: number;
  elapsed: number;
  type: 'work' | 'break';
  completedAt: Timestamp;
}

export interface FocusSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

// ---- Settings ----
export interface AppSettings {
  userName: string;
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  fiberGoal: number;
  waterGoal: number;
  stepsGoal: number;
  theme: 'dark' | 'midnight' | 'amoled';
  accentColor: string;
}

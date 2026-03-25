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
  dueDate?: string; // YYYY-MM-DD
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
  date: string; // YYYY-MM-DD
  createdAt: Timestamp;
}

export interface Budget {
  category: string;
  limit: number;
}

// ---- Health ----
export interface HealthEntry {
  id: ID;
  date: string; // YYYY-MM-DD
  waterGlasses: number;
  sleepHours?: number;
  weight?: number;
  calories?: number;
  protein?: number;
  steps?: number;
  workouts: Workout[];
}

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
  date: string; // YYYY-MM-DD
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
  theme: 'dark' | 'midnight' | 'amoled';
  accentColor: string;
}

import { DAYS } from "@/constants";

export type DayOfWeek = (typeof DAYS)[number];

export const DAY_OPTIONS = ["all", ...DAYS] as const;

export type DayOption = (typeof DAY_OPTIONS)[number];

export interface Habit {
  id: string;
  name: string;
  description?: string;
  dayOfWeek: DayOfWeek;
}

export interface LocalHabit extends Habit {
  _isLocal?: boolean;
}

export interface DailyProgress {
  date: string;
  completedHabits: string[];
}

export interface HabitsState {
  habits: LocalHabit[];
  progress: DailyProgress[];
  loading: boolean;
}

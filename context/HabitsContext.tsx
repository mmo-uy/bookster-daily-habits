import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { ApiService } from "../services/api";
import {
  DailyProgress,
  DayOfWeek,
  Habit,
  HabitsState,
  LocalHabit,
} from "../types/habits";
import { getTodayString } from "../utils/date";

type HabitsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_HABITS"; payload: LocalHabit[] }
  | { type: "SET_PROGRESS"; payload: DailyProgress[] }
  | { type: "TOGGLE_HABIT"; payload: { habitId: string; date: string } };

const initialState: HabitsState = {
  habits: [] as LocalHabit[],
  progress: [],
  loading: false,
};

const habitsReducer = (
  state: HabitsState,
  action: HabitsAction
): HabitsState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_HABITS":
      return { ...state, habits: action.payload as LocalHabit[] };
    case "SET_PROGRESS":
      return { ...state, progress: action.payload };
    case "TOGGLE_HABIT":
      const { habitId, date } = action.payload;
      const existingProgressIndex = state.progress.findIndex(
        (p) => p.date === date
      );
      let newProgress = [...state.progress];

      if (existingProgressIndex >= 0) {
        const progress = newProgress[existingProgressIndex];
        const isCompleted = progress.completedHabits.includes(habitId);
        if (isCompleted) {
          progress.completedHabits = progress.completedHabits.filter(
            (id) => id !== habitId
          );
        } else {
          progress.completedHabits.push(habitId);
        }
      } else {
        newProgress.push({ date, completedHabits: [habitId] });
      }

      return { ...state, progress: newProgress };
    default:
      return state;
  }
};

interface HabitsContextType {
  state: HabitsState;
  toggleHabit: (habitId: string, date?: string) => void;
  addHabit: (
    name: string,
    description?: string,
    dayOfWeek?: DayOfWeek
  ) => Promise<void>;
  editHabit: (
    id: string,
    name: string,
    description?: string,
    dayOfWeek?: DayOfWeek
  ) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  refreshHabits: () => Promise<void>;
  getCompletedCountForDate: (date: string) => number;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
};

interface HabitsProviderProps {
  children: ReactNode;
}

export const HabitsProvider: React.FC<HabitsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(habitsReducer, initialState);

  const mergeHabitsData = (
    localHabits: LocalHabit[],
    apiHabits: Habit[]
  ): LocalHabit[] => {
    if (!localHabits.length) return apiHabits as LocalHabit[];
    if (!apiHabits.length) return localHabits;

    const apiHabitsMap = new Map(apiHabits.map((habit) => [habit.id, habit]));
    const mergedHabits: LocalHabit[] = [];
    apiHabits.forEach((apiHabit) => {
      mergedHabits.push({
        ...apiHabit,
        dayOfWeek: apiHabit.dayOfWeek || "monday",
        description: apiHabit.description || undefined,
        _isLocal: false,
        category: apiHabit.category || "Personal",
      } as LocalHabit);
    });

    localHabits.forEach((localHabit) => {
      if (!apiHabitsMap.has(localHabit.id)) {
        mergedHabits.push({
          ...localHabit,
          _isLocal: true,
        });
      }
    });

    console.log(
      `🔄 Merged: ${mergedHabits.length} total habits (${
        apiHabits.length
      } server, ${mergedHabits.length - apiHabits.length} local-only)`
    );
    return mergedHabits;
  };

  const loadData = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    let localHabits: LocalHabit[] = [];
    let localProgress: DailyProgress[] = [];

    try {
      const habitsData = await AsyncStorage.getItem("habits");
      const progressData = await AsyncStorage.getItem("progress");

      if (habitsData) {
        localHabits = JSON.parse(habitsData);
        localHabits = localHabits.map((habit: any) => ({
          ...habit,
          _isLocal: habit._isLocal || false,
        }));
      }

      if (progressData) {
        localProgress = JSON.parse(progressData);
      }
    } catch (localError) {
      console.error("Error loading local data:", localError);
      localHabits = [];
    }

    try {
      const apiHabits = await ApiService.fetchHabits();
      const normalizedApiHabits = apiHabits.map((habit) => ({
        ...habit,
        dayOfWeek: habit.dayOfWeek || "monday",
        description: habit.description || undefined,
      }));
      const mergedHabits = mergeHabitsData(localHabits, normalizedApiHabits);
      dispatch({ type: "SET_HABITS", payload: mergedHabits });
      console.log(
        `Loaded ${mergedHabits.length} habits (${apiHabits.length} from API, ${localHabits.length} local)`
      );
      const localOnlyHabits = mergedHabits.filter((h) => h._isLocal);
      const serverHabits = mergedHabits.filter((h) => !h._isLocal);
      console.log(
        `📊 Local habits: ${localOnlyHabits.length}, Server habits: ${serverHabits.length}`
      );
      if (localOnlyHabits.length > 0) {
        console.log(
          `🏠 Local habit IDs: ${localOnlyHabits.map((h) => h.id).join(", ")}`
        );
      }
    } catch (apiError) {
      console.error("API Error, falling back to local data:", apiError);

      if (localHabits.length > 0) {
        dispatch({ type: "SET_HABITS", payload: localHabits });
        console.log(
          `Loaded ${localHabits.length} habits from local storage (API failed)`
        );
      } else {
        dispatch({ type: "SET_HABITS", payload: [] });
        console.log("No data available, starting with empty state");
      }
    }

    if (localProgress.length > 0) {
      dispatch({ type: "SET_PROGRESS", payload: localProgress });
    }

    dispatch({ type: "SET_LOADING", payload: false });
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("habits", JSON.stringify(state.habits));
      await AsyncStorage.setItem("progress", JSON.stringify(state.progress));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!state.loading) {
      saveData();
    }
  }, [state.habits, state.progress]);

  const toggleHabit = (habitId: string, date?: string) => {
    const dateToUse = date || getTodayString();
    dispatch({ type: "TOGGLE_HABIT", payload: { habitId, date: dateToUse } });
  };

  const addHabit = async (
    name: string,
    description?: string,
    dayOfWeek: DayOfWeek = "monday"
  ): Promise<void> => {
    const newHabitData = { name, description, dayOfWeek };
    const createdHabit = await ApiService.createHabit(newHabitData);
    if (createdHabit) {
      const existingIndex = state.habits.findIndex(
        (h) => h.name === name && h.dayOfWeek === dayOfWeek
      );
      let updatedHabits;

      if (existingIndex >= 0) {
        updatedHabits = [...state.habits];
        updatedHabits[existingIndex] = { ...createdHabit, _isLocal: false };
      } else {
        updatedHabits = [...state.habits, { ...createdHabit, _isLocal: false }];
      }

      dispatch({ type: "SET_HABITS", payload: updatedHabits });
    } else {
      const existingLocal = state.habits.find(
        (h) => h.name === name && h.dayOfWeek === dayOfWeek && h._isLocal
      );
      if (!existingLocal) {
        const newHabit: LocalHabit = {
          id: uuidv4(),
          name,
          description,
          dayOfWeek,
          _isLocal: true,
        };
        dispatch({ type: "SET_HABITS", payload: [...state.habits, newHabit] });
      }
    }
  };

  const editHabit = async (
    id: string,
    name: string,
    description?: string,
    dayOfWeek?: DayOfWeek
  ): Promise<void> => {
    const habit = state.habits.find((h) => h.id === id) as
      | LocalHabit
      | undefined;
    console.log(
      `✏️ Editing habit ${id}: ${habit?.name}, isLocal: ${habit?._isLocal}`
    );

    if (habit?._isLocal) {
      const updatedHabits = state.habits.map((h) =>
        h.id === id
          ? {
              ...h,
              name,
              description,
              dayOfWeek: dayOfWeek || h.dayOfWeek,
            }
          : h
      );
      dispatch({ type: "SET_HABITS", payload: updatedHabits });
      return;
    }

    const updatedHabitData = { name, description, dayOfWeek };
    const updatedHabit = await ApiService.updateHabit(id, updatedHabitData);
    if (updatedHabit) {
      const updatedHabits = state.habits.map((h) =>
        h.id === id ? { ...updatedHabit, _isLocal: false } : h
      );
      dispatch({ type: "SET_HABITS", payload: updatedHabits });
    } else {
      const updatedHabits = state.habits.map((h) =>
        h.id === id
          ? {
              ...h,
              name,
              description,
              dayOfWeek: dayOfWeek || h.dayOfWeek,
            }
          : h
      );
      dispatch({ type: "SET_HABITS", payload: updatedHabits });
    }
  };

  const deleteHabit = async (id: string): Promise<void> => {
    const habit = state.habits.find((h) => h.id === id) as
      | LocalHabit
      | undefined;

    if (habit?._isLocal) {
      const filteredHabits = state.habits.filter((h) => h.id !== id);
      dispatch({ type: "SET_HABITS", payload: filteredHabits });
      return;
    }

    const success = await ApiService.deleteHabit(id);
    if (success) {
      const filteredHabits = state.habits.filter((h) => h.id !== id);
      dispatch({ type: "SET_HABITS", payload: filteredHabits });
    } else {
      const filteredHabits = state.habits.filter((h) => h.id !== id);
      dispatch({ type: "SET_HABITS", payload: filteredHabits });
    }
  };

  const refreshHabits = async (): Promise<void> => {
    console.log("🔄 Refreshing habits from server...");
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const apiHabits = await ApiService.fetchHabits();
      const normalizedApiHabits = apiHabits.map((habit) => ({
        ...habit,
        dayOfWeek: habit.dayOfWeek || "monday",
        description: habit.description || undefined,
      }));
      const mergedHabits = mergeHabitsData([], normalizedApiHabits);
      dispatch({ type: "SET_HABITS", payload: mergedHabits });

      console.log(`✅ Refreshed ${mergedHabits.length} habits from server`);
    } catch (error) {
      console.error("❌ Failed to refresh habits:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const getCompletedCountForDate = (date: string): number => {
    const progress = state.progress.find((p) => p.date === date);
    return progress ? progress.completedHabits.length : 0;
  };

  return (
    <HabitsContext.Provider
      value={{
        state,
        toggleHabit,
        addHabit,
        editHabit,
        deleteHabit,
        refreshHabits,
        getCompletedCountForDate,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

export type HabitType = 'boolean' | 'numeric' | 'duration';

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  target?: number;
  unit?: string;
  icon: string;
  order: number;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  notes: string;
  values: Record<string, number | boolean>; // habitId -> value
}

interface StoreState {
  habits: Habit[];
  entries: Record<string, DailyEntry>;
}

interface StoreContextType extends StoreState {
  addHabit: (habit: Omit<Habit, 'id' | 'order'>) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  reorderHabits: (startIndex: number, endIndex: number) => void;
  updateEntry: (date: string, habitId: string, value: number | boolean | null) => void;
  updateNotes: (date: string, notes: string) => void;
  getEntry: (date: string) => DailyEntry;
  getHabitStreak: (habitId: string) => number;
  getDailyScore: (date: string) => number;
}

const StoreContext = createContext<StoreContextType | null>(null);

const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Sleep', type: 'duration', target: 480, unit: 'hrs', icon: 'Moon', order: 0 },
  { id: '2', name: 'Study', type: 'duration', target: 120, unit: 'hrs', icon: 'BookOpen', order: 1 },
  { id: '3', name: 'Basketball', type: 'boolean', icon: 'Dribbble', order: 2 },
  { id: '4', name: 'Workout', type: 'boolean', icon: 'Dumbbell', order: 3 },
  { id: '5', name: 'Diet / Protein', type: 'numeric', target: 150, unit: 'g', icon: 'Beef', order: 4 },
  { id: '6', name: 'Water', type: 'numeric', target: 8, unit: 'cups', icon: 'Droplets', order: 5 },
  { id: '7', name: 'Haircare', type: 'boolean', icon: 'Scissors', order: 6 },
  { id: '8', name: 'Self-care', type: 'boolean', icon: 'Heart', order: 7 },
  { id: '9', name: 'Screen Time', type: 'duration', target: 240, unit: 'hrs', icon: 'Smartphone', order: 8 },
];

function calculateCompletion(habit: Habit, value: number | boolean | undefined | null): number {
  if (value === undefined || value === null) return 0;
  if (habit.type === 'boolean') {
    return value ? 1 : 0;
  }
  if (typeof value === 'number' && habit.target && habit.target > 0) {
    return Math.min(value / habit.target, 1);
  }
  return 0;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(() => {
    try {
      const stored = localStorage.getItem('ritual_store');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load store', e);
    }
    return { habits: DEFAULT_HABITS, entries: {} };
  });

  useEffect(() => {
    localStorage.setItem('ritual_store', JSON.stringify(state));
  }, [state]);

  const addHabit = useCallback((habitData: Omit<Habit, 'id' | 'order'>) => {
    setState((prev) => ({
      ...prev,
      habits: [
        ...prev.habits,
        {
          ...habitData,
          id: Math.random().toString(36).substring(2, 9),
          order: prev.habits.length,
        },
      ],
    }));
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id).map((h, i) => ({ ...h, order: i })),
    }));
  }, []);

  const reorderHabits = useCallback((startIndex: number, endIndex: number) => {
    setState((prev) => {
      const result = Array.from(prev.habits);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return {
        ...prev,
        habits: result.map((h, i) => ({ ...h, order: i })),
      };
    });
  }, []);

  const updateEntry = useCallback((date: string, habitId: string, value: number | boolean | null) => {
    setState((prev) => {
      const entry = prev.entries[date] || { date, notes: '', values: {} };
      const newValues = { ...entry.values };
      
      if (value === null) {
        delete newValues[habitId];
      } else {
        newValues[habitId] = value;
      }
      
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [date]: { ...entry, values: newValues },
        },
      };
    });
  }, []);

  const updateNotes = useCallback((date: string, notes: string) => {
    setState((prev) => {
      const entry = prev.entries[date] || { date, notes: '', values: {} };
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [date]: { ...entry, notes },
        },
      };
    });
  }, []);

  const getEntry = useCallback(
    (date: string) => {
      return state.entries[date] || { date, notes: '', values: {} };
    },
    [state.entries]
  );

  const getHabitStreak = useCallback(
    (habitId: string) => {
      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const entry = state.entries[dateStr];
        const habit = state.habits.find(h => h.id === habitId);
        
        if (!entry || !habit) break;
        
        const val = entry.values[habitId];
        const completed = calculateCompletion(habit, val) >= 1;
        
        if (completed) {
          streak++;
        } else {
          // If we missed a day, and it's not today, break the streak.
          if (i > 0) break;
        }
      }
      return streak;
    },
    [state.entries, state.habits]
  );

  const getDailyScore = useCallback(
    (date: string) => {
      if (state.habits.length === 0) return 0;
      const entry = state.entries[date];
      if (!entry) return 0;

      let total = 0;
      state.habits.forEach((habit) => {
        total += calculateCompletion(habit, entry.values[habit.id]);
      });
      return Math.round((total / state.habits.length) * 100);
    },
    [state.entries, state.habits]
  );

  const value = useMemo(
    () => ({
      ...state,
      addHabit,
      updateHabit,
      deleteHabit,
      reorderHabits,
      updateEntry,
      updateNotes,
      getEntry,
      getHabitStreak,
      getDailyScore,
    }),
    [state, addHabit, updateHabit, deleteHabit, reorderHabits, updateEntry, updateNotes, getEntry, getHabitStreak, getDailyScore]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}

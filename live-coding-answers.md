# Live Coding Session Improvements: Detailed Solutions

This document provides detailed solutions and code implementations for the live coding tasks outlined in the interview questions.

## 1. Add a New Feature: Streak Counter (10-15 min)

### Task: Implement a "streak counter" that shows how many consecutive days a habit has been completed.

### Solution Steps:

1. **Update Types** (`types/habits.ts`):
```typescript
export interface Habit {
  id: string;
  name: string;
  description?: string;
  dayOfWeek: DayOfWeek;
  streak?: number; // Add streak property
}
```

2. **Add Streak Calculation Function** (`utils/date.ts`):
```typescript
export const calculateStreak = (progress: DailyProgress[], habitId: string): number => {
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const dateString = currentDate.toISOString().split('T')[0];
    const dayProgress = progress.find(p => p.date === dateString);

    if (dayProgress?.completedHabits.includes(habitId)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
```

3. **Update Context** (`context/HabitsContext.tsx`):
```typescript
// In the provider, add streak calculation when loading habits
const loadData = async () => {
  // ... existing code ...
  const mergedHabits = mergeHabitsData(localHabits, normalizedApiHabits);

  // Calculate streaks for all habits
  const habitsWithStreaks = mergedHabits.map(habit => ({
    ...habit,
    streak: calculateStreak(localProgress, habit.id)
  }));

  dispatch({ type: "SET_HABITS", payload: habitsWithStreaks });
  // ... rest of function
};
```

4. **Update HabitItem Component** (`components/HabitItem.tsx`):
```typescript
// Add streak display
<View style={styles.streakContainer}>
  <ThemedText style={styles.streakText}>
    🔥 {habit.streak || 0}
  </ThemedText>
</View>

// Add styles
const styles = StyleSheet.create({
  // ... existing styles
  streakContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.special.white,
  },
});
```

## 2. Performance Optimization: Habits List Rendering (10 min)

### Task: Optimize the habits list rendering when there are many habits.

### Solution:

1. **Implement React.memo on HabitItem**:
```typescript
export const HabitItem: React.FC<HabitItemProps> = React.memo(({
  habit,
  selectedDate,
  onEdit,
  onDelete,
}) => {
  // ... existing component code
});

// Add displayName for debugging
HabitItem.displayName = 'HabitItem';
```

2. **Use FlatList with Optimizations** (in the parent component, e.g., `app/(tabs)/index.tsx`):
```typescript
<FlatList
  data={habits}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <HabitItem
      habit={item}
      selectedDate={selectedDate}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )}
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={5}
  getItemLayout={(data, index) => ({
    length: 80, // Approximate height
    offset: 80 * index,
    index,
  })}
  removeClippedSubviews={true}
/>
```

3. **Memoize Expensive Calculations**:
```typescript
const completedCount = useMemo(() => {
  return state.progress.filter(p => p.date === selectedDate)
    .reduce((count, p) => count + p.completedHabits.length, 0);
}, [state.progress, selectedDate]);
```

## 3. Bug Fix: Race Condition in Data Loading (5-10 min)

### Task: Fix a potential race condition in the data loading.

### Solution:

The current `loadData` function has a potential race condition where multiple calls could overwrite each other. Here's the fix:

```typescript
// Add a loading flag to prevent concurrent loads
const [isLoading, setIsLoading] = useState(false);

const loadData = async () => {
  if (isLoading) return; // Prevent concurrent calls

  setIsLoading(true);
  dispatch({ type: "SET_LOADING", payload: true });

  try {
    // ... existing load logic
  } catch (error) {
    // ... existing error handling
  } finally {
    setIsLoading(false);
    dispatch({ type: "SET_LOADING", payload: false });
  }
};
```

Alternative: Use a ref to track the current load operation:

```typescript
const currentLoadRef = useRef<AbortController | null>(null);

const loadData = async () => {
  // Cancel previous load if still running
  if (currentLoadRef.current) {
    currentLoadRef.current.abort();
  }

  currentLoadRef.current = new AbortController();

  try {
    // ... existing logic with abort signal checks
  } catch (error) {
    if (error.name !== 'AbortError') {
      // Handle real errors
    }
  } finally {
    currentLoadRef.current = null;
  }
};
```

## 4. Accessibility Improvement: Add Proper Labels and Hints (5 min)

### Task: Add proper accessibility labels and hints to interactive elements.

### Solution:

Update `HabitItem.tsx`:

```typescript
<TouchableOpacity
  onPress={handlePress}
  style={styles.checkboxTouchable}
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  accessibilityRole="button"
  accessibilityLabel={`Mark ${habit.name} as ${isCompleted ? 'incomplete' : 'complete'}`}
  accessibilityHint={`Double tap to toggle completion status for ${habit.name}`}
  accessibilityState={{ checked: isCompleted }}
>
  {/* ... existing checkbox content */}
</TouchableOpacity>

<TouchableOpacity
  onPress={handleEditPress}
  style={styles.editButton}
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  accessibilityRole="button"
  accessibilityLabel={`Edit ${habit.name}`}
  accessibilityHint="Double tap to open edit dialog for this habit"
>
  <IconSymbol name="pencil" size={24} color={COLORS.primaryDark} />
</TouchableOpacity>
```

For the main screen, add screen reader announcements:

```typescript
import { AccessibilityInfo } from 'react-native';

// In the main component
useEffect(() => {
  if (habits.length > 0) {
    AccessibilityInfo.announceForAccessibility(
      `Loaded ${habits.length} habits. ${completedCount} completed today.`
    );
  }
}, [habits.length, completedCount]);
```

## 5. Testing Addition: Write a Unit Test (5-10 min)

### Task: Write a unit test for a specific function or component.

### Solution: Test the `calculateStreak` function

Create `utils/__tests__/date.test.ts`:

```typescript
import { calculateStreak } from '../date';
import { DailyProgress } from '../../types/habits';

describe('calculateStreak', () => {
  const mockProgress: DailyProgress[] = [
    { date: '2024-01-01', completedHabits: ['habit1'] },
    { date: '2024-01-02', completedHabits: ['habit1'] },
    { date: '2024-01-03', completedHabits: ['habit1'] },
    { date: '2024-01-04', completedHabits: [] }, // Break in streak
    { date: '2024-01-05', completedHabits: ['habit1'] },
  ];

  beforeEach(() => {
    // Mock today's date
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-03'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calculates streak correctly for consecutive days', () => {
    const streak = calculateStreak(mockProgress, 'habit1');
    expect(streak).toBe(3);
  });

  it('returns 0 when habit not completed today', () => {
    jest.setSystemTime(new Date('2024-01-04'));
    const streak = calculateStreak(mockProgress, 'habit1');
    expect(streak).toBe(0);
  });

  it('handles empty progress array', () => {
    const streak = calculateStreak([], 'habit1');
    expect(streak).toBe(0);
  });

  it('ignores other habits in progress', () => {
    const mixedProgress = [
      ...mockProgress,
      { date: '2024-01-03', completedHabits: ['habit1', 'habit2'] },
    ];
    const streak = calculateStreak(mixedProgress, 'habit1');
    expect(streak).toBe(3);
  });
});
```

## 6. Refactoring: Improve Component Readability (10 min)

### Task: Refactor a complex component or hook to improve readability and maintainability.

### Solution: Refactor the `HabitsContext` reducer

Extract action creators and separate concerns:

```typescript
// actionCreators.ts
export const createSetLoadingAction = (loading: boolean) => ({
  type: 'SET_LOADING' as const,
  payload: loading,
});

export const createSetHabitsAction = (habits: LocalHabit[]) => ({
  type: 'SET_HABITS' as const,
  payload: habits,
});

export const createSetProgressAction = (progress: DailyProgress[]) => ({
  type: 'SET_PROGRESS' as const,
  payload: progress,
});

export const createToggleHabitAction = (habitId: string, date: string) => ({
  type: 'TOGGLE_HABIT' as const,
  payload: { habitId, date },
});

// Update reducer to use these
const habitsReducer = (
  state: HabitsState,
  action: ReturnType<typeof createSetLoadingAction | typeof createSetHabitsAction | typeof createSetProgressAction | typeof createToggleHabitAction>
): HabitsState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    // ... other cases
  }
};
```

Extract data loading logic into separate functions:

```typescript
const loadLocalData = async (): Promise<{ habits: LocalHabit[], progress: DailyProgress[] }> => {
  try {
    const habitsData = await AsyncStorage.getItem("habits");
    const progressData = await AsyncStorage.getItem("progress");

    return {
      habits: habitsData ? JSON.parse(habitsData) : [],
      progress: progressData ? JSON.parse(progressData) : [],
    };
  } catch (error) {
    console.error("Error loading local data:", error);
    return { habits: [], progress: [] };
  }
};

const loadApiData = async (): Promise<Habit[]> => {
  try {
    return await ApiService.fetchHabits();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
```

This refactoring improves:
- **Readability**: Clear separation of concerns
- **Testability**: Smaller, focused functions
- **Maintainability**: Easier to modify individual parts
- **Type Safety**: Better TypeScript inference with action creators

## General Tips for Live Coding Success

1. **Start Simple**: Begin with the basic structure before adding complexity
2. **Test Frequently**: Run the app after each change to catch issues early
3. **Explain Your Thinking**: Verbalize your approach and reasoning
4. **Handle Edge Cases**: Consider error states, loading states, and edge cases
5. **Clean Code**: Use meaningful variable names and add comments for complex logic
6. **Performance Awareness**: Be mindful of re-renders and expensive operations
7. **Ask Questions**: Clarify requirements if anything is unclear
8. **Time Management**: Prioritize core functionality over perfect implementation
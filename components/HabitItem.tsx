import React, { useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { COLORS } from "../constants/colors";
import { useHabits } from "../context/HabitsContext";
import { Habit } from "../types/habits";
import { getTodayString } from "../utils/date";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { IconSymbol } from "./ui/icon-symbol";

interface HabitItemProps {
  habit: Habit;
  selectedDate?: string;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}

export const HabitItem: React.FC<HabitItemProps> = ({
  habit,
  selectedDate,
  onEdit,
  onDelete,
}) => {
  const { toggleHabit, state } = useHabits();
  const dateToUse = selectedDate || getTodayString();
  const progress = state.progress.find((p) => p.date === dateToUse);
  const isCompleted = progress?.completedHabits.includes(habit.id) || false;

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const previousCompletedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (
      previousCompletedRef.current !== null &&
      previousCompletedRef.current !== isCompleted
    ) {
      if (isCompleted) {
        scale.value = withSpring(1.2, { damping: 10 }, () => {
          scale.value = withSpring(1);
        });
      } else {
        opacity.value = withTiming(0.5, { duration: 200 }, () => {
          opacity.value = withTiming(1, { duration: 200 });
        });
      }
    }

    previousCompletedRef.current = isCompleted;
  }, [isCompleted, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    toggleHabit(habit.id, selectedDate);
  };

  const handleEditPress = () => {
    if (onEdit) {
      onEdit(habit);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.mainSection}>
          <TouchableOpacity
            onPress={handlePress}
            style={styles.checkboxTouchable}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View
              style={[
                styles.checkbox,
                isCompleted && styles.checkboxCompleted,
                animatedStyle,
              ]}
            >
              {isCompleted && (
                <IconSymbol
                  name="checkmark"
                  size={16}
                  color={COLORS.special.white}
                />
              )}
            </Animated.View>
          </TouchableOpacity>
          <View style={styles.textContainer}>
            <ThemedText type="defaultSemiBold" style={styles.title}>
              {habit.name}
            </ThemedText>
            <View style={styles.subtitleContainer}>
              <ThemedText style={styles.dayText}>
                {(habit.dayOfWeek || 'monday').charAt(0).toUpperCase() +
                  (habit.dayOfWeek || 'monday').slice(1)}
              </ThemedText>
              {habit.description && (
                <ThemedText style={styles.description}>
                  • {habit.description.length > 35
                      ? `${habit.description.substring(0, 35)}...`
                      : habit.description}
                </ThemedText>
              )}
            </View>
          </View>
          {onEdit && (
            <TouchableOpacity
              onPress={handleEditPress}
              style={styles.editButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol name="pencil" size={24} color={COLORS.primaryDark} />
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background.overlay,
  },
  content: {
    padding: 16,
  },
  checkboxTouchable: {
    marginRight: 12,
  },
  mainSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    opacity: COLORS.opacity.medium,
    marginTop: 2,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dayText: {
    fontSize: 12,
    opacity: COLORS.opacity.low,
    fontWeight: "500",
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
});

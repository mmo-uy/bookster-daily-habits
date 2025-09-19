import { IconSymbol } from "@/components/ui/icon-symbol";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { CategoryFilter } from "@/components/CategoryFilter";
import { DayFilter } from "@/components/DayFilter";
import { EmptyState } from "@/components/EmptyState";
import { HabitForm } from "@/components/HabitForm";
import { HabitItem } from "@/components/HabitItem";
import { Loading } from "@/components/Loading";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { COLORS } from "@/constants/colors";
import { useHabits } from "@/context/HabitsContext";
import { Category, DayOfWeek, Habit } from "@/types/habits";
import { getTodayString } from "@/utils/date";

export default function HomeScreen() {
  const { state, addHabit, editHabit, deleteHabit, refreshHabits } =
    useHabits();
  const { habits, loading } = state;
  const [selectedDayFilter, setSelectedDayFilter] = useState<DayOfWeek | "all">(
    "all"
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<Category | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      const dayMatch =
        selectedDayFilter === "all" || habit.dayOfWeek === selectedDayFilter;

      const categoryMatch =
        !selectedCategoryFilter ||
        habit.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

      return dayMatch && categoryMatch;
    });
  }, [habits, selectedDayFilter, selectedCategoryFilter]);

  const handleDayFilterChange = useCallback((day: DayOfWeek | "all") => {
    setSelectedDayFilter(day);
  }, []);

  const handleCategoryFilterChange = useCallback((cat: Category) => {
    setSelectedCategoryFilter(cat);
  }, []);

  const handleAddHabit = useCallback(() => {
    setIsEditMode(false);
    setEditingHabit(null);
    setModalVisible(true);
  }, []);

  const handleEditHabit = useCallback((habit: Habit) => {
    setIsEditMode(true);
    setEditingHabit(habit);
    setModalVisible(true);
  }, []);

  const handleDeleteHabit = useCallback(
    (habitId: string) => {
      deleteHabit(habitId);
      Toast.show({
        type: "success",
        text1: "Habit deleted successfully",
      });
      setModalVisible(false);
      setIsEditMode(false);
      setEditingHabit(null);
    },
    [deleteHabit]
  );

  const handleHabitSubmit = useCallback(
    (data: { name: string; description: string; dayOfWeek: DayOfWeek }) => {
      if (isEditMode && editingHabit) {
        editHabit(
          editingHabit.id,
          data.name,
          data.description || undefined,
          data.dayOfWeek
        );
        Toast.show({
          type: "success",
          text1: "Habit updated successfully",
        });
      } else {
        addHabit(data.name, data.description || undefined, data.dayOfWeek);
        Toast.show({
          type: "success",
          text1: "Habit added successfully",
        });
      }
      setModalVisible(false);
    },
    [isEditMode, editingHabit, editHabit, addHabit]
  );

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setIsEditMode(false);
    setEditingHabit(null);
  }, []);

  const handleSettingsPress = useCallback(() => {
    router.push("/settings");
  }, []);

  const handleRefreshPress = useCallback(async () => {
    await refreshHabits();
    Toast.show({
      type: "success",
      text1: "Habits refreshed from server",
    });
  }, [refreshHabits]);

  const CategoryHeader = (cat: Category) => {
    return (
      <ThemedText type="title" style={styles.title}>
        {cat}
      </ThemedText>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <ThemedText type="title" style={styles.title}>
            Daily Habits
          </ThemedText>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={handleRefreshPress}
              style={styles.refreshButton}
            >
              <IconSymbol
                name="arrow.clockwise"
                size={24}
                color={COLORS.primaryDark}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSettingsPress}
              style={styles.settingsButton}
            >
              <IconSymbol name="gear" size={24} color={COLORS.primaryDark} />
            </TouchableOpacity>
          </View>
        </View>

        <DayFilter
          selectedDay={selectedDayFilter}
          onDaySelect={handleDayFilterChange}
        />
        <CategoryFilter
          selectedCategory={selectedCategoryFilter!}
          onCategorySelect={handleCategoryFilterChange}
        />
      </ThemedView>

      {loading ? (
        <Loading message="Loading habits..." />
      ) : filteredHabits.length === 0 ? (
        <EmptyState
          title="No habits yet"
          message="Create your first habit to get started on your journey!"
          icon="plus.circle.fill"
        />
      ) : (
        <FlatList
          data={filteredHabits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitItem
              habit={item}
              selectedDate={getTodayString()}
              onEdit={handleEditHabit}
              onDelete={handleDeleteHabit}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleAddHabit}>
        <IconSymbol name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleModalClose}
          />
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetHandle} />
            <HabitForm
              isVisible={modalVisible}
              isEditMode={isEditMode}
              editingHabit={editingHabit}
              onSubmit={handleHabitSubmit}
              onCancel={handleModalClose}
              onDelete={handleDeleteHabit}
              title={isEditMode ? "Edit Habit" : "Add New Habit"}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  header: {
    padding: 16,
    alignItems: "center",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  settingsButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    // Web-compatible shadow
    shadowColor: COLORS.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // For web browsers
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.background.modal,
  },
  modalBackdrop: {
    flex: 1,
  },
  bottomSheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background.light,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 30,
    // Web-compatible shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    // Web-specific shadow
    elevation: 16,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border.light,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
});

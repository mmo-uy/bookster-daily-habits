import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/colors";
import { DAY_OPTIONS, DayOption } from "../types/habits";
import { ThemedText } from "./themed-text";

interface DayFilterProps {
  selectedDay: DayOption;
  onDaySelect: (day: DayOption | "all") => void;
}

const getDayDisplayName = (day: DayOption): string => {
  if (day === "all") return "All Days";
  return day.charAt(0).toUpperCase() + day.slice(1);
};

export const DayFilter: React.FC<DayFilterProps> = ({
  selectedDay,
  onDaySelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {DAY_OPTIONS.map((day) => (
        <TouchableOpacity
          key={day}
          style={[
            styles.filterButton,
            selectedDay === day && styles.filterButtonActive,
          ]}
          onPress={() => onDaySelect(day)}
        >
          <ThemedText
            style={[
              styles.filterButtonText,
              selectedDay === day && styles.filterButtonTextActive,
            ]}
          >
            {getDayDisplayName(day)}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    maxHeight: 50,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    alignItems: "center",
    paddingVertical: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  filterButtonTextActive: {
    color: COLORS.special.white,
    fontWeight: "bold",
  },
});

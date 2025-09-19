import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/colors";
import { CATEGORIES, Category } from "../types/habits";
import { ThemedText } from "./themed-text";

interface CategoryFilterProps {
  selectedCategory: Category;
  onCategorySelect: (cat: Category | null) => void;
}

const getDayDisplayName = (category: Category): string => {
  // if (category === "") return "All Categories";
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[
            styles.filterButton,
            selectedCategory === cat && styles.filterButtonActive,
          ]}
          onPress={() => onCategorySelect(cat)}
        >
          <ThemedText
            style={[
              styles.filterButtonText,
              selectedCategory === cat && styles.filterButtonTextActive,
            ]}
          >
            {getDayDisplayName(cat)}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    maxHeight: 50,
    marginBottom: 34,
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

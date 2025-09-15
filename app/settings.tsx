import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { COLORS } from "@/constants/colors";
import { ApiService } from "@/services/api";

export default function SettingsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const handleClearStorage = async () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your habits and progress data. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await AsyncStorage.multiRemove(["habits", "progress"]);

              // Try to reload data from API after clearing using centralized service
              try {
                const apiHabits = await ApiService.fetchHabits();
                if (apiHabits.length > 0) {
                  Alert.alert(
                    "Data Cleared & Reloaded",
                    `All local data has been cleared. ${apiHabits.length} habits loaded from server.`,
                    [
                      {
                        text: "OK",
                        onPress: () => router.back(),
                      },
                    ]
                  );
                } else {
                  Alert.alert(
                    "Data Cleared",
                    "All habits and progress data has been cleared. No data available from server.",
                    [
                      {
                        text: "OK",
                        onPress: () => router.back(),
                      },
                    ]
                  );
                }
              } catch (apiError) {
                console.log(
                  "Could not load data from API after clearing:",
                  apiError
                );
                Alert.alert(
                  "Data Cleared",
                  "All habits and progress data has been cleared.",
                  [
                    {
                      text: "OK",
                      onPress: () => router.back(),
                    },
                  ]
                );
              }
            } catch (error) {
              console.error("Error clearing storage:", error);
              Alert.alert("Error", "Failed to clear data. Please try again.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Data Management</ThemedText>

          <TouchableOpacity
            style={[styles.option, isLoading && styles.optionDisabled]}
            onPress={handleClearStorage}
            disabled={isLoading}
          >
            <View style={styles.optionContent}>
              <IconSymbol
                name="trash.fill"
                size={20}
                color={isLoading ? COLORS.text.tertiary : COLORS.status.error}
              />
              <View style={styles.optionText}>
                <ThemedText
                  style={[styles.optionTitle, isLoading && styles.textDisabled]}
                >
                  Clear All Data
                </ThemedText>
                <ThemedText
                  style={[
                    styles.optionSubtitle,
                    isLoading && styles.textDisabled,
                  ]}
                >
                  Delete all habits and progress permanently
                </ThemedText>
              </View>
            </View>
            <IconSymbol
              name="chevron.right"
              size={16}
              color={isLoading ? COLORS.text.tertiary : COLORS.text.secondary}
            />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.warning}>
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={20}
            color={COLORS.status.warning}
          />
          <ThemedText style={styles.warningText}>
            Clearing data cannot be undone. Make sure to backup important
            information before proceeding.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  option: {
    backgroundColor: COLORS.background.card,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: COLORS.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionText: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
  optionSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  textDisabled: {
    color: COLORS.text.tertiary,
  },
  warning: {
    backgroundColor: COLORS.special.motivation.background,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 24,
  },
  warningText: {
    fontSize: 14,
    color: COLORS.special.motivation.text,
    marginLeft: 12,
    lineHeight: 20,
    flex: 1,
  },
});

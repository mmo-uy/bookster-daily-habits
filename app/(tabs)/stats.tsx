import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { COLORS } from "@/constants/colors";
import { useHabits } from "@/context/HabitsContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getLast7Days } from "@/utils/date";

const screenWidth = Dimensions.get("window").width;

export default function StatsScreen() {
  const { state, getCompletedCountForDate } = useHabits();
  const colorScheme = useColorScheme();

  const stats = useMemo(() => {
    const last7Days = getLast7Days();
    const weeklyData = last7Days.map((date) => getCompletedCountForDate(date));
    const habitsByDay = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };

    state.habits.forEach((habit) => {
      habitsByDay[habit.dayOfWeek]++;
    });

    const totalHabits = state.habits.length;
    const totalCompletedThisWeek = weeklyData.reduce((a, b) => a + b, 0);
    const averagePerDay =
      totalHabits > 0 ? Math.round((totalCompletedThisWeek / 7) * 10) / 10 : 0;

    const completionRate =
      totalHabits > 0
        ? Math.round((totalCompletedThisWeek / (totalHabits * 7)) * 100)
        : 0;

    return {
      weeklyData,
      habitsByDay,
      totalHabits,
      totalCompletedThisWeek,
      averagePerDay,
      completionRate,
      last7Days,
    };
  }, [state.habits, getCompletedCountForDate]);

  const weeklyChartData = {
    labels: stats.last7Days.map((date) => {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", { weekday: "short" });
    }),
    datasets: [{ data: stats.weeklyData }],
  };

  const habitsByDayData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [
          stats.habitsByDay.monday,
          stats.habitsByDay.tuesday,
          stats.habitsByDay.wednesday,
          stats.habitsByDay.thursday,
          stats.habitsByDay.friday,
          stats.habitsByDay.saturday,
          stats.habitsByDay.sunday,
        ],
      },
    ],
  };

  const chartConfig = {
    backgroundColor:
      colorScheme === "dark"
        ? COLORS.chart.background.dark
        : COLORS.chart.background.light,
    backgroundGradientFrom:
      colorScheme === "dark"
        ? COLORS.chart.background.dark
        : COLORS.chart.background.light,
    backgroundGradientTo:
      colorScheme === "dark"
        ? COLORS.chart.background.dark
        : COLORS.chart.background.light,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    labelColor: (opacity = 1) =>
      colorScheme === "dark"
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "6", strokeWidth: "2", stroke: COLORS.chart.dots },
    yAxisLabel: "",
    yAxisSuffix: "",
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
  }) => (
    <ThemedView style={styles.statCard}>
      <View style={styles.statHeader}>
        {icon && (
          <IconSymbol name={icon as any} size={20} color={COLORS.primary} />
        )}
        <ThemedText style={styles.statTitle}>{title}</ThemedText>
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      {subtitle && (
        <ThemedText style={styles.statSubtitle}>{subtitle}</ThemedText>
      )}
    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.mainTitle}>📊 Your Progress</ThemedText>
        <ThemedText style={styles.subtitle}>
          Track your habit journey
        </ThemedText>
      </ThemedView>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Habits"
            value={stats.totalHabits}
            subtitle="Active habits"
            icon="chart.bar.fill"
          />
          <StatCard
            title="This Week"
            value={stats.totalCompletedThisWeek}
            subtitle="Completions"
            icon="checkmark"
          />
          <StatCard
            title="Daily Average"
            value={stats.averagePerDay}
            subtitle="Per day"
            icon="calendar"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.completionRate}%`}
            subtitle="Weekly completion"
            icon="star.fill"
          />
        </View>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            📈 Weekly Progress
          </ThemedText>
          <ThemedView style={styles.chartContainer}>
            <BarChart
              data={weeklyChartData}
              width={screenWidth - 32}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
            />
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🎯 Habits by Day</ThemedText>
          <ThemedView style={styles.chartContainer}>
            <BarChart
              data={habitsByDayData}
              width={screenWidth - 32}
              height={180}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
            />
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.motivationCard}>
          <ThemedText style={styles.motivationText}>
            {stats.completionRate >= 80
              ? "🌟 Excellent! You're crushing your goals!"
              : stats.completionRate >= 60
              ? "💪 Great progress! Keep it up!"
              : "🚀 Every journey starts with a single step. You've got this!"}
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    padding: 12,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.background.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 4,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 10,
    color: COLORS.text.tertiary,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    marginEnd: 0
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    marginTop: 12,
    color: COLORS.text.primary,
    textAlign: "center",
    padding: 12
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  motivationCard: {
    backgroundColor: COLORS.special.motivation.background,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  motivationText: {
    fontSize: 16,
    color: COLORS.special.motivation.text,
    textAlign: "center",
    fontWeight: "500",
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
    textAlign: "center",
  },
});

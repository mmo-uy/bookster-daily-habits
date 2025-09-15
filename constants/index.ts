import { COLORS, withOpacity } from "./colors";

export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const getChartConfig = (isDark: boolean) => ({
  backgroundColor: isDark
    ? COLORS.chart.background.dark
    : COLORS.chart.background.light,
  backgroundGradientFrom: isDark
    ? COLORS.chart.background.dark
    : COLORS.chart.background.light,
  backgroundGradientTo: isDark
    ? COLORS.chart.background.dark
    : COLORS.chart.background.light,
  decimalPlaces: 0,
  color: (opacity = 1) => withOpacity(COLORS.chart.primary, opacity),
  labelColor: (opacity = 1) =>
    isDark
      ? withOpacity(COLORS.chart.labels.dark, opacity)
      : withOpacity(COLORS.chart.labels.light, opacity),
  style: { borderRadius: 16 },
  propsForDots: { r: "6", strokeWidth: "2", stroke: COLORS.chart.dots },
  yAxisLabel: "",
  yAxisSuffix: "",
});

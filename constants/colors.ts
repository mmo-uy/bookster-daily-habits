export const COLORS = {
  primary: "#007AFF",
  primaryDark: "#0056CC",
  primaryLight: "#4DA3FF",
  secondary: "#4CAF50",
  secondaryDark: "#388E3C",
  secondaryLight: "#81C784",
  background: {
    light: "#ffffff",
    dark: "#1D3D47",
    card: "#f8f9fa",
    modal: "rgba(0, 0, 0, 0.5)",
    overlay: "rgba(255, 255, 255, 0.1)",
  },
  text: {
    primary: "#333333",
    secondary: "#666666",
    tertiary: "#888888",
    light: "rgba(255, 255, 255, 0.9)",
    dark: "rgba(0, 0, 0, 0.9)",
  },
  border: {
    light: "#ccc",
    medium: "#e0e0e0",
    dark: "#333333",
  },
  status: {
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
  },
  chart: {
    primary: "rgba(26, 255, 146, 1)",
    secondary: "rgba(255, 193, 7, 1)",
    background: {
      light: "#ffffff",
      dark: "#1D3D47",
    },
    labels: {
      light: "rgba(0, 0, 0, 1)",
      dark: "rgba(255, 255, 255, 1)",
    },
    dots: "#ffa726",
  },
  shadow: {
    color: "#000",
    light: "rgba(0, 0, 0, 0.1)",
    medium: "rgba(0, 0, 0, 0.25)",
  },
  special: {
    motivation: {
      background: "#e8f5e8",
      text: "#2e7d32",
    },
    white: "#ffffff",
    black: "#000000",
  },
  opacity: {
    low: 0.6,
    medium: 0.7,
    high: 0.9,
  },
} as const;


export type ColorKey = keyof typeof COLORS;

export const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith("rgba")) {
    return color.replace(/[\d.]+\)$/g, `${opacity})`);
  }
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};


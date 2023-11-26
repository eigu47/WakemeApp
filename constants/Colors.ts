import { useColorScheme } from "react-native";

export const COLORS = {
  light: {
    background: "#ffffff",
    foreground: "#020817",
    card: "#ffffff",
    cardForeground: "#020817",
    popover: "#ffffff",
    popoverForeground: "#020817",
    primary: "#2563eb",
    primaryForeground: "#f8fafc",
    secondary: "#f1f5f9",
    secondaryForeground: "#0f172a",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    accent: "#f1f5f9",
    accentForeground: "#0f172a",
    destructive: "#ef4444",
    destructiveForeground: "#f8fafc",
    border: "#e2e8f0",
    input: "#e2e8f0",
    ring: "#2563eb",
  },
  dark: {
    background: "#020817",
    foreground: "#f8fafc",
    card: "#020817",
    cardForeground: "#f8fafc",
    popover: "#020817",
    popoverForeground: "#f8fafc",
    primary: "#3b82f6",
    primaryForeground: "#0f172a",
    secondary: "#1e293b",
    secondaryForeground: "#f8fafc",
    muted: "#1e293b",
    mutedForeground: "#94a3b8",
    accent: "#1e293b",
    accentForeground: "#f8fafc",
    destructive: "#7f1d1d",
    destructiveForeground: "#f8fafc",
    border: "#1e293b",
    input: "#1e293b",
    ring: "#1d4ed8",
  },
};

export type ColorSchema = (typeof COLORS)[keyof typeof COLORS];

export function useGetColor(color: keyof ColorSchema): string;
export function useGetColor(): ColorSchema;
export function useGetColor(color?: keyof ColorSchema) {
  const theme = useColorScheme() ?? "light";

  if (color) {
    return COLORS[theme][color];
  }

  return COLORS[theme];
}

export function hexToRgb(hex: string, alpha?: number) {
  if (hex.length !== 7 || !hex.startsWith("#")) {
    return "rgb(0,0,0)";
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (alpha && alpha >= 0 && alpha <= 1) {
    return `rgba(${r},${g},${b},${alpha})`;
  }

  return `rgb(${r},${g},${b})`;
}

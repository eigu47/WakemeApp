export const COLORS = {
  background: "#0f172a",
  foreground: "#f8fafc",
  primary: "#3b82f6",
  secondary: "#1e293b",
  muted: "#94a3b8",
  destructive: "#7f1d1d",
  ring: "#1d4ed8",
};

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

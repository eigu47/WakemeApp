const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";

const COLORS: Record<
  "light" | "dark",
  {
    text: string;
    background: string;
    tint: string;
    tabIconDefault: string;
    tabIconSelected: string;
  }
> = {
  light: {
    text: "#000",
    background: "#fff",
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#fff",
    background: "#000",
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
  },
};

export default COLORS;

export function getColor(
  theme: keyof typeof COLORS,
  color: keyof typeof COLORS.light,
) {
  return COLORS[theme][color];
}

export function hexToRgb(hex: string, alpha?: number) {
  if (hex.length !== 7) {
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

import { PROJECT_COLORS } from "../types/project";

const HEX6 = /^#([0-9A-Fa-f]{6})$/;
const HEX3 = /^#([0-9A-Fa-f]{3})$/;

export function isValidProjectColor(color: string): boolean {
  const trimmed = color.trim();
  return HEX6.test(trimmed) || HEX3.test(trimmed);
}

export function normalizeProjectColor(
  color: string | undefined,
  fallback: string = PROJECT_COLORS[0],
): string {
  if (!color) {
    return fallback;
  }

  const trimmed = color.trim();
  if (HEX6.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  const short = trimmed.match(HEX3);
  if (short) {
    const [r, g, b] = short[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return fallback;
}

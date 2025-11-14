import { StatType } from "./types";

/**
 * Animation utility functions for calculating element positions and colors
 * Requirements: 1.5, 3.3, 3.4
 */

// Stat color mapping constants
export const STAT_COLORS: Record<StatType, string> = {
  PHY: "#22d3ee", // cyan
  INT: "#a855f7", // purple
  IMP: "#fb923c", // orange
  SOC: "#4ade80", // green
};

/**
 * Get the center position of an element using getBoundingClientRect
 * Returns viewport coordinates
 */
export function getElementCenter(element: HTMLElement | null): {
  x: number;
  y: number;
} | null {
  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

/**
 * Get the bounding rectangle of an element
 */
export function getElementRect(element: HTMLElement | null): DOMRect | null {
  if (!element) {
    return null;
  }

  return element.getBoundingClientRect();
}

/**
 * Convert hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB components to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Lighten a hex color by a percentage (0-100)
 * Used for creating lighter variants of stat colors for confetti
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return hex;
  }

  const amount = (percent / 100) * 255;
  const r = Math.min(255, rgb.r + amount);
  const g = Math.min(255, rgb.g + amount);
  const b = Math.min(255, rgb.b + amount);

  return rgbToHex(r, g, b);
}

/**
 * Darken a hex color by a percentage (0-100)
 * Used for creating darker variants of stat colors
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return hex;
  }

  const amount = (percent / 100) * 255;
  const r = Math.max(0, rgb.r - amount);
  const g = Math.max(0, rgb.g - amount);
  const b = Math.max(0, rgb.b - amount);

  return rgbToHex(r, g, b);
}

/**
 * Get an array of color variants for confetti effects
 * Returns the base color and two lighter variants
 */
export function getConfettiColors(baseColor: string): string[] {
  return [baseColor, lightenColor(baseColor, 20), lightenColor(baseColor, 40)];
}

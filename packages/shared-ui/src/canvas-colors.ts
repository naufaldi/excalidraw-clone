/**
 * Canvas Color System - Variant 1: Classic Excalidraw
 *
 * This module provides TypeScript types and utilities for the canvas color system.
 * Colors are defined using OKLCH color space for better perceptual uniformity.
 */

export interface CanvasColors {
  background: {
    canvas: string;
    grid: string;
    selection: string;
  };
  stroke: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    purple: string;
    pink: string;
    orange: string;
    muted: string;
  };
  fill: {
    transparent: string;
    white: string;
    light: string;
    highlight: string;
  };
  element: {
    rectangle: string;
    circle: string;
    arrow: string;
    text: string;
  };
}

/**
 * Get canvas colors for the current theme
 */
export function getCanvasColors(): CanvasColors {
  const styles = getComputedStyle(document.documentElement);

  return {
    background: {
      canvas: styles.getPropertyValue('--canvas-background').trim(),
      grid: styles.getPropertyValue('--canvas-grid').trim(),
      selection: styles.getPropertyValue('--canvas-selection').trim(),
    },
    stroke: {
      primary: styles.getPropertyValue('--stroke-primary').trim(),
      secondary: styles.getPropertyValue('--stroke-secondary').trim(),
      accent: styles.getPropertyValue('--stroke-accent').trim(),
      success: styles.getPropertyValue('--stroke-success').trim(),
      warning: styles.getPropertyValue('--stroke-warning').trim(),
      purple: styles.getPropertyValue('--stroke-purple').trim(),
      pink: styles.getPropertyValue('--stroke-pink').trim(),
      orange: styles.getPropertyValue('--stroke-orange').trim(),
      muted: styles.getPropertyValue('--stroke-muted').trim(),
    },
    fill: {
      transparent: styles.getPropertyValue('--fill-transparent').trim(),
      white: styles.getPropertyValue('--fill-white').trim(),
      light: styles.getPropertyValue('--fill-light').trim(),
      highlight: styles.getPropertyValue('--fill-highlight').trim(),
    },
    element: {
      rectangle: styles.getPropertyValue('--element-rectangle').trim(),
      circle: styles.getPropertyValue('--element-circle').trim(),
      arrow: styles.getPropertyValue('--element-arrow').trim(),
      text: styles.getPropertyValue('--element-text').trim(),
    },
  };
}

/**
 * Predefined color palettes for different use cases
 */
export const CANVAS_COLOR_PRESETS = {
  basic: [
    { name: 'Black', value: 'var(--stroke-primary)', element: 'stroke-primary' },
    { name: 'Red', value: 'var(--stroke-secondary)', element: 'stroke-secondary' },
    { name: 'Blue', value: 'var(--stroke-accent)', element: 'stroke-accent' },
    { name: 'Green', value: 'var(--stroke-success)', element: 'stroke-success' },
    { name: 'Yellow', value: 'var(--stroke-warning)', element: 'stroke-warning' },
  ],
  extended: [
    { name: 'Black', value: 'var(--stroke-primary)', element: 'stroke-primary' },
    { name: 'Red', value: 'var(--stroke-secondary)', element: 'stroke-secondary' },
    { name: 'Blue', value: 'var(--stroke-accent)', element: 'stroke-accent' },
    { name: 'Green', value: 'var(--stroke-success)', element: 'stroke-success' },
    { name: 'Yellow', value: 'var(--stroke-warning)', element: 'stroke-warning' },
    { name: 'Purple', value: 'var(--stroke-purple)', element: 'stroke-purple' },
    { name: 'Pink', value: 'var(--stroke-pink)', element: 'stroke-pink' },
    { name: 'Orange', value: 'var(--stroke-orange)', element: 'stroke-orange' },
  ],
  fill: [
    { name: 'Transparent', value: 'var(--fill-transparent)', element: 'fill-transparent' },
    { name: 'White', value: 'var(--fill-white)', element: 'fill-white' },
    { name: 'Light Gray', value: 'var(--fill-light)', element: 'fill-light' },
    { name: 'Highlight', value: 'var(--fill-highlight)', element: 'fill-highlight' },
  ],
} as const;

/**
 * CSS class names for canvas colors
 */
export const CANVAS_COLOR_CLASSES = {
  canvas: 'bg-[var(--canvas-background)]',
  canvasGrid: 'bg-[var(--canvas-grid)]',
  canvasSelection: 'bg-[var(--canvas-selection)]',
  stroke: {
    primary: 'stroke-[var(--stroke-primary)]',
    secondary: 'stroke-[var(--stroke-secondary)]',
    accent: 'stroke-[var(--stroke-accent)]',
    success: 'stroke-[var(--stroke-success)]',
    warning: 'stroke-[var(--stroke-warning)]',
    purple: 'stroke-[var(--stroke-purple)]',
    pink: 'stroke-[var(--stroke-pink)]',
    orange: 'stroke-[var(--stroke-orange)]',
    muted: 'stroke-[var(--stroke-muted)]',
  },
  fill: {
    transparent: 'fill-[var(--fill-transparent)]',
    white: 'fill-[var(--fill-white)]',
    light: 'fill-[var(--fill-light)]',
    highlight: 'fill-[var(--fill-highlight)]',
  },
} as const;

/**
 * TailwindCSS utility classes for canvas elements
 */
export const canvasUtilities = {
  // Canvas background
  canvas: 'bg-[var(--canvas-background)]',
  canvasGrid: 'bg-[var(--canvas-grid)]',
  canvasSelection: 'bg-[var(--canvas-selection)]',

  // Stroke colors
  strokePrimary: 'stroke-[var(--stroke-primary)]',
  strokeSecondary: 'stroke-[var(--stroke-secondary)]',
  strokeAccent: 'stroke-[var(--stroke-accent)]',
  strokeSuccess: 'stroke-[var(--stroke-success)]',
  strokeWarning: 'stroke-[var(--stroke-warning)]',
  strokePurple: 'stroke-[var(--stroke-purple)]',
  strokePink: 'stroke-[var(--stroke-pink)]',
  strokeOrange: 'stroke-[var(--stroke-orange)]',
  strokeMuted: 'stroke-[var(--stroke-muted)]',

  // Fill colors
  fillTransparent: 'fill-[var(--fill-transparent)]',
  fillWhite: 'fill-[var(--fill-white)]',
  fillLight: 'fill-[var(--fill-light)]',
  fillHighlight: 'fill-[var(--fill-highlight)]',

  // Text colors
  textCanvas: 'text-[var(--element-text)]',

  // Border colors
  borderCanvas: 'border-[var(--canvas-grid)]',
} as const;

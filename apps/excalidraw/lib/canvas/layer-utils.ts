/**
 * @file Layer Utilities
 * Z-index manipulation utilities for layer controls
 */

import type { Element } from "../database/shared/types.js";

/**
 * Get the maximum z-index from all elements
 */
export function getMaxZIndex(elements: Element[]): number {
  if (elements.length === 0) return 0;
  return Math.max(...elements.map((el) => el.zIndex));
}

/**
 * Get the minimum z-index from all elements
 */
export function getMinZIndex(elements: Element[]): number {
  if (elements.length === 0) return 0;
  return Math.min(...elements.map((el) => el.zIndex));
}

/**
 * Calculate z-index to bring element(s) to front
 * Returns max z-index + 1
 */
export function bringToFrontZIndex(elements: Element[]): number {
  return getMaxZIndex(elements) + 1;
}

/**
 * Calculate z-index to send element(s) to back
 * Returns min z-index - 1
 */
export function sendToBackZIndex(elements: Element[]): number {
  return getMinZIndex(elements) - 1;
}

/**
 * Calculate z-index to bring element forward one layer
 * Finds the next higher z-index and positions element above it
 */
export function bringForwardZIndex(element: Element, allElements: Element[]): number {
  const currentZ = element.zIndex;

  // Find all elements with z-index higher than current
  const higherElements = allElements
    .filter((el) => el.id !== element.id && el.zIndex > currentZ)
    .sort((a, b) => a.zIndex - b.zIndex);

  // If no higher elements, already at top
  if (higherElements.length === 0) {
    return currentZ;
  }

  // Get the next higher z-index
  const nextZ = higherElements[0].zIndex;

  // If there's a gap, move into it
  if (nextZ > currentZ + 1) {
    return currentZ + 1;
  }

  // No gap, position above the next element
  return nextZ + 1;
}

/**
 * Calculate z-index to send element backward one layer
 * Finds the next lower z-index and positions element below it
 */
export function sendBackwardZIndex(element: Element, allElements: Element[]): number {
  const currentZ = element.zIndex;

  // Find all elements with z-index lower than current
  const lowerElements = allElements
    .filter((el) => el.id !== element.id && el.zIndex < currentZ)
    .sort((a, b) => b.zIndex - a.zIndex); // Descending

  // If no lower elements, already at bottom
  if (lowerElements.length === 0) {
    return currentZ;
  }

  // Get the next lower z-index
  const nextZ = lowerElements[0].zIndex;

  // If there's a gap, move into it
  if (nextZ < currentZ - 1) {
    return currentZ - 1;
  }

  // No gap, position below the next element
  return nextZ - 1;
}

/**
 * Normalize z-index values to eliminate gaps
 * Reassigns z-index from 0 upward based on current order
 * Useful for preventing z-index from growing unbounded
 */
export function normalizeZIndex(elements: Element[]): Element[] {
  if (elements.length === 0) return [];

  // Sort by current z-index
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // Reassign z-index sequentially
  return sorted.map((element, index) => ({
    ...element,
    zIndex: index,
  }));
}

/**
 * Get elements sorted by z-index (bottom to top)
 */
export function sortByZIndex(elements: Element[]): Element[] {
  return [...elements].sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Check if element is at the front (highest z-index)
 */
export function isAtFront(element: Element, allElements: Element[]): boolean {
  const maxZ = getMaxZIndex(allElements);
  return element.zIndex === maxZ;
}

/**
 * Check if element is at the back (lowest z-index)
 */
export function isAtBack(element: Element, allElements: Element[]): boolean {
  const minZ = getMinZIndex(allElements);
  return element.zIndex === minZ;
}

/**
 * Bring the selected element(s) to the front.
 *
 * For multi-selection, preserves the relative order within the selection
 * by sorting selected elements by their current zIndex ascending and assigning
 * consecutive zIndex values above the current maximum.
 */
export function bringSelectionToFront(elements: Element[], selectedIds: Set<string>): Element[] {
  if (selectedIds.size === 0 || elements.length === 0) return elements;

  const selected = elements
    .filter((el) => selectedIds.has(el.id))
    .sort((a, b) => a.zIndex - b.zIndex);
  if (selected.length === 0) return elements;

  let nextZ = getMaxZIndex(elements) + 1;
  const zById = new Map<string, number>();
  for (const el of selected) {
    zById.set(el.id, nextZ);
    nextZ += 1;
  }

  return elements.map((el) => (zById.has(el.id) ? { ...el, zIndex: zById.get(el.id)! } : el));
}

/**
 * Send the selected element(s) to the back.
 *
 * For multi-selection, preserves the relative order within the selection
 * by sorting selected elements by their current zIndex ascending and assigning
 * consecutive zIndex values below the current minimum.
 */
export function sendSelectionToBack(elements: Element[], selectedIds: Set<string>): Element[] {
  if (selectedIds.size === 0 || elements.length === 0) return elements;

  const selected = elements
    .filter((el) => selectedIds.has(el.id))
    .sort((a, b) => a.zIndex - b.zIndex);
  if (selected.length === 0) return elements;

  let nextZ = getMinZIndex(elements) - selected.length;
  const zById = new Map<string, number>();
  for (const el of selected) {
    zById.set(el.id, nextZ);
    nextZ += 1;
  }

  return elements.map((el) => (zById.has(el.id) ? { ...el, zIndex: zById.get(el.id)! } : el));
}

/**
 * Bring the selected element forward one step.
 *
 * Initial scope: only supports single selection.
 */
export function bringSelectionForward(elements: Element[], selectedIds: Set<string>): Element[] {
  if (selectedIds.size !== 1 || elements.length === 0) return elements;

  const selectedId = Array.from(selectedIds)[0];
  const element = elements.find((el) => el.id === selectedId);
  if (!element) return elements;

  const newZIndex = bringForwardZIndex(element, elements);
  if (newZIndex === element.zIndex) return elements;

  return elements.map((el) => (el.id === selectedId ? { ...el, zIndex: newZIndex } : el));
}

/**
 * Send the selected element backward one step.
 *
 * Initial scope: only supports single selection.
 */
export function sendSelectionBackward(elements: Element[], selectedIds: Set<string>): Element[] {
  if (selectedIds.size !== 1 || elements.length === 0) return elements;

  const selectedId = Array.from(selectedIds)[0];
  const element = elements.find((el) => el.id === selectedId);
  if (!element) return elements;

  const newZIndex = sendBackwardZIndex(element, elements);
  if (newZIndex === element.zIndex) return elements;

  return elements.map((el) => (el.id === selectedId ? { ...el, zIndex: newZIndex } : el));
}

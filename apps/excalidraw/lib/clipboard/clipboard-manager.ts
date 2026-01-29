/**
 * @file Clipboard Manager
 * Singleton clipboard for copy/paste operations
 * Stores element data in memory for internal copy/paste functionality
 */

import type { Element } from "../database/shared/types.js";

/**
 * ClipboardManager - Singleton class for managing copied elements
 * Uses internal memory storage (not browser clipboard API) for simplicity and reliability
 */
class ClipboardManager {
  private static instance: ClipboardManager;
  private clipboardData: Element[] | null = null;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Private to prevent direct instantiation
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ClipboardManager {
    if (!ClipboardManager.instance) {
      ClipboardManager.instance = new ClipboardManager();
    }
    return ClipboardManager.instance;
  }

  /**
   * Copy elements to clipboard
   * Creates deep clones to prevent mutation of original elements
   *
   * @param elements - Array of elements to copy
   */
  public copy(elements: Element[]): void {
    if (!elements || elements.length === 0) {
      // Gracefully handle empty copy
      this.clipboardData = null;
      return;
    }

    // Deep clone elements to prevent mutation
    this.clipboardData = elements.map((element) => this.deepCloneElement(element));

    console.log(`[Clipboard] Copied ${elements.length} element(s)`);
  }

  /**
   * Get elements from clipboard
   * Returns deep clones to prevent mutation
   *
   * @returns Array of elements from clipboard, or null if clipboard is empty
   */
  public paste(): Element[] | null {
    if (!this.clipboardData || this.clipboardData.length === 0) {
      return null;
    }

    // Return deep clones to allow multiple pastes
    const clonedData = this.clipboardData.map((element) => this.deepCloneElement(element));

    console.log(`[Clipboard] Pasting ${clonedData.length} element(s)`);
    return clonedData;
  }

  /**
   * Clear clipboard
   */
  public clear(): void {
    this.clipboardData = null;
    console.log("[Clipboard] Cleared");
  }

  /**
   * Check if clipboard has data
   */
  public hasData(): boolean {
    return this.clipboardData !== null && this.clipboardData.length > 0;
  }

  /**
   * Get clipboard size (number of elements)
   */
  public getSize(): number {
    return this.clipboardData?.length ?? 0;
  }

  /**
   * Deep clone an element to prevent mutation
   * Handles all element properties including nested objects
   *
   * @param element - Element to clone
   * @returns Deep cloned element
   */
  private deepCloneElement(element: Element): Element {
    // Handle points array for pen tool (if present)
    const clonedPoints = element.points ? element.points.map((point) => ({ ...point })) : undefined;

    // Create deep clone of element
    const cloned: Element = {
      ...element,
      // Clone dates as new Date objects (handle potentially undefined values)
      createdAt: element.createdAt ? new Date(element.createdAt) : new Date(),
      updatedAt: element.updatedAt ? new Date(element.updatedAt) : new Date(),
      // Clone points array if present
      ...(clonedPoints && { points: clonedPoints }),
    };

    return cloned;
  }
}

// Export singleton instance
export const clipboardManager = ClipboardManager.getInstance();

// Also export the class for testing
export { ClipboardManager };

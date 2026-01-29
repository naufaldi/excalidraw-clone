/**
 * @file Transform Utilities
 * Calculations for resize and rotation handles
 */

import type { Element, Point } from "../database/shared/types.js";

/**
 * Handle types for transform operations
 */
export type HandleType =
  | "nw" // Northwest corner
  | "n" // North edge
  | "ne" // Northeast corner
  | "e" // East edge
  | "se" // Southeast corner
  | "s" // South edge
  | "sw" // Southwest corner
  | "w" // West edge
  | "rotate"; // Rotation handle

/**
 * Handle position with coordinates and type
 */
export interface HandlePosition {
  type: HandleType;
  x: number;
  y: number;
  cursor: string;
}

/**
 * Bounding box for an element
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Transform result including new bounds and optional rotation
 */
export interface TransformResult {
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
}

/**
 * Handle size constants
 */
export const HANDLE_SIZE = 8;
export const ROTATION_HANDLE_SIZE = 10;
export const ROTATION_HANDLE_OFFSET = 30; // Distance above element
export const MIN_ELEMENT_SIZE = 10; // Minimum width/height

/**
 * Get cursor style for a handle type
 */
export function getCursorForHandle(handle: HandleType): string {
  const cursors: Record<HandleType, string> = {
    nw: "nwse-resize",
    ne: "nesw-resize",
    se: "nwse-resize",
    sw: "nesw-resize",
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
    rotate: "grab",
  };
  return cursors[handle];
}

/**
 * Calculate handle positions for an element
 * Returns array of handles with coordinates
 */
export function getHandlePositions(element: Element): HandlePosition[] {
  const x = element.x;
  const y = element.y;
  const width = element.width || 0;
  const height = element.height || 0;

  const handles: HandlePosition[] = [];

  // Corner handles
  handles.push({ type: "nw", x, y, cursor: getCursorForHandle("nw") });
  handles.push({
    type: "ne",
    x: x + width,
    y,
    cursor: getCursorForHandle("ne"),
  });
  handles.push({
    type: "se",
    x: x + width,
    y: y + height,
    cursor: getCursorForHandle("se"),
  });
  handles.push({
    type: "sw",
    x,
    y: y + height,
    cursor: getCursorForHandle("sw"),
  });

  // Edge handles
  handles.push({
    type: "n",
    x: x + width / 2,
    y,
    cursor: getCursorForHandle("n"),
  });
  handles.push({
    type: "e",
    x: x + width,
    y: y + height / 2,
    cursor: getCursorForHandle("e"),
  });
  handles.push({
    type: "s",
    x: x + width / 2,
    y: y + height,
    cursor: getCursorForHandle("s"),
  });
  handles.push({
    type: "w",
    x,
    y: y + height / 2,
    cursor: getCursorForHandle("w"),
  });

  // Rotation handle (above center-top)
  handles.push({
    type: "rotate",
    x: x + width / 2,
    y: y - ROTATION_HANDLE_OFFSET,
    cursor: getCursorForHandle("rotate"),
  });

  return handles;
}

/**
 * Check if a point hits a handle
 * Returns the handle type if hit, null otherwise
 */
export function getHandleAtPoint(element: Element, point: Point): HandleType | null {
  const handles = getHandlePositions(element);
  const hitRadius = HANDLE_SIZE;

  for (const handle of handles) {
    const dx = point.x - handle.x;
    const dy = point.y - handle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= hitRadius) {
      return handle.type;
    }
  }

  return null;
}

/**
 * Calculate new bounds when resizing from a handle
 * @param originalBounds - Original element bounds
 * @param handle - Handle being dragged
 * @param delta - Mouse movement delta {x, y}
 * @param lockAspectRatio - Whether to maintain aspect ratio (Shift key)
 */
export function calculateResizeBounds(
  originalBounds: Bounds,
  handle: HandleType,
  delta: Point,
  lockAspectRatio: boolean = false,
): TransformResult {
  let { x, y, width, height } = originalBounds;
  const aspectRatio = width / height;

  switch (handle) {
    // Corner handles (resize from origin)
    case "nw":
      width = Math.max(MIN_ELEMENT_SIZE, width - delta.x);
      height = Math.max(MIN_ELEMENT_SIZE, height - delta.y);

      if (lockAspectRatio) {
        height = width / aspectRatio;
      }

      x = originalBounds.x + originalBounds.width - width;
      y = originalBounds.y + originalBounds.height - height;
      break;

    case "ne":
      width = Math.max(MIN_ELEMENT_SIZE, width + delta.x);
      height = Math.max(MIN_ELEMENT_SIZE, height - delta.y);

      if (lockAspectRatio) {
        height = width / aspectRatio;
      }

      y = originalBounds.y + originalBounds.height - height;
      break;

    case "se":
      width = Math.max(MIN_ELEMENT_SIZE, width + delta.x);
      height = Math.max(MIN_ELEMENT_SIZE, height + delta.y);

      if (lockAspectRatio) {
        height = width / aspectRatio;
      }
      break;

    case "sw":
      width = Math.max(MIN_ELEMENT_SIZE, width - delta.x);
      height = Math.max(MIN_ELEMENT_SIZE, height + delta.y);

      if (lockAspectRatio) {
        height = width / aspectRatio;
      }

      x = originalBounds.x + originalBounds.width - width;
      break;

    // Edge handles (resize in one dimension)
    case "n":
      height = Math.max(MIN_ELEMENT_SIZE, height - delta.y);
      y = originalBounds.y + originalBounds.height - height;
      break;

    case "e":
      width = Math.max(MIN_ELEMENT_SIZE, width + delta.x);
      break;

    case "s":
      height = Math.max(MIN_ELEMENT_SIZE, height + delta.y);
      break;

    case "w":
      width = Math.max(MIN_ELEMENT_SIZE, width - delta.x);
      x = originalBounds.x + originalBounds.width - width;
      break;
  }

  return { x, y, width, height };
}

/**
 * Calculate rotation angle based on mouse position
 * @param element - Element being rotated
 * @param point - Current mouse position
 */
export function calculateRotation(element: Element, point: Point): number {
  const centerX = element.x + (element.width || 0) / 2;
  const centerY = element.y + (element.height || 0) / 2;

  const dx = point.x - centerX;
  const dy = point.y - centerY;

  // Calculate angle in degrees (0° = right, 90° = down)
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  // Normalize to 0-360
  angle = ((angle + 360) % 360) | 0;

  return angle;
}

/**
 * Check if an element can be transformed
 * Only shapes (rectangles, circles) can be resized
 */
export function canTransform(element: Element): boolean {
  return (
    (element.type === "rectangle" || element.type === "circle") &&
    element.width !== undefined &&
    element.height !== undefined
  );
}

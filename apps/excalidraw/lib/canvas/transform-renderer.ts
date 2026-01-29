/**
 * @file Transform Handle Renderer
 * Renders resize and rotation handles on the canvas
 */

import type { Element } from "../database/shared/types.js";
import {
  getHandlePositions,
  HANDLE_SIZE,
  ROTATION_HANDLE_OFFSET,
  ROTATION_HANDLE_SIZE,
  type HandlePosition,
} from "./transform-utils.js";

/**
 * Render transform handles for a selected element
 * @param ctx - Canvas 2D context
 * @param element - Element to render handles for
 */
export function renderTransformHandles(ctx: CanvasRenderingContext2D, element: Element): void {
  const handles = getHandlePositions(element);

  ctx.save();

  // Draw each handle
  for (const handle of handles) {
    if (handle.type === "rotate") {
      drawRotationHandle(ctx, handle, element);
    } else if (isEdgeHandle(handle.type)) {
      drawEdgeHandle(ctx, handle);
    } else {
      drawCornerHandle(ctx, handle);
    }
  }

  ctx.restore();
}

/**
 * Draw a corner handle (square)
 */
function drawCornerHandle(ctx: CanvasRenderingContext2D, handle: HandlePosition): void {
  const halfSize = HANDLE_SIZE / 2;

  // Draw square
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#2563eb"; // Blue
  ctx.lineWidth = 1.5;

  ctx.fillRect(handle.x - halfSize, handle.y - halfSize, HANDLE_SIZE, HANDLE_SIZE);
  ctx.strokeRect(handle.x - halfSize, handle.y - halfSize, HANDLE_SIZE, HANDLE_SIZE);
}

/**
 * Draw an edge handle (rectangle)
 */
function drawEdgeHandle(ctx: CanvasRenderingContext2D, handle: HandlePosition): void {
  const halfSize = HANDLE_SIZE / 2;
  const edgeSize = 6; // Smaller for edge handles

  // Draw rectangle
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#2563eb"; // Blue
  ctx.lineWidth = 1.5;

  if (handle.type === "n" || handle.type === "s") {
    // Horizontal edge handle
    ctx.fillRect(handle.x - edgeSize, handle.y - 2, edgeSize * 2, 4);
    ctx.strokeRect(handle.x - edgeSize, handle.y - 2, edgeSize * 2, 4);
  } else {
    // Vertical edge handle
    ctx.fillRect(handle.x - 2, handle.y - edgeSize, 4, edgeSize * 2);
    ctx.strokeRect(handle.x - 2, handle.y - edgeSize, 4, edgeSize * 2);
  }
}

/**
 * Draw rotation handle (circle with line)
 */
function drawRotationHandle(
  ctx: CanvasRenderingContext2D,
  handle: HandlePosition,
  element: Element,
): void {
  const centerX = element.x + (element.width || 0) / 2;
  const centerY = element.y;

  // Draw dashed line from top-center to rotation handle
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "#94a3b8"; // Gray
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(handle.x, handle.y);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash

  // Draw circle
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#10b981"; // Green
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(handle.x, handle.y, ROTATION_HANDLE_SIZE / 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}

/**
 * Check if a handle is an edge handle
 */
function isEdgeHandle(type: string): boolean {
  return type === "n" || type === "e" || type === "s" || type === "w";
}

/**
 * Render transform preview box around element
 * Used during active transformation
 */
export function renderTransformPreview(
  ctx: CanvasRenderingContext2D,
  element: Element,
  isTransforming: boolean = false,
): void {
  const x = element.x;
  const y = element.y;
  const width = element.width || 0;
  const height = element.height || 0;

  ctx.save();

  // Draw bounding box
  ctx.strokeStyle = isTransforming ? "#3b82f6" : "#60a5fa"; // Darker blue when transforming
  ctx.lineWidth = isTransforming ? 2 : 1;
  ctx.setLineDash(isTransforming ? [] : [5, 5]);

  ctx.strokeRect(x, y, width, height);

  ctx.setLineDash([]);
  ctx.restore();
}

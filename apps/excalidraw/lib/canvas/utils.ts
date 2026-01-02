/**
 * Canvas utility functions
 */

import type { Point } from "../database/shared/types.js";
import type { Viewport } from "./types.js";

/**
 * Convert screen coordinates to canvas coordinates
 */
export function screenToCanvas(
	screenX: number,
	screenY: number,
	viewport: Viewport,
): Point {
	return {
		x: (screenX - viewport.offsetX) / viewport.zoom,
		y: (screenY - viewport.offsetY) / viewport.zoom,
	};
}

/**
 * Convert canvas coordinates to screen coordinates
 */
export function canvasToScreen(
	canvasX: number,
	canvasY: number,
	viewport: Viewport,
): Point {
	return {
		x: canvasX * viewport.zoom + viewport.offsetX,
		y: canvasY * viewport.zoom + viewport.offsetY,
	};
}

/**
 * Get mouse position relative to canvas element
 */
export function getMousePosition(
	event: MouseEvent,
	canvas: HTMLCanvasElement,
): Point {
	const rect = canvas.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top,
	};
}

/**
 * Get touch position relative to canvas element
 */
export function getTouchPosition(
	touch: Touch,
	canvas: HTMLCanvasElement,
): Point {
	const rect = canvas.getBoundingClientRect();
	return {
		x: touch.clientX - rect.left,
		y: touch.clientY - rect.top,
	};
}

/**
 * Calculate bounding box from two points
 */
export function getBoundingBox(
	start: Point,
	end: Point,
): { x: number; y: number; width: number; height: number } {
	const x = Math.min(start.x, end.x);
	const y = Math.min(start.y, end.y);
	const width = Math.abs(end.x - start.x);
	const height = Math.abs(end.y - start.y);
	return { x, y, width, height };
}

/**
 * Generate unique element ID
 */
export function generateElementId(): string {
	return `el_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get cursor style based on current tool
 */
export function getCursorForTool(tool: string, isSelecting: boolean): string {
	if (isSelecting) return "crosshair";
	switch (tool) {
		case "selection":
			return "default";
		case "hand":
			return "grab";
		case "eraser":
			return "crosshair";
		default:
			return "crosshair";
	}
}

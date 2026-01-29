/**
 * Canvas-specific type definitions
 */

import type { Element, ElementType, Point } from "../database/shared/types.js";

/**
 * Viewport state for pan/zoom
 */
export interface Viewport {
	offsetX: number;
	offsetY: number;
	zoom: number;
}

/**
 * Current drawing state
 */
export interface DrawingState {
	isDrawing: boolean;
	currentTool: ElementType;
	startPoint: Point | null;
	previewElement: Element | null;
	strokeWidth: number;
	strokeColor: string;
	fillColor: string;
	isShiftPressed: boolean;
	// Two-click line drawing state
	lineFirstPoint: Point | null;
	isLineDrawing: boolean;
}

/**
 * Canvas context wrapper
 */
export interface CanvasContext {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	viewport: Viewport;
}

/**
 * Default viewport state
 */
export const DEFAULT_VIEWPORT: Viewport = {
	offsetX: 0,
	offsetY: 0,
	zoom: 1,
};

/**
 * Default drawing state
 */
export const DEFAULT_DRAWING_STATE: DrawingState = {
	isDrawing: false,
	currentTool: "rectangle",
	startPoint: null,
	previewElement: null,
	strokeWidth: 2,
	strokeColor: "var(--stroke-primary)",
	fillColor: "var(--fill-transparent)",
	isShiftPressed: false,
	lineFirstPoint: null,
	isLineDrawing: false,
};

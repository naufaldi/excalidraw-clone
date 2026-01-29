/**
 * Element factory functions for creating canvas elements
 */

import type { Element, ElementType, Point } from "../database/shared/types.js";
import { generateElementId, getBoundingBox } from "./utils.js";

/**
 * Create a preview element during drawing
 */
export function createPreviewElement(
	tool: ElementType,
	start: Point,
	end: Point,
	strokeColor: string,
	fillColor: string,
	strokeWidth: number,
	isShiftPressed = false,
): Element {
	const now = new Date();

	// Handle constrained shapes (squares, perfect circles)
	if (isShiftPressed && (tool === "rectangle" || tool === "circle")) {
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const size = Math.max(Math.abs(dx), Math.abs(dy));
		const constrainedEnd = {
			x: start.x + (dx >= 0 ? size : -size),
			y: start.y + (dy >= 0 ? size : -size),
		};
		const { x, y, width, height } = getBoundingBox(start, constrainedEnd);

		const base: Element = {
			id: "preview",
			type: tool,
			x,
			y,
			width,
			height,
			strokeColor,
			fillColor,
			strokeWidth,
			opacity: 1,
			zIndex: 999999,
			createdAt: now,
			updatedAt: now,
		};

		return base;
	}

	// Handle center-based circle drawing
	if (tool === "circle") {
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const radius = Math.sqrt(dx * dx + dy * dy);
		const { x, y, width, height } = getBoundingBox(
			{ x: start.x - radius, y: start.y - radius },
			{ x: start.x + radius, y: start.y + radius },
		);

		return {
			id: "preview",
			type: tool,
			x,
			y,
			width,
			height,
			strokeColor,
			fillColor,
			strokeWidth,
			opacity: 1,
			zIndex: 999999,
			createdAt: now,
			updatedAt: now,
		};
	}

	const { x, y, width, height } = getBoundingBox(start, end);

	const base: Element = {
		id: "preview",
		type: tool,
		x,
		y,
		width,
		height,
		strokeColor,
		fillColor,
		strokeWidth,
		opacity: 1,
		zIndex: 999999,
		createdAt: now,
		updatedAt: now,
	};

	if (tool === "line" || tool === "arrow") {
		return {
			...base,
			x: start.x,
			y: start.y,
			width: end.x - start.x,
			height: end.y - start.y,
		};
	}

	return base;
}

/**
 * Create the final element when drawing completes
 */
export function createFinalElement(
	tool: ElementType,
	start: Point,
	end: Point,
	zIndex: number,
	strokeColor: string,
	fillColor: string,
	strokeWidth: number,
	isShiftPressed = false,
): Element | null {
	const now = new Date();

	// Handle constrained shapes (squares, perfect circles)
	if (isShiftPressed && (tool === "rectangle" || tool === "circle")) {
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const size = Math.max(Math.abs(dx), Math.abs(dy));
		const constrainedEnd = {
			x: start.x + (dx >= 0 ? size : -size),
			y: start.y + (dy >= 0 ? size : -size),
		};
		const { x, y, width, height } = getBoundingBox(start, constrainedEnd);

		if (width < 5 && height < 5) {
			return null;
		}

		return {
			id: generateElementId(),
			type: tool,
			x,
			y,
			width,
			height,
			strokeColor,
			fillColor,
			strokeWidth,
			opacity: 1,
			zIndex,
			createdAt: now,
			updatedAt: now,
		};
	}

	// Handle center-based circle drawing
	if (tool === "circle") {
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const radius = Math.sqrt(dx * dx + dy * dy);

		if (radius < 5) {
			return null;
		}

		const { x, y, width, height } = getBoundingBox(
			{ x: start.x - radius, y: start.y - radius },
			{ x: start.x + radius, y: start.y + radius },
		);

		return {
			id: generateElementId(),
			type: tool,
			x,
			y,
			width,
			height,
			strokeColor,
			fillColor,
			strokeWidth,
			opacity: 1,
			zIndex,
			createdAt: now,
			updatedAt: now,
		};
	}

	const { x, y, width, height } = getBoundingBox(start, end);

	if (width < 5 && height < 5) {
		return null;
	}

	const base: Element = {
		id: generateElementId(),
		type: tool,
		x,
		y,
		width,
		height,
		strokeColor,
		fillColor,
		strokeWidth,
		opacity: 1,
		zIndex,
		createdAt: now,
		updatedAt: now,
	};

	if (tool === "line" || tool === "arrow") {
		return {
			...base,
			x: start.x,
			y: start.y,
			width: end.x - start.x,
			height: end.y - start.y,
		};
	}

	return base;
}

/**
 * Create a pen element with initial point
 */
export function createPenPreviewElement(
	point: Point,
	strokeColor: string,
	fillColor: string,
	strokeWidth: number,
): Element {
	return {
		id: "preview",
		type: "pen",
		x: 0,
		y: 0,
		points: [point],
		strokeColor,
		fillColor,
		strokeWidth,
		opacity: 1,
		zIndex: 999999,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

/**
 * Create a text element at the given point
 */
export function createTextElement(point: Point, zIndex: number): Element {
	return {
		id: generateElementId(),
		type: "text",
		x: point.x,
		y: point.y,
		text: "Double-click to edit",
		fontSize: 16,
		strokeColor: "#000000",
		fillColor: "transparent",
		strokeWidth: 0,
		opacity: 1,
		zIndex,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

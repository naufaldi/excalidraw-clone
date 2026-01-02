/**
 * Selection and hit testing utilities for canvas elements
 */

import type { Element, Point } from "../database/shared/types.js";

/** Bounding box representation */
export interface BoundingBox {
	x: number;
	y: number;
	width: number;
	height: number;
}

/** Selection state for the canvas */
export interface SelectionState {
	selectedIds: Set<string>;
	selectionBox: BoundingBox | null;
	isSelecting: boolean;
	selectionStartPoint: Point | null;
}

/** Create empty selection state */
export function createEmptySelection(): SelectionState {
	return {
		selectedIds: new Set(),
		selectionBox: null,
		isSelecting: false,
		selectionStartPoint: null,
	};
}

/** Check if a point is inside a bounding box */
export function isPointInBox(
	point: Point,
	box: BoundingBox,
	padding = 0,
): boolean {
	return (
		point.x >= box.x - padding &&
		point.x <= box.x + box.width + padding &&
		point.y >= box.y - padding &&
		point.y <= box.y + box.height + padding
	);
}

/** Get bounding box for an element */
export function getElementBoundingBox(element: Element): BoundingBox {
	const { x, y, width = 0, height = 0 } = element;
	return { x, y, width, height };
}

/** Check if a point is inside a rectangle element */
export function hitTestRectangle(
	element: Element,
	point: Point,
	strokePadding = 5,
): boolean {
	const box = getElementBoundingBox(element);
	const paddedBox: BoundingBox = {
		x: box.x - strokePadding,
		y: box.y - strokePadding,
		width: box.width + strokePadding * 2,
		height: box.height + strokePadding * 2,
	};
	return isPointInBox(point, paddedBox);
}

/** Check if a point is inside a circle/ellipse element */
export function hitTestCircle(element: Element, point: Point): boolean {
	const { x, y, width = 0, height = 0 } = element;
	const centerX = x + width / 2;
	const centerY = y + height / 2;
	const radiusX = width / 2;
	const radiusY = height / 2;

	const dx = point.x - centerX;
	const dy = point.y - centerY;
	return (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1;
}

/** Check if a point is near a line segment */
export function hitTestLine(
	element: Element,
	point: Point,
	strokePadding = 5,
): boolean {
	const { x, y, width = 0, height = 0 } = element;
	const x1 = x;
	const y1 = y;
	const x2 = x + width;
	const y2 = y + height;

	const A = point.x - x1;
	const B = point.y - y1;
	const C = x2 - x1;
	const D = y2 - y1;

	const dot = A * C + B * D;
	const lenSq = C * C + D * D;
	let param = -1;

	if (lenSq !== 0) {
		param = dot / lenSq;
	}

	let xx: number;
	let yy: number;

	if (param < 0) {
		xx = x1;
		yy = y1;
	} else if (param > 1) {
		xx = x2;
		yy = y2;
	} else {
		xx = x1 + param * C;
		yy = y1 + param * D;
	}

	const dx = point.x - xx;
	const dy = point.y - yy;
	const distance = Math.sqrt(dx * dx + dy * dy);

	return distance <= strokePadding;
}

/** Check if a point is near an arrow */
export function hitTestArrow(
	element: Element,
	point: Point,
	strokePadding = 5,
): boolean {
	if (hitTestLine(element, point, strokePadding)) {
		return true;
	}

	const { x, y, width = 0, height = 0 } = element;
	const endX = x + width;
	const endY = y + height;
	const headLength = 15;

	const angle = Math.atan2(height, width);
	const arrowheadCenterX = endX - headLength * Math.cos(angle) * 0.5;
	const arrowheadCenterY = endY - headLength * Math.sin(angle) * 0.5;
	const arrowheadRadius = headLength;

	const dx = point.x - arrowheadCenterX;
	const dy = point.y - arrowheadCenterY;
	const distance = Math.sqrt(dx * dx + dy * dy);

	return distance <= arrowheadRadius + strokePadding;
}

/** Check if a point is within a text element's bounding box */
export function hitTestText(
	element: Element,
	point: Point,
	strokePadding = 5,
): boolean {
	const { x, y, text, fontSize = 16 } = element;
	if (!text) return false;

	const textWidth = text.length * fontSize * 0.6;
	const textHeight = fontSize;

	const box: BoundingBox = {
		x: x - strokePadding,
		y: y - fontSize - strokePadding,
		width: textWidth + strokePadding * 2,
		height: textHeight + strokePadding * 2,
	};

	return isPointInBox(point, box);
}

/** Check if a point is on a pen/freehand path */
export function hitTestPen(
	element: Element,
	point: Point,
	strokePadding = 5,
): boolean {
	const { points } = element;
	if (!points || points.length < 2) return false;

	for (let i = 0; i < points.length - 1; i++) {
		const x1 = points[i].x;
		const y1 = points[i].y;
		const x2 = points[i + 1].x;
		const y2 = points[i + 1].y;

		const A = point.x - x1;
		const B = point.y - y1;
		const C = x2 - x1;
		const D = y2 - y1;

		const dot = A * C + B * D;
		const lenSq = C * C + D * D;
		let param = -1;

		if (lenSq !== 0) {
			param = dot / lenSq;
		}

		let xx: number;
		let yy: number;

		if (param < 0) {
			xx = x1;
			yy = y1;
		} else if (param > 1) {
			xx = x2;
			yy = y2;
		} else {
			xx = x1 + param * C;
			yy = y1 + param * D;
		}

		const dx = point.x - xx;
		const dy = point.y - yy;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance <= strokePadding) {
			return true;
		}
	}

	return false;
}

/** Main hit test function - checks if a point hits an element */
export function hitTestElement(
	element: Element,
	point: Point,
	strokePadding = 5,
): boolean {
	switch (element.type) {
		case "rectangle":
			return hitTestRectangle(element, point, strokePadding);
		case "circle":
			return hitTestCircle(element, point);
		case "line":
			return hitTestLine(element, point, strokePadding);
		case "arrow":
			return hitTestArrow(element, point, strokePadding);
		case "text":
			return hitTestText(element, point, strokePadding);
		case "pen":
			return hitTestPen(element, point, strokePadding);
		default:
			return false;
	}
}

/** Find all elements that contain the given point */
export function findElementsAtPoint(
	elements: Element[],
	point: Point,
	strokePadding = 5,
): Element[] {
	const hitElements: Element[] = [];

	for (const element of elements) {
		if (hitTestElement(element, point, strokePadding)) {
			hitElements.push(element);
		}
	}

	return hitElements.sort((a, b) => b.zIndex - a.zIndex);
}

/** Find all elements within a selection box */
export function findElementsInBox(
	elements: Element[],
	box: BoundingBox,
): Element[] {
	const containedElements: Element[] = [];

	for (const element of elements) {
		const elementBox = getElementBoundingBox(element);

		const isFullyInside =
			elementBox.x >= box.x &&
			elementBox.y >= box.y &&
			elementBox.x + elementBox.width <= box.x + box.width &&
			elementBox.y + elementBox.height <= box.y + box.height;

		if (isFullyInside) {
			containedElements.push(element);
		}
	}

	return containedElements;
}

/** Get the combined bounding box of multiple elements */
export function getCombinedBoundingBox(
	elements: Element[],
): BoundingBox | null {
	if (elements.length === 0) return null;

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	for (const element of elements) {
		const box = getElementBoundingBox(element);
		minX = Math.min(minX, box.x);
		minY = Math.min(minY, box.y);
		maxX = Math.max(maxX, box.x + box.width);
		maxY = Math.max(maxY, box.y + box.height);
	}

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY,
	};
}

/** Check if a bounding box is valid */
export function isValidBoundingBox(box: BoundingBox | null): boolean {
	return box !== null && box.width > 0 && box.height > 0;
}

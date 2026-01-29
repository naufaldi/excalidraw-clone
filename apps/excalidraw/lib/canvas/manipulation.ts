/**
 * Element manipulation utilities for move and resize operations
 */

import type { Element, Point } from "../database/shared/types.js";
import type { Viewport } from "./types.js";
import type { BoundingBox } from "./selection.js";
import { getElementBoundingBox, isPointInBox } from "./selection.js";

export type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w";

/**
 * Move an element by dx, dy pixels
 */
export function moveElement(element: Element, dx: number, dy: number): Element {
	return {
		...element,
		x: element.x + dx,
		y: element.y + dy,
	};
}

/**
 * Move multiple elements by the same delta
 */
export function moveElements(
	elements: Element[],
	dx: number,
	dy: number,
): Element[] {
	return elements.map((el) => moveElement(el, dx, dy));
}

/**
 * Move elements maintaining relative positions
 */
export function moveElementsWithOffset(
	elements: Element[],
	dx: number,
	dy: number,
	_startPositions: Map<string, { x: number; y: number }>,
): Element[] {
	return elements.map((el) => moveElement(el, dx, dy));
}

/**
 * Get resize handles for a bounding box
 */
export function getResizeHandles(
	box: BoundingBox,
	handleSize: number = 8,
): Map<ResizeHandle, { x: number; y: number }> {
	const halfHandle = handleSize / 2;
	const handles = new Map<ResizeHandle, { x: number; y: number }>();

	handles.set("nw", { x: box.x - halfHandle, y: box.y - halfHandle });
	handles.set("ne", {
		x: box.x + box.width - halfHandle,
		y: box.y - halfHandle,
	});
	handles.set("sw", {
		x: box.x - halfHandle,
		y: box.y + box.height - halfHandle,
	});
	handles.set("se", {
		x: box.x + box.width - halfHandle,
		y: box.y + box.height - halfHandle,
	});

	handles.set("n", {
		x: box.x + box.width / 2 - halfHandle,
		y: box.y - halfHandle,
	});
	handles.set("s", {
		x: box.x + box.width / 2 - halfHandle,
		y: box.y + box.height - halfHandle,
	});
	handles.set("e", {
		x: box.x + box.width - halfHandle,
		y: box.y + box.height / 2 - halfHandle,
	});
	handles.set("w", {
		x: box.x - halfHandle,
		y: box.y + box.height / 2 - halfHandle,
	});

	return handles;
}

/**
 * Resize element from a specific handle
 */
export function resizeElementFromHandle(
	element: Element,
	handle: ResizeHandle,
	startPoint: Point,
	currentPoint: Point,
	maintainAspectRatio: boolean = false,
): Element {
	const dx = currentPoint.x - startPoint.x;
	const dy = currentPoint.y - startPoint.y;

	let newX = element.x;
	let newY = element.y;
	let newWidth = element.width || 0;
	let newHeight = element.height || 0;

	switch (handle) {
		case "nw":
			newX = element.x + dx;
			newY = element.y + dy;
			newWidth = (element.width || 0) - dx;
			newHeight = (element.height || 0) - dy;
			break;
		case "ne":
			newY = element.y + dy;
			newWidth = (element.width || 0) + dx;
			newHeight = (element.height || 0) - dy;
			break;
		case "sw":
			newX = element.x + dx;
			newWidth = (element.width || 0) - dx;
			newHeight = (element.height || 0) + dy;
			break;
		case "se":
			newWidth = (element.width || 0) + dx;
			newHeight = (element.height || 0) + dy;
			break;
		case "n":
			newY = element.y + dy;
			newHeight = (element.height || 0) - dy;
			break;
		case "s":
			newHeight = (element.height || 0) + dy;
			break;
		case "e":
			newWidth = (element.width || 0) + dx;
			break;
		case "w":
			newX = element.x + dx;
			newWidth = (element.width || 0) - dx;
			break;
	}

	if (maintainAspectRatio && element.width && element.height) {
		const aspectRatio = element.width / element.height;
		if (Math.abs(dx) > Math.abs(dy * aspectRatio)) {
			newHeight = newWidth / aspectRatio;
			if (["n", "s"].includes(handle)) {
				newY = element.y + (element.height - newHeight) / 2;
			}
		} else {
			newWidth = newHeight * aspectRatio;
			if (["e", "w"].includes(handle)) {
				newX = element.x + (element.width - newWidth) / 2;
			}
		}
	}

	const minSize = 5;
	if (newWidth < minSize) {
		if (["nw", "w", "sw"].includes(handle)) {
			newX = newX + newWidth - minSize;
		}
		newWidth = minSize;
	}
	if (newHeight < minSize) {
		if (["nw", "n", "ne"].includes(handle)) {
			newY = newY + newHeight - minSize;
		}
		newHeight = minSize;
	}

	return {
		...element,
		x: newX,
		y: newY,
		width: newWidth,
		height: newHeight,
	};
}

/**
 * Check if point is over a selected element (for move cursor)
 */
export function isPointOverElement(
	point: Point,
	element: Element,
	padding: number = 5,
): boolean {
	const box = getElementBoundingBox(element);
	const paddedBox: BoundingBox = {
		x: box.x - padding,
		y: box.y - padding,
		width: box.width + padding * 2,
		height: box.height + padding * 2,
	};

	return isPointInBox(point, paddedBox);
}

/**
 * Hit test resize handles
 */
export function hitTestResizeHandle(
	point: Point,
	box: BoundingBox,
	handleSize: number,
	viewport: Viewport,
): ResizeHandle | null {
	const handles = getResizeHandles(box, handleSize / viewport.zoom);
	const scaledHandleSize = handleSize / viewport.zoom;

	for (const [handle, pos] of handles) {
		if (
			point.x >= pos.x &&
			point.x <= pos.x + scaledHandleSize &&
			point.y >= pos.y &&
			point.y <= pos.y + scaledHandleSize
		) {
			return handle;
		}
	}

	return null;
}

/**
 * Resize line/arrow elements (special case - they use x,y as start, width,height as delta)
 */
export function resizeLineFromHandle(
	element: Element,
	handle: ResizeHandle,
	startPoint: Point,
	currentPoint: Point,
): Element {
	if (element.type !== "line" && element.type !== "arrow") {
		return resizeElementFromHandle(element, handle, startPoint, currentPoint);
	}

	const dx = currentPoint.x - startPoint.x;
	const dy = currentPoint.y - startPoint.y;

	switch (handle) {
		case "nw":
			return {
				...element,
				x: element.x + dx,
				y: element.y + dy,
				width: (element.width || 0) - dx,
				height: (element.height || 0) - dy,
			};
		case "ne":
			return {
				...element,
				y: element.y + dy,
				width: (element.width || 0) + dx,
				height: (element.height || 0) - dy,
			};
		case "sw":
			return {
				...element,
				x: element.x + dx,
				width: (element.width || 0) - dx,
				height: (element.height || 0) + dy,
			};
		case "se":
			return {
				...element,
				width: (element.width || 0) + dx,
				height: (element.height || 0) + dy,
			};
		case "n":
			return {
				...element,
				y: element.y + dy,
				height: (element.height || 0) - dy,
			};
		case "s":
			return {
				...element,
				height: (element.height || 0) + dy,
			};
		case "e":
			return {
				...element,
				width: (element.width || 0) + dx,
			};
		case "w":
			return {
				...element,
				x: element.x + dx,
				width: (element.width || 0) - dx,
			};
	}

	return element;
}

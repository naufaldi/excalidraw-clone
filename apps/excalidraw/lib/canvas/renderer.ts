/**
 * Canvas rendering functions
 */

import type { Element } from "../database/shared/types.js";
import type { Viewport } from "./types.js";

/**
 * Draw a rectangle element
 */
export function drawRectangle(
	ctx: CanvasRenderingContext2D,
	element: Element,
): void {
	const { x, y, width = 0, height = 0 } = element;

	ctx.beginPath();
	ctx.rect(x, y, width, height);

	if (element.fillColor && element.fillColor !== "transparent") {
		ctx.fillStyle = element.fillColor;
		ctx.globalAlpha = element.opacity;
		ctx.fill();
	}

	ctx.strokeStyle = element.strokeColor;
	ctx.lineWidth = element.strokeWidth;
	ctx.globalAlpha = element.opacity;
	ctx.stroke();
}

/**
 * Draw a circle/ellipse element
 */
export function drawCircle(
	ctx: CanvasRenderingContext2D,
	element: Element,
): void {
	const { x, y, width = 0, height = 0 } = element;
	const centerX = x + width / 2;
	const centerY = y + height / 2;
	const radiusX = width / 2;
	const radiusY = height / 2;

	ctx.beginPath();
	ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

	if (element.fillColor && element.fillColor !== "transparent") {
		ctx.fillStyle = element.fillColor;
		ctx.globalAlpha = element.opacity;
		ctx.fill();
	}

	ctx.strokeStyle = element.strokeColor;
	ctx.lineWidth = element.strokeWidth;
	ctx.globalAlpha = element.opacity;
	ctx.stroke();
}

/**
 * Draw a line element
 */
export function drawLine(
	ctx: CanvasRenderingContext2D,
	element: Element,
): void {
	const { x, y, width = 0, height = 0 } = element;

	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + width, y + height);

	ctx.strokeStyle = element.strokeColor;
	ctx.lineWidth = element.strokeWidth;
	ctx.globalAlpha = element.opacity;
	ctx.stroke();
}

/**
 * Draw an arrow element
 */
export function drawArrow(
	ctx: CanvasRenderingContext2D,
	element: Element,
): void {
	const { x, y, width = 0, height = 0 } = element;
	const endX = x + width;
	const endY = y + height;

	// Draw line
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(endX, endY);
	ctx.strokeStyle = element.strokeColor;
	ctx.lineWidth = element.strokeWidth;
	ctx.globalAlpha = element.opacity;
	ctx.stroke();

	// Draw arrowhead
	const angle = Math.atan2(height, width);
	const headLength = 15;

	ctx.beginPath();
	ctx.moveTo(endX, endY);
	ctx.lineTo(
		endX - headLength * Math.cos(angle - Math.PI / 6),
		endY - headLength * Math.sin(angle - Math.PI / 6),
	);
	ctx.moveTo(endX, endY);
	ctx.lineTo(
		endX - headLength * Math.cos(angle + Math.PI / 6),
		endY - headLength * Math.sin(angle + Math.PI / 6),
	);
	ctx.stroke();
}

/**
 * Draw a pen/freehand element
 */
export function drawPen(ctx: CanvasRenderingContext2D, element: Element): void {
	const { points } = element;
	if (!points || points.length < 2) return;

	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);

	for (let i = 1; i < points.length; i++) {
		ctx.lineTo(points[i].x, points[i].y);
	}

	ctx.strokeStyle = element.strokeColor;
	ctx.lineWidth = element.strokeWidth;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.globalAlpha = element.opacity;
	ctx.stroke();
}

/**
 * Draw a text element
 */
export function drawText(
	ctx: CanvasRenderingContext2D,
	element: Element,
): void {
	const { x, y, text, fontSize = 16 } = element;
	if (!text) return;

	ctx.font = `${fontSize}px sans-serif`;
	ctx.fillStyle = element.strokeColor;
	ctx.globalAlpha = element.opacity;
	ctx.fillText(text, x, y + fontSize);
}

/**
 * Render a single element based on its type
 */
export function renderElement(
	ctx: CanvasRenderingContext2D,
	element: Element,
): void {
	ctx.save();

	switch (element.type) {
		case "rectangle":
			drawRectangle(ctx, element);
			break;
		case "circle":
			drawCircle(ctx, element);
			break;
		case "line":
			drawLine(ctx, element);
			break;
		case "arrow":
			drawArrow(ctx, element);
			break;
		case "pen":
			drawPen(ctx, element);
			break;
		case "text":
			drawText(ctx, element);
			break;
	}

	ctx.restore();
}

/**
 * Render all elements with viewport transform
 */
export function renderElements(
	ctx: CanvasRenderingContext2D,
	elements: Element[],
	viewport: Viewport,
): void {
	ctx.save();

	// Apply viewport transform
	ctx.translate(viewport.offsetX, viewport.offsetY);
	ctx.scale(viewport.zoom, viewport.zoom);

	// Sort by zIndex and render
	const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
	for (const element of sorted) {
		renderElement(ctx, element);
	}

	ctx.restore();
}

/**
 * Clear the canvas
 */
export function clearCanvas(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
): void {
	ctx.clearRect(0, 0, width, height);
}

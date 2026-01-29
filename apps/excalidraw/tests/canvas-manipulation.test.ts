/**
 * @file Canvas Element Manipulation Tests
 * Tests for independent element movement and resize (RFC-001: US-3, US-5)
 */

import { describe, expect, it } from "vitest";
import {
	moveElement,
	moveElements,
	resizeElementFromHandle,
	getResizeHandles,
} from "../lib/canvas/manipulation.js";
import type { Element } from "../lib/database/shared/types.js";

/**
 * Helper to create a test element
 */
function createTestElement(
	id: string,
	overrides: Partial<Element> = {},
): Element {
	return {
		id,
		type: "rectangle",
		x: 100,
		y: 100,
		width: 100,
		height: 100,
		strokeColor: "#000000",
		fillColor: "#ffffff",
		strokeWidth: 2,
		opacity: 1,
		zIndex: 0,
		...overrides,
	};
}

describe("RFC-001 US-3: Independent Element Movement", () => {
	describe("moveElement", () => {
		it("should move element by delta values", () => {
			const element = createTestElement("rect-1", { x: 100, y: 100 });

			const moved = moveElement(element, 50, 75);

			expect(moved.x).toBe(150);
			expect(moved.y).toBe(175);
		});

		it("should handle negative deltas", () => {
			const element = createTestElement("rect-1", { x: 100, y: 100 });

			const moved = moveElement(element, -30, -50);

			expect(moved.x).toBe(70);
			expect(moved.y).toBe(50);
		});

		it("should preserve all other properties", () => {
			const element = createTestElement("rect-1", {
				x: 100,
				y: 100,
				width: 200,
				height: 150,
				strokeColor: "#ff0000",
				fillColor: "#00ff00",
				strokeWidth: 5,
				opacity: 0.5,
				zIndex: 10,
			});

			const moved = moveElement(element, 50, 50);

			expect(moved.id).toBe("rect-1");
			expect(moved.width).toBe(200);
			expect(moved.height).toBe(150);
			expect(moved.strokeColor).toBe("#ff0000");
			expect(moved.fillColor).toBe("#00ff00");
			expect(moved.strokeWidth).toBe(5);
			expect(moved.opacity).toBe(0.5);
			expect(moved.zIndex).toBe(10);
		});

		it("should not mutate original element", () => {
			const element = createTestElement("rect-1", { x: 100, y: 100 });

			moveElement(element, 50, 50);

			expect(element.x).toBe(100);
			expect(element.y).toBe(100);
		});

		it("should handle zero delta", () => {
			const element = createTestElement("rect-1", { x: 100, y: 100 });

			const moved = moveElement(element, 0, 0);

			expect(moved.x).toBe(100);
			expect(moved.y).toBe(100);
		});
	});

	describe("moveElements", () => {
		it("should move multiple elements by same delta", () => {
			const elements = [
				createTestElement("rect-1", { x: 0, y: 0 }),
				createTestElement("rect-2", { x: 100, y: 100 }),
				createTestElement("rect-3", { x: 200, y: 200 }),
			];

			const moved = moveElements(elements, 50, 50);

			expect(moved[0].x).toBe(50);
			expect(moved[0].y).toBe(50);
			expect(moved[1].x).toBe(150);
			expect(moved[1].y).toBe(150);
			expect(moved[2].x).toBe(250);
			expect(moved[2].y).toBe(250);
		});

		it("should maintain relative positions between elements", () => {
			const elements = [
				createTestElement("rect-1", { x: 0, y: 0 }),
				createTestElement("rect-2", { x: 100, y: 50 }),
			];

			const moved = moveElements(elements, 200, 300);

			const relativeXBefore = elements[1].x - elements[0].x;
			const relativeYBefore = elements[1].y - elements[0].y;
			const relativeXAfter = moved[1].x - moved[0].x;
			const relativeYAfter = moved[1].y - moved[0].y;

			expect(relativeXAfter).toBe(relativeXBefore);
			expect(relativeYAfter).toBe(relativeYBefore);
		});

		it("should handle empty array", () => {
			const moved = moveElements([], 50, 50);
			expect(moved).toHaveLength(0);
		});

		it("should not mutate original elements", () => {
			const elements = [
				createTestElement("rect-1", { x: 100, y: 100 }),
				createTestElement("rect-2", { x: 200, y: 200 }),
			];

			moveElements(elements, 50, 50);

			expect(elements[0].x).toBe(100);
			expect(elements[0].y).toBe(100);
			expect(elements[1].x).toBe(200);
			expect(elements[1].y).toBe(200);
		});
	});
});

describe("RFC-001 US-5: Independent Element Resize", () => {
	describe("getResizeHandles", () => {
		it("should return all 8 resize handles", () => {
			const box = { x: 50, y: 50, width: 100, height: 100 };

			const handles = getResizeHandles(box, 8);

			expect(handles.size).toBe(8);
			expect(handles.has("nw")).toBe(true);
			expect(handles.has("ne")).toBe(true);
			expect(handles.has("sw")).toBe(true);
			expect(handles.has("se")).toBe(true);
			expect(handles.has("n")).toBe(true);
			expect(handles.has("s")).toBe(true);
			expect(handles.has("e")).toBe(true);
			expect(handles.has("w")).toBe(true);
		});

		it("should position corner handles at corners", () => {
			const box = { x: 0, y: 0, width: 100, height: 100 };

			const handles = getResizeHandles(box, 8);

			const nw = handles.get("nw");
			const se = handles.get("se");

			expect(nw?.x).toBe(-4);
			expect(nw?.y).toBe(-4);
			expect(se?.x).toBe(96);
			expect(se?.y).toBe(96);
		});
	});

	describe("resizeElementFromHandle", () => {
		it("should resize from SE handle (bottom-right)", () => {
			const element = createTestElement("rect-1", {
				x: 0,
				y: 0,
				width: 100,
				height: 100,
			});

			const resized = resizeElementFromHandle(
				element,
				"se",
				{ x: 100, y: 100 },
				{ x: 150, y: 150 },
			);

			expect(resized.x).toBe(0);
			expect(resized.y).toBe(0);
			expect(resized.width).toBe(150);
			expect(resized.height).toBe(150);
		});

		it("should resize from NW handle (top-left)", () => {
			const element = createTestElement("rect-1", {
				x: 50,
				y: 50,
				width: 100,
				height: 100,
			});

			const resized = resizeElementFromHandle(
				element,
				"nw",
				{ x: 50, y: 50 },
				{ x: 25, y: 25 },
			);

			expect(resized.x).toBe(25);
			expect(resized.y).toBe(25);
			expect(resized.width).toBe(125);
			expect(resized.height).toBe(125);
		});

		it("should resize from E handle (right edge)", () => {
			const element = createTestElement("rect-1", {
				x: 0,
				y: 0,
				width: 100,
				height: 100,
			});

			const resized = resizeElementFromHandle(
				element,
				"e",
				{ x: 100, y: 50 },
				{ x: 200, y: 50 },
			);

			expect(resized.x).toBe(0);
			expect(resized.y).toBe(0);
			expect(resized.width).toBe(200);
			expect(resized.height).toBe(100);
		});

		it("should resize from S handle (bottom edge)", () => {
			const element = createTestElement("rect-1", {
				x: 0,
				y: 0,
				width: 100,
				height: 100,
			});

			const resized = resizeElementFromHandle(
				element,
				"s",
				{ x: 50, y: 100 },
				{ x: 50, y: 200 },
			);

			expect(resized.x).toBe(0);
			expect(resized.y).toBe(0);
			expect(resized.width).toBe(100);
			expect(resized.height).toBe(200);
		});

		it("should enforce minimum size", () => {
			const element = createTestElement("rect-1", {
				x: 0,
				y: 0,
				width: 100,
				height: 100,
			});

			const resized = resizeElementFromHandle(
				element,
				"se",
				{ x: 100, y: 100 },
				{ x: 1, y: 1 },
			);

			expect(resized.width).toBeGreaterThanOrEqual(5);
			expect(resized.height).toBeGreaterThanOrEqual(5);
		});

		it("should preserve other properties when resizing", () => {
			const element = createTestElement("rect-1", {
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				strokeColor: "#ff0000",
				fillColor: "#00ff00",
				strokeWidth: 5,
				opacity: 0.5,
				zIndex: 10,
			});

			const resized = resizeElementFromHandle(
				element,
				"se",
				{ x: 100, y: 100 },
				{ x: 200, y: 200 },
			);

			expect(resized.id).toBe("rect-1");
			expect(resized.strokeColor).toBe("#ff0000");
			expect(resized.fillColor).toBe("#00ff00");
			expect(resized.strokeWidth).toBe(5);
			expect(resized.opacity).toBe(0.5);
			expect(resized.zIndex).toBe(10);
		});

		it("should not mutate original element", () => {
			const element = createTestElement("rect-1", {
				x: 0,
				y: 0,
				width: 100,
				height: 100,
			});

			resizeElementFromHandle(
				element,
				"se",
				{ x: 100, y: 100 },
				{ x: 200, y: 200 },
			);

			expect(element.width).toBe(100);
			expect(element.height).toBe(100);
		});
	});
});

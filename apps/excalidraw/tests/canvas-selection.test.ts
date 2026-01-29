/**
 * @file Canvas Selection and Hit Testing Tests
 * Tests for independent element selection and hit testing (RFC-001: US-1)
 */

import { describe, expect, it } from "vitest";
import {
	createEmptySelection,
	findElementsAtPoint,
	findElementsInBox,
	hitTestElement,
	hitTestRectangle,
	hitTestCircle,
	getElementBoundingBox,
	getCombinedBoundingBox,
} from "../lib/canvas/selection.js";
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

describe("RFC-001 US-1: Independent Element Selection", () => {
	describe("createEmptySelection", () => {
		it("should create empty selection state", () => {
			const selection = createEmptySelection();

			expect(selection.selectedIds.size).toBe(0);
			expect(selection.selectionBox).toBeNull();
			expect(selection.isSelecting).toBe(false);
			expect(selection.selectionStartPoint).toBeNull();
		});
	});

	describe("hitTestRectangle", () => {
		it("should detect point inside rectangle", () => {
			const rect = createTestElement("rect-1", {
				x: 50,
				y: 50,
				width: 100,
				height: 100,
			});

			expect(hitTestRectangle(rect, { x: 100, y: 100 })).toBe(true);
			expect(hitTestRectangle(rect, { x: 50, y: 50 })).toBe(true);
			expect(hitTestRectangle(rect, { x: 149, y: 149 })).toBe(true);
		});

		it("should not detect point outside rectangle", () => {
			const rect = createTestElement("rect-1", {
				x: 50,
				y: 50,
				width: 100,
				height: 100,
			});

			expect(hitTestRectangle(rect, { x: 0, y: 0 })).toBe(false);
			expect(hitTestRectangle(rect, { x: 200, y: 200 })).toBe(false);
		});

		it("should account for stroke padding", () => {
			const rect = createTestElement("rect-1", {
				x: 50,
				y: 50,
				width: 100,
				height: 100,
			});

			expect(hitTestRectangle(rect, { x: 47, y: 100 }, 5)).toBe(true);
			expect(hitTestRectangle(rect, { x: 40, y: 100 }, 5)).toBe(false);
		});
	});

	describe("hitTestCircle", () => {
		it("should detect point inside circle", () => {
			const circle = createTestElement("circle-1", {
				type: "circle",
				x: 50,
				y: 50,
				width: 100,
				height: 100,
			});

			expect(hitTestCircle(circle, { x: 100, y: 100 })).toBe(true);
			expect(hitTestCircle(circle, { x: 75, y: 100 })).toBe(true);
		});

		it("should not detect point outside circle", () => {
			const circle = createTestElement("circle-1", {
				type: "circle",
				x: 50,
				y: 50,
				width: 100,
				height: 100,
			});

			expect(hitTestCircle(circle, { x: 50, y: 50 })).toBe(false);
			expect(hitTestCircle(circle, { x: 150, y: 150 })).toBe(false);
		});
	});

	describe("hitTestElement", () => {
		it("should dispatch to correct hit test based on element type", () => {
			const rect = createTestElement("rect-1", {
				type: "rectangle",
				x: 0,
				y: 0,
				width: 100,
				height: 100,
			});
			const circle = createTestElement("circle-1", {
				type: "circle",
				x: 0,
				y: 0,
				width: 100,
				height: 100,
			});

			expect(hitTestElement(rect, { x: 50, y: 50 })).toBe(true);
			expect(hitTestElement(circle, { x: 50, y: 50 })).toBe(true);
		});

		it("should return false for unknown element types", () => {
			const unknown = createTestElement("unknown-1", {
				type: "unknown" as any,
			});

			expect(hitTestElement(unknown, { x: 100, y: 100 })).toBe(false);
		});
	});

	describe("findElementsAtPoint", () => {
		it("should find single element at point", () => {
			const elements = [
				createTestElement("rect-1", { x: 0, y: 0, zIndex: 0 }),
				createTestElement("rect-2", { x: 200, y: 200, zIndex: 1 }),
			];

			const hits = findElementsAtPoint(elements, { x: 50, y: 50 });

			expect(hits).toHaveLength(1);
			expect(hits[0].id).toBe("rect-1");
		});

		it("should find multiple overlapping elements, sorted by zIndex descending", () => {
			const elements = [
				createTestElement("rect-1", { x: 0, y: 0, width: 200, height: 200, zIndex: 0 }),
				createTestElement("rect-2", { x: 50, y: 50, width: 100, height: 100, zIndex: 1 }),
				createTestElement("rect-3", { x: 75, y: 75, width: 50, height: 50, zIndex: 2 }),
			];

			const hits = findElementsAtPoint(elements, { x: 80, y: 80 });

			expect(hits).toHaveLength(3);
			expect(hits[0].id).toBe("rect-3");
			expect(hits[1].id).toBe("rect-2");
			expect(hits[2].id).toBe("rect-1");
		});

		it("should return empty array when no elements hit", () => {
			const elements = [
				createTestElement("rect-1", { x: 100, y: 100 }),
			];

			const hits = findElementsAtPoint(elements, { x: 0, y: 0 });

			expect(hits).toHaveLength(0);
		});

		it("should only return the clicked element, not others", () => {
			const elements = [
				createTestElement("rect-1", { x: 0, y: 0, width: 100, height: 100 }),
				createTestElement("rect-2", { x: 200, y: 0, width: 100, height: 100 }),
				createTestElement("rect-3", { x: 0, y: 200, width: 100, height: 100 }),
			];

			const hits = findElementsAtPoint(elements, { x: 250, y: 50 });

			expect(hits).toHaveLength(1);
			expect(hits[0].id).toBe("rect-2");
		});
	});

	describe("findElementsInBox", () => {
		it("should find elements fully inside selection box", () => {
			const elements = [
				createTestElement("rect-1", { x: 50, y: 50, width: 50, height: 50 }),
				createTestElement("rect-2", { x: 200, y: 200, width: 50, height: 50 }),
			];

			const found = findElementsInBox(elements, {
				x: 0,
				y: 0,
				width: 150,
				height: 150,
			});

			expect(found).toHaveLength(1);
			expect(found[0].id).toBe("rect-1");
		});

		it("should find multiple elements in box", () => {
			const elements = [
				createTestElement("rect-1", { x: 10, y: 10, width: 30, height: 30 }),
				createTestElement("rect-2", { x: 50, y: 50, width: 30, height: 30 }),
				createTestElement("rect-3", { x: 200, y: 200, width: 30, height: 30 }),
			];

			const found = findElementsInBox(elements, {
				x: 0,
				y: 0,
				width: 100,
				height: 100,
			});

			expect(found).toHaveLength(2);
			expect(found.map((e) => e.id)).toContain("rect-1");
			expect(found.map((e) => e.id)).toContain("rect-2");
		});

		it("should not include partially overlapping elements", () => {
			const elements = [
				createTestElement("rect-1", { x: 75, y: 75, width: 100, height: 100 }),
			];

			const found = findElementsInBox(elements, {
				x: 0,
				y: 0,
				width: 100,
				height: 100,
			});

			expect(found).toHaveLength(0);
		});

		it("should return empty array for empty box", () => {
			const elements = [
				createTestElement("rect-1", { x: 50, y: 50 }),
			];

			const found = findElementsInBox(elements, {
				x: 0,
				y: 0,
				width: 10,
				height: 10,
			});

			expect(found).toHaveLength(0);
		});
	});

	describe("getElementBoundingBox", () => {
		it("should return correct bounding box for element", () => {
			const element = createTestElement("rect-1", {
				x: 50,
				y: 75,
				width: 200,
				height: 150,
			});

			const box = getElementBoundingBox(element);

			expect(box.x).toBe(50);
			expect(box.y).toBe(75);
			expect(box.width).toBe(200);
			expect(box.height).toBe(150);
		});

		it("should handle elements without width/height", () => {
			const element = createTestElement("line-1", {
				type: "line",
				x: 50,
				y: 75,
				width: undefined,
				height: undefined,
			});

			const box = getElementBoundingBox(element);

			expect(box.x).toBe(50);
			expect(box.y).toBe(75);
			expect(box.width).toBe(0);
			expect(box.height).toBe(0);
		});
	});

	describe("getCombinedBoundingBox", () => {
		it("should return null for empty array", () => {
			const box = getCombinedBoundingBox([]);
			expect(box).toBeNull();
		});

		it("should return single element bounding box", () => {
			const elements = [
				createTestElement("rect-1", { x: 50, y: 50, width: 100, height: 100 }),
			];

			const box = getCombinedBoundingBox(elements);

			expect(box?.x).toBe(50);
			expect(box?.y).toBe(50);
			expect(box?.width).toBe(100);
			expect(box?.height).toBe(100);
		});

		it("should combine multiple element bounding boxes", () => {
			const elements = [
				createTestElement("rect-1", { x: 0, y: 0, width: 50, height: 50 }),
				createTestElement("rect-2", { x: 100, y: 100, width: 50, height: 50 }),
			];

			const box = getCombinedBoundingBox(elements);

			expect(box?.x).toBe(0);
			expect(box?.y).toBe(0);
			expect(box?.width).toBe(150);
			expect(box?.height).toBe(150);
		});
	});
});

/**
 * @file Independent Element Management Tests
 * Tests for RFC-001: Independent element selection, deletion, and movement
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	closeDatabase,
	initializeDatabase,
	createBoard,
	addElementToBoard,
	deleteElementFromBoard,
	deleteMultipleElementsFromBoard,
	updateElementInBoard,
	updateMultipleElementsInBoard,
} from "../lib/database/index.js";
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
		width: 200,
		height: 150,
		strokeColor: "#000000",
		fillColor: "#ffffff",
		strokeWidth: 2,
		opacity: 1,
		zIndex: 0,
		...overrides,
	};
}

describe("RFC-001: Independent Element Management", () => {
	let TEST_BOARD_ID: string;

	beforeEach(async () => {
		TEST_BOARD_ID = `test-board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		await closeDatabase().catch(() => {});
		await initializeDatabase();
		await createBoard({ id: TEST_BOARD_ID, name: "Test Board" });
	});

	afterEach(async () => {
		await closeDatabase().catch(() => {});
	});

	describe("US-2: Independent Element Deletion", () => {
		it("should delete only the specified element by ID", async () => {
			const element1 = createTestElement("element-1", { x: 0, y: 0 });
			const element2 = createTestElement("element-2", { x: 100, y: 100 });
			const element3 = createTestElement("element-3", { x: 200, y: 200 });

			await addElementToBoard(TEST_BOARD_ID, element1);
			await addElementToBoard(TEST_BOARD_ID, element2);
			await addElementToBoard(TEST_BOARD_ID, element3);

			const updatedBoard = await deleteElementFromBoard(
				TEST_BOARD_ID,
				"element-2",
			);

			expect(updatedBoard.elements).toHaveLength(2);
			expect(updatedBoard.elements.map((e) => e.id)).toEqual([
				"element-1",
				"element-3",
			]);
			expect(updatedBoard.elements.find((e) => e.id === "element-2")).toBeUndefined();
		});

		it("should delete multiple selected elements without affecting others", async () => {
			const element1 = createTestElement("element-1");
			const element2 = createTestElement("element-2");
			const element3 = createTestElement("element-3");
			const element4 = createTestElement("element-4");

			await addElementToBoard(TEST_BOARD_ID, element1);
			await addElementToBoard(TEST_BOARD_ID, element2);
			await addElementToBoard(TEST_BOARD_ID, element3);
			await addElementToBoard(TEST_BOARD_ID, element4);

			const updatedBoard = await deleteMultipleElementsFromBoard(
				TEST_BOARD_ID,
				["element-2", "element-4"],
			);

			expect(updatedBoard.elements).toHaveLength(2);
			expect(updatedBoard.elements.map((e) => e.id)).toEqual([
				"element-1",
				"element-3",
			]);
		});

		it("should handle deleting non-existent element gracefully", async () => {
			const element1 = createTestElement("element-1");
			await addElementToBoard(TEST_BOARD_ID, element1);

			const updatedBoard = await deleteElementFromBoard(
				TEST_BOARD_ID,
				"non-existent-element",
			);

			expect(updatedBoard.elements).toHaveLength(1);
			expect(updatedBoard.elements[0].id).toBe("element-1");
		});

		it("should preserve element properties after deleting another element", async () => {
			const element1 = createTestElement("element-1", {
				x: 50,
				y: 75,
				width: 300,
				height: 400,
				strokeColor: "#ff0000",
			});
			const element2 = createTestElement("element-2");

			await addElementToBoard(TEST_BOARD_ID, element1);
			await addElementToBoard(TEST_BOARD_ID, element2);

			const updatedBoard = await deleteElementFromBoard(
				TEST_BOARD_ID,
				"element-2",
			);

			const remainingElement = updatedBoard.elements[0];
			expect(remainingElement.id).toBe("element-1");
			expect(remainingElement.x).toBe(50);
			expect(remainingElement.y).toBe(75);
			expect(remainingElement.width).toBe(300);
			expect(remainingElement.height).toBe(400);
			expect(remainingElement.strokeColor).toBe("#ff0000");
		});
	});

	describe("US-3: Independent Element Movement", () => {
		it("should update only the specified element position", async () => {
			const element1 = createTestElement("element-1", { x: 0, y: 0 });
			const element2 = createTestElement("element-2", { x: 100, y: 100 });

			await addElementToBoard(TEST_BOARD_ID, element1);
			await addElementToBoard(TEST_BOARD_ID, element2);

			const updatedBoard = await updateElementInBoard(
				TEST_BOARD_ID,
				"element-1",
				{ x: 500, y: 600 },
			);

			const movedElement = updatedBoard.elements.find(
				(e) => e.id === "element-1",
			);
			const unmovededElement = updatedBoard.elements.find(
				(e) => e.id === "element-2",
			);

			expect(movedElement?.x).toBe(500);
			expect(movedElement?.y).toBe(600);
			expect(unmovededElement?.x).toBe(100);
			expect(unmovededElement?.y).toBe(100);
		});

		it("should move multiple selected elements together", async () => {
			const element1 = createTestElement("element-1", { x: 0, y: 0 });
			const element2 = createTestElement("element-2", { x: 100, y: 100 });
			const element3 = createTestElement("element-3", { x: 200, y: 200 });

			await addElementToBoard(TEST_BOARD_ID, element1);
			await addElementToBoard(TEST_BOARD_ID, element2);
			await addElementToBoard(TEST_BOARD_ID, element3);

			const updatedBoard = await updateMultipleElementsInBoard(TEST_BOARD_ID, [
				{ id: "element-1", updates: { x: 50, y: 50 } },
				{ id: "element-2", updates: { x: 150, y: 150 } },
			]);

			const el1 = updatedBoard.elements.find((e) => e.id === "element-1");
			const el2 = updatedBoard.elements.find((e) => e.id === "element-2");
			const el3 = updatedBoard.elements.find((e) => e.id === "element-3");

			expect(el1?.x).toBe(50);
			expect(el1?.y).toBe(50);
			expect(el2?.x).toBe(150);
			expect(el2?.y).toBe(150);
			expect(el3?.x).toBe(200);
			expect(el3?.y).toBe(200);
		});

		it("should preserve other properties when moving an element", async () => {
			const element1 = createTestElement("element-1", {
				x: 0,
				y: 0,
				width: 300,
				height: 400,
				strokeColor: "#ff0000",
				fillColor: "#00ff00",
				strokeWidth: 5,
				opacity: 0.5,
				zIndex: 10,
			});

			await addElementToBoard(TEST_BOARD_ID, element1);

			const updatedBoard = await updateElementInBoard(
				TEST_BOARD_ID,
				"element-1",
				{ x: 999, y: 888 },
			);

			const movedElement = updatedBoard.elements[0];
			expect(movedElement.x).toBe(999);
			expect(movedElement.y).toBe(888);
			expect(movedElement.width).toBe(300);
			expect(movedElement.height).toBe(400);
			expect(movedElement.strokeColor).toBe("#ff0000");
			expect(movedElement.fillColor).toBe("#00ff00");
			expect(movedElement.strokeWidth).toBe(5);
			expect(movedElement.opacity).toBe(0.5);
			expect(movedElement.zIndex).toBe(10);
		});
	});

	describe("US-4: Independent Element Editing", () => {
		it("should update properties of only the specified element", async () => {
			const element1 = createTestElement("element-1", { strokeColor: "#000000" });
			const element2 = createTestElement("element-2", { strokeColor: "#000000" });

			await addElementToBoard(TEST_BOARD_ID, element1);
			await addElementToBoard(TEST_BOARD_ID, element2);

			const updatedBoard = await updateElementInBoard(
				TEST_BOARD_ID,
				"element-1",
				{ strokeColor: "#ff0000", fillColor: "#00ff00" },
			);

			const el1 = updatedBoard.elements.find((e) => e.id === "element-1");
			const el2 = updatedBoard.elements.find((e) => e.id === "element-2");

			expect(el1?.strokeColor).toBe("#ff0000");
			expect(el1?.fillColor).toBe("#00ff00");
			expect(el2?.strokeColor).toBe("#000000");
		});

		it("should apply bulk property changes to multiple selected elements", async () => {
			const element1 = createTestElement("element-1", { strokeWidth: 1 });
			const element2 = createTestElement("element-2", { strokeWidth: 1 });
			const element3 = createTestElement("element-3", { strokeWidth: 1 });

			await addElementToBoard(TEST_BOARD_ID, element1);
			await addElementToBoard(TEST_BOARD_ID, element2);
			await addElementToBoard(TEST_BOARD_ID, element3);

			const updatedBoard = await updateMultipleElementsInBoard(TEST_BOARD_ID, [
				{ id: "element-1", updates: { strokeWidth: 5 } },
				{ id: "element-2", updates: { strokeWidth: 5 } },
			]);

			const el1 = updatedBoard.elements.find((e) => e.id === "element-1");
			const el2 = updatedBoard.elements.find((e) => e.id === "element-2");
			const el3 = updatedBoard.elements.find((e) => e.id === "element-3");

			expect(el1?.strokeWidth).toBe(5);
			expect(el2?.strokeWidth).toBe(5);
			expect(el3?.strokeWidth).toBe(1);
		});
	});

	describe("US-7: Z-Index (Layer) Management", () => {
		it("should update zIndex of only the specified element", async () => {
			const element1 = createTestElement("element-1", { zIndex: 0 });
			const element2 = createTestElement("element-2", { zIndex: 1 });
			const element3 = createTestElement("element-3", { zIndex: 2 });

			await addElementToBoard(TEST_BOARD_ID, element1);
			await addElementToBoard(TEST_BOARD_ID, element2);
			await addElementToBoard(TEST_BOARD_ID, element3);

			const updatedBoard = await updateElementInBoard(
				TEST_BOARD_ID,
				"element-1",
				{ zIndex: 100 },
			);

			const el1 = updatedBoard.elements.find((e) => e.id === "element-1");
			const el2 = updatedBoard.elements.find((e) => e.id === "element-2");
			const el3 = updatedBoard.elements.find((e) => e.id === "element-3");

			expect(el1?.zIndex).toBe(100);
			expect(el2?.zIndex).toBe(1);
			expect(el3?.zIndex).toBe(2);
		});
	});

	describe("Element isolation guarantees", () => {
		it("should maintain element count integrity after operations", async () => {
			for (let i = 0; i < 10; i++) {
				await addElementToBoard(
					TEST_BOARD_ID,
					createTestElement(`element-${i}`),
				);
			}

			await deleteElementFromBoard(TEST_BOARD_ID, "element-5");

			const { getBoardByIdQuery } = await import("../lib/database/index.js");
			const board = await getBoardByIdQuery(TEST_BOARD_ID);

			expect(board?.elements).toHaveLength(9);
			expect(board?.elements.find((e) => e.id === "element-5")).toBeUndefined();
		});

		it("should handle concurrent-like operations correctly", async () => {
			const element1 = createTestElement("element-1", { x: 0 });
			const element2 = createTestElement("element-2", { x: 100 });

			await addElementToBoard(TEST_BOARD_ID, element1);
			await addElementToBoard(TEST_BOARD_ID, element2);

			await Promise.all([
				updateElementInBoard(TEST_BOARD_ID, "element-1", { x: 50 }),
				updateElementInBoard(TEST_BOARD_ID, "element-2", { x: 200 }),
			]);

			const { getBoardByIdQuery } = await import("../lib/database/index.js");
			const board = await getBoardByIdQuery(TEST_BOARD_ID);

			expect(board?.elements).toHaveLength(2);
		});
	});
});

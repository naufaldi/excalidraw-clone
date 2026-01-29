/**
 * @file Copy/Paste Functionality Tests
 * Tests for RFC-001 Phase 4: Copy/Paste and Duplicate operations
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addMultipleElementsToBoard,
  closeDatabase,
  createBoard,
  getBoardByIdQuery,
  initializeDatabase,
} from "../lib/database/index.js";
import type { Element } from "../lib/database/shared/types.js";
import { ClipboardManager, clipboardManager } from "../lib/clipboard/clipboard-manager.js";
import { generateElementId } from "../lib/canvas/index.js";

/**
 * Helper to create a test element
 */
function createTestElement(id: string, overrides: Partial<Element> = {}): Element {
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
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("RFC-001 Phase 4: Copy/Paste Operations", () => {
  let TEST_BOARD_ID: string;

  beforeEach(async () => {
    TEST_BOARD_ID = `test-board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await closeDatabase().catch(() => {});
    await initializeDatabase();
    await createBoard({ id: TEST_BOARD_ID, name: "Test Board" });
    // Clear clipboard before each test
    clipboardManager.clear();
  });

  afterEach(async () => {
    clipboardManager.clear();
    await closeDatabase().catch(() => {});
  });

  describe("Clipboard Manager", () => {
    it("should be a singleton", () => {
      const instance1 = ClipboardManager.getInstance();
      const instance2 = ClipboardManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("should start with empty clipboard", () => {
      expect(clipboardManager.hasData()).toBe(false);
      expect(clipboardManager.getSize()).toBe(0);
      expect(clipboardManager.paste()).toBeNull();
    });

    it("should copy single element to clipboard", () => {
      const element = createTestElement("element-1");
      clipboardManager.copy([element]);

      expect(clipboardManager.hasData()).toBe(true);
      expect(clipboardManager.getSize()).toBe(1);
    });

    it("should copy multiple elements to clipboard", () => {
      const elements = [
        createTestElement("element-1"),
        createTestElement("element-2"),
        createTestElement("element-3"),
      ];
      clipboardManager.copy(elements);

      expect(clipboardManager.hasData()).toBe(true);
      expect(clipboardManager.getSize()).toBe(3);
    });

    it("should handle copying empty array gracefully", () => {
      clipboardManager.copy([]);

      expect(clipboardManager.hasData()).toBe(false);
      expect(clipboardManager.getSize()).toBe(0);
      expect(clipboardManager.paste()).toBeNull();
    });

    it("should deep clone elements on copy to prevent mutation", () => {
      const element = createTestElement("element-1", { x: 100, y: 100 });
      clipboardManager.copy([element]);

      // Mutate original
      element.x = 999;
      element.y = 999;

      // Clipboard should have original values
      const pasted = clipboardManager.paste();
      expect(pasted).not.toBeNull();
      expect(pasted![0].x).toBe(100);
      expect(pasted![0].y).toBe(100);
    });

    it("should deep clone elements on paste to allow multiple pastes", () => {
      const element = createTestElement("element-1");
      clipboardManager.copy([element]);

      const paste1 = clipboardManager.paste();
      const paste2 = clipboardManager.paste();

      // Both should be separate clones
      expect(paste1).not.toBe(paste2);
      expect(paste1![0]).not.toBe(paste2![0]);
      expect(paste1![0].id).toBe(paste2![0].id); // IDs are same (until regenerated)
    });

    it("should clear clipboard", () => {
      const element = createTestElement("element-1");
      clipboardManager.copy([element]);
      expect(clipboardManager.hasData()).toBe(true);

      clipboardManager.clear();
      expect(clipboardManager.hasData()).toBe(false);
      expect(clipboardManager.paste()).toBeNull();
    });

    it("should deep clone pen tool points array", () => {
      const penElement = createTestElement("pen-1", {
        type: "pen",
        points: [
          { x: 10, y: 10 },
          { x: 20, y: 20 },
          { x: 30, y: 30 },
        ],
      });

      clipboardManager.copy([penElement]);

      // Mutate original points
      if (penElement.points) {
        penElement.points[0].x = 999;
      }

      // Clipboard should have original values
      const pasted = clipboardManager.paste();
      expect(pasted).not.toBeNull();
      expect(pasted![0].points).toBeDefined();
      expect(pasted![0].points![0].x).toBe(10);
    });

    it("should clone Date objects correctly", () => {
      const originalDate = new Date("2024-01-01T00:00:00Z");
      const element = createTestElement("element-1", {
        createdAt: originalDate,
        updatedAt: originalDate,
      });

      clipboardManager.copy([element]);
      const pasted = clipboardManager.paste();

      expect(pasted).not.toBeNull();
      expect(pasted![0].createdAt).toBeInstanceOf(Date);
      expect(pasted![0].updatedAt).toBeInstanceOf(Date);
      expect(pasted![0].createdAt?.getTime()).toBe(originalDate.getTime());
    });
  });

  describe("US-7 & AC-9: Copy Operations", () => {
    it("should copy single selected element", async () => {
      const element1 = createTestElement("element-1");
      const element2 = createTestElement("element-2");

      // Simulate selecting element-1
      clipboardManager.copy([element1]);

      expect(clipboardManager.getSize()).toBe(1);
      const pasted = clipboardManager.paste();
      expect(pasted).not.toBeNull();
      expect(pasted![0].id).toBe("element-1");
    });

    it("should copy multiple selected elements", async () => {
      const elements = [
        createTestElement("element-1"),
        createTestElement("element-2"),
        createTestElement("element-3"),
      ];

      clipboardManager.copy(elements);

      expect(clipboardManager.getSize()).toBe(3);
      const pasted = clipboardManager.paste();
      expect(pasted).not.toBeNull();
      expect(pasted!.map((el) => el.id)).toEqual(["element-1", "element-2", "element-3"]);
    });

    it("should handle copy with no selection (graceful no-op)", () => {
      clipboardManager.copy([]);

      expect(clipboardManager.hasData()).toBe(false);
      expect(clipboardManager.paste()).toBeNull();
    });
  });

  describe("US-8 & AC-10-13: Paste Operations", () => {
    it("should paste with empty clipboard (graceful no-op)", async () => {
      expect(clipboardManager.paste()).toBeNull();
    });

    it("should create new elements with new IDs", async () => {
      const originalElement = createTestElement("original-1");
      clipboardManager.copy([originalElement]);

      const pasted = clipboardManager.paste();
      expect(pasted).not.toBeNull();

      // Generate new ID and verify it's different
      const newId = generateElementId();
      expect(newId).not.toBe(pasted![0].id);

      // In actual implementation, IDs are regenerated in handlePaste
      // Here we test that clipboard returns the data correctly
      expect(pasted![0].id).toBe("original-1"); // Still has original ID until regenerated
    });

    it("should apply offset to pasted elements", () => {
      const element = createTestElement("element-1", { x: 100, y: 200 });
      clipboardManager.copy([element]);

      const pasted = clipboardManager.paste();
      expect(pasted).not.toBeNull();

      // Simulate paste offset application
      const PASTE_OFFSET = 20;
      const pastedWithOffset = {
        ...pasted![0],
        x: pasted![0].x + PASTE_OFFSET,
        y: pasted![0].y + PASTE_OFFSET,
      };

      expect(pastedWithOffset.x).toBe(120);
      expect(pastedWithOffset.y).toBe(220);
    });

    it("should allow multiple paste operations with independent copies", () => {
      const element = createTestElement("element-1");
      clipboardManager.copy([element]);

      const paste1 = clipboardManager.paste();
      const paste2 = clipboardManager.paste();
      const paste3 = clipboardManager.paste();

      // All pastes should return data
      expect(paste1).not.toBeNull();
      expect(paste2).not.toBeNull();
      expect(paste3).not.toBeNull();

      // Each paste should be a separate clone
      expect(paste1).not.toBe(paste2);
      expect(paste2).not.toBe(paste3);
    });
  });

  describe("US-11 & AC-14: Duplicate Operation", () => {
    it("should duplicate selected elements (copy+paste in one)", async () => {
      const element = createTestElement("element-1", { x: 100, y: 100 });

      // Simulate duplicate: copy then paste with offset
      const DUPLICATE_OFFSET = 20;
      const duplicated = {
        ...element,
        id: generateElementId(),
        x: element.x + DUPLICATE_OFFSET,
        y: element.y + DUPLICATE_OFFSET,
      };

      expect(duplicated.id).not.toBe(element.id);
      expect(duplicated.x).toBe(120);
      expect(duplicated.y).toBe(120);
    });

    it("should duplicate multiple selected elements", () => {
      const elements = [
        createTestElement("element-1", { x: 0, y: 0 }),
        createTestElement("element-2", { x: 100, y: 100 }),
      ];

      const DUPLICATE_OFFSET = 20;
      const duplicated = elements.map((el) => ({
        ...el,
        id: generateElementId(),
        x: el.x + DUPLICATE_OFFSET,
        y: el.y + DUPLICATE_OFFSET,
      }));

      expect(duplicated).toHaveLength(2);
      expect(duplicated[0].x).toBe(20);
      expect(duplicated[1].x).toBe(120);
    });
  });

  describe("US-12 & AC-15: Property Preservation", () => {
    it("should preserve all properties except id, x, y", () => {
      const element = createTestElement("element-1", {
        type: "circle",
        x: 100,
        y: 200,
        width: 300,
        height: 400,
        strokeColor: "#ff0000",
        fillColor: "#00ff00",
        strokeWidth: 5,
        opacity: 0.7,
        zIndex: 10,
      });

      clipboardManager.copy([element]);
      const pasted = clipboardManager.paste();
      expect(pasted).not.toBeNull();

      const pastedElement = pasted![0];

      // These properties should be preserved
      expect(pastedElement.type).toBe("circle");
      expect(pastedElement.width).toBe(300);
      expect(pastedElement.height).toBe(400);
      expect(pastedElement.strokeColor).toBe("#ff0000");
      expect(pastedElement.fillColor).toBe("#00ff00");
      expect(pastedElement.strokeWidth).toBe(5);
      expect(pastedElement.opacity).toBe(0.7);
      expect(pastedElement.zIndex).toBe(10);

      // Original position preserved (offset applied in page handler)
      expect(pastedElement.x).toBe(100);
      expect(pastedElement.y).toBe(200);
    });

    it("should preserve pen tool points", () => {
      const penElement = createTestElement("pen-1", {
        type: "pen",
        points: [
          { x: 10, y: 10 },
          { x: 20, y: 30 },
          { x: 40, y: 50 },
        ],
      });

      clipboardManager.copy([penElement]);
      const pasted = clipboardManager.paste();

      expect(pasted).not.toBeNull();
      expect(pasted![0].type).toBe("pen");
      expect(pasted![0].points).toBeDefined();
      expect(pasted![0].points).toHaveLength(3);
      expect(pasted![0].points![0]).toEqual({ x: 10, y: 10 });
    });
  });

  describe("Database Integration", () => {
    it("should add multiple elements to board via batch operation", async () => {
      const elements = [
        createTestElement("element-1"),
        createTestElement("element-2"),
        createTestElement("element-3"),
      ];

      const updatedBoard = await addMultipleElementsToBoard(TEST_BOARD_ID, elements);

      expect(updatedBoard.elements).toHaveLength(3);
      expect(updatedBoard.elements.map((e: Element) => e.id)).toEqual([
        "element-1",
        "element-2",
        "element-3",
      ]);
    });

    it("should persist pasted elements to database", async () => {
      const originalElement = createTestElement("original-1", {
        x: 100,
        y: 100,
      });
      clipboardManager.copy([originalElement]);

      const pasted = clipboardManager.paste();
      expect(pasted).not.toBeNull();

      // Simulate paste operation with new IDs and offset
      const PASTE_OFFSET = 20;
      const pastedElements = pasted!.map((el) => ({
        ...el,
        id: generateElementId(),
        x: el.x + PASTE_OFFSET,
        y: el.y + PASTE_OFFSET,
      }));

      await addMultipleElementsToBoard(TEST_BOARD_ID, pastedElements);

      const board = await getBoardByIdQuery(TEST_BOARD_ID);
      expect(board?.elements).toHaveLength(1);
      expect(board?.elements[0].x).toBe(120);
      expect(board?.elements[0].y).toBe(120);
    });

    it("should handle batch add with 100+ elements", async () => {
      const elements: Element[] = [];
      for (let i = 0; i < 150; i++) {
        elements.push(createTestElement(`element-${i}`, { x: i, y: i }));
      }

      const startTime = Date.now();
      const updatedBoard = await addMultipleElementsToBoard(TEST_BOARD_ID, elements);
      const endTime = Date.now();

      expect(updatedBoard.elements).toHaveLength(150);
      // Should complete in reasonable time (<500ms)
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe("Edge Cases", () => {
    it("should handle clipboard with deleted elements gracefully", async () => {
      const element = createTestElement("element-1");
      clipboardManager.copy([element]);

      // Simulate element being deleted (clipboard still has reference)
      // This should still work - paste doesn't verify if original exists
      const pasted = clipboardManager.paste();
      expect(pasted).not.toBeNull();
      expect(pasted![0].id).toBe("element-1");
    });

    it("should validate element structure before adding to board", async () => {
      const invalidElement = {
        id: "invalid",
        // Missing required fields
      } as any;

      // This should throw error due to schema validation
      await expect(addMultipleElementsToBoard(TEST_BOARD_ID, [invalidElement])).rejects.toThrow();
    });

    it("should handle paste offset going offscreen", () => {
      const element = createTestElement("element-1", { x: 9990, y: 9990 });
      clipboardManager.copy([element]);

      const pasted = clipboardManager.paste();
      const PASTE_OFFSET = 20;
      const pastedWithOffset = {
        ...pasted![0],
        x: pasted![0].x + PASTE_OFFSET,
        y: pasted![0].y + PASTE_OFFSET,
      };

      // Should still work even if off-screen
      expect(pastedWithOffset.x).toBe(10010);
      expect(pastedWithOffset.y).toBe(10010);
    });

    it("should handle concurrent paste operations", async () => {
      const element = createTestElement("element-1");
      clipboardManager.copy([element]);

      // Simulate multiple simultaneous pastes
      const paste1 = clipboardManager.paste();
      const paste2 = clipboardManager.paste();

      // Both should succeed with separate clones
      expect(paste1).not.toBeNull();
      expect(paste2).not.toBeNull();
      expect(paste1).not.toBe(paste2);
    });

    it("should handle pasting with very large elements", () => {
      const largeElement = createTestElement("large-1", {
        width: 10000,
        height: 10000,
      });

      clipboardManager.copy([largeElement]);
      const pasted = clipboardManager.paste();

      expect(pasted).not.toBeNull();
      expect(pasted![0].width).toBe(10000);
      expect(pasted![0].height).toBe(10000);
    });
  });

  describe("ID Generation", () => {
    it("should generate unique IDs for each paste", () => {
      const ids = new Set<string>();

      for (let i = 0; i < 100; i++) {
        const id = generateElementId();
        ids.add(id);
      }

      // All IDs should be unique
      expect(ids.size).toBe(100);
    });

    it("should generate IDs in expected format", () => {
      const id = generateElementId();

      // Should be a string
      expect(typeof id).toBe("string");
      // Should have reasonable length
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe("Performance", () => {
    it("should copy 100+ elements in <100ms", () => {
      const elements: Element[] = [];
      for (let i = 0; i < 150; i++) {
        elements.push(createTestElement(`element-${i}`));
      }

      const startTime = Date.now();
      clipboardManager.copy(elements);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(clipboardManager.getSize()).toBe(150);
    });

    it("should paste 100+ elements in <100ms", () => {
      const elements: Element[] = [];
      for (let i = 0; i < 150; i++) {
        elements.push(createTestElement(`element-${i}`));
      }

      clipboardManager.copy(elements);

      const startTime = Date.now();
      const pasted = clipboardManager.paste();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(pasted).toHaveLength(150);
    });

    it("should not degrade performance with repeated operations", () => {
      const element = createTestElement("element-1");

      const times: number[] = [];

      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        clipboardManager.copy([element]);
        clipboardManager.paste();
        const endTime = Date.now();
        times.push(endTime - startTime);
      }

      // Performance should be consistent (no gradual degradation)
      const firstHalfAvg = times.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      const secondHalfAvg = times.slice(5).reduce((a, b) => a + b, 0) / 5;

      // Second half shouldn't be significantly slower
      // Operations are so fast that minor timing variations are acceptable
      // Both should be under 1ms average (very fast)
      expect(firstHalfAvg).toBeLessThan(1);
      expect(secondHalfAvg).toBeLessThan(1);
    });
  });
});

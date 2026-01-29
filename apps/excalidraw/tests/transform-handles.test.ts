/**
 * @file Transform Handles Tests
 * Unit tests for resize and rotation functionality
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  HANDLE_SIZE,
  MIN_ELEMENT_SIZE,
  ROTATION_HANDLE_OFFSET,
  ROTATION_HANDLE_SIZE,
  calculateResizeBounds,
  calculateRotation,
  canTransform,
  getCursorForHandle,
  getHandleAtPoint,
  getHandlePositions,
  type Bounds,
  type HandleType,
} from "../lib/canvas/transform-utils.js";
import type { Element, Point } from "../lib/database/shared/types.js";

describe("RFC-001 Phase 3: Transform Handles", () => {
  // Helper to create test elements
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
      ...overrides,
    };
  }

  describe("Handle Position Calculations", () => {
    it("should calculate 9 handle positions for rectangle", () => {
      const element = createTestElement("el-1");
      const handles = getHandlePositions(element);

      expect(handles).toHaveLength(9);
      // 4 corners + 4 edges + 1 rotation
      expect(handles.map((h) => h.type)).toEqual([
        "nw",
        "ne",
        "se",
        "sw",
        "n",
        "e",
        "s",
        "w",
        "rotate",
      ]);
    });

    it("should position corner handles correctly", () => {
      const element = createTestElement("el-1", {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
      const handles = getHandlePositions(element);

      const nw = handles.find((h) => h.type === "nw");
      const ne = handles.find((h) => h.type === "ne");
      const se = handles.find((h) => h.type === "se");
      const sw = handles.find((h) => h.type === "sw");

      expect(nw).toEqual({ type: "nw", x: 100, y: 100, cursor: "nwse-resize" });
      expect(ne).toEqual({ type: "ne", x: 300, y: 100, cursor: "nesw-resize" });
      expect(se).toEqual({ type: "se", x: 300, y: 250, cursor: "nwse-resize" });
      expect(sw).toEqual({ type: "sw", x: 100, y: 250, cursor: "nesw-resize" });
    });

    it("should position edge handles at midpoints", () => {
      const element = createTestElement("el-1", {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
      const handles = getHandlePositions(element);

      const n = handles.find((h) => h.type === "n");
      const e = handles.find((h) => h.type === "e");
      const s = handles.find((h) => h.type === "s");
      const w = handles.find((h) => h.type === "w");

      expect(n).toEqual({ type: "n", x: 200, y: 100, cursor: "ns-resize" });
      expect(e).toEqual({ type: "e", x: 300, y: 175, cursor: "ew-resize" });
      expect(s).toEqual({ type: "s", x: 200, y: 250, cursor: "ns-resize" });
      expect(w).toEqual({ type: "w", x: 100, y: 175, cursor: "ew-resize" });
    });

    it("should position rotation handle above element", () => {
      const element = createTestElement("el-1", {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
      const handles = getHandlePositions(element);

      const rotate = handles.find((h) => h.type === "rotate");

      expect(rotate).toEqual({
        type: "rotate",
        x: 200, // center x
        y: 100 - ROTATION_HANDLE_OFFSET, // above top
        cursor: "grab",
      });
    });

    it("should calculate handles for circle", () => {
      const element = createTestElement("el-1", {
        type: "circle",
        x: 50,
        y: 50,
        width: 100,
        height: 100,
      });
      const handles = getHandlePositions(element);

      expect(handles).toHaveLength(9);
      const nw = handles.find((h) => h.type === "nw");
      expect(nw?.x).toBe(50);
      expect(nw?.y).toBe(50);
    });
  });

  describe("Handle Hit Detection", () => {
    it("should detect corner handle hit", () => {
      const element = createTestElement("el-1", {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });

      const point: Point = { x: 100, y: 100 }; // NW corner
      const handle = getHandleAtPoint(element, point);

      expect(handle).toBe("nw");
    });

    it("should detect edge handle hit", () => {
      const element = createTestElement("el-1", {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });

      const point: Point = { x: 200, y: 100 }; // Top edge
      const handle = getHandleAtPoint(element, point);

      expect(handle).toBe("n");
    });

    it("should detect rotation handle hit", () => {
      const element = createTestElement("el-1", {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });

      const point: Point = { x: 200, y: 100 - ROTATION_HANDLE_OFFSET };
      const handle = getHandleAtPoint(element, point);

      expect(handle).toBe("rotate");
    });

    it("should return null for miss", () => {
      const element = createTestElement("el-1");
      const point: Point = { x: 50, y: 50 }; // Far from handles
      const handle = getHandleAtPoint(element, point);

      expect(handle).toBeNull();
    });

    it("should have hit radius equal to handle size", () => {
      const element = createTestElement("el-1", {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });

      // Just within radius
      const pointInside: Point = { x: 100 + HANDLE_SIZE - 1, y: 100 };
      expect(getHandleAtPoint(element, pointInside)).toBe("nw");

      // Just outside radius
      const pointOutside: Point = { x: 100 + HANDLE_SIZE + 2, y: 100 };
      expect(getHandleAtPoint(element, pointOutside)).toBeNull();
    });
  });

  describe("Cursor Assignment", () => {
    it("should return correct cursor for each handle type", () => {
      const cursors: Record<HandleType, string> = {
        nw: "nwse-resize",
        ne: "nesw-resize",
        se: "nwse-resize",
        sw: "nesw-resize",
        n: "ns-resize",
        s: "ns-resize",
        e: "ew-resize",
        w: "ew-resize",
        rotate: "grab",
      };

      for (const [handle, cursor] of Object.entries(cursors)) {
        expect(getCursorForHandle(handle as HandleType)).toBe(cursor);
      }
    });
  });

  describe("US-2 & AC-2: Corner Handle Resize", () => {
    it("should resize from NW corner (opposite origin)", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      };
      const delta: Point = { x: 20, y: 15 }; // Drag right/down

      const result = calculateResizeBounds(originalBounds, "nw", delta, false);

      // Width/height decrease, position moves
      expect(result.width).toBe(180); // 200 - 20
      expect(result.height).toBe(135); // 150 - 15
      expect(result.x).toBe(120); // Moved to keep SE corner fixed
      expect(result.y).toBe(115);
    });

    it("should resize from SE corner (normal origin)", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      };
      const delta: Point = { x: 20, y: 15 }; // Drag right/down

      const result = calculateResizeBounds(originalBounds, "se", delta, false);

      // Width/height increase, position stays same
      expect(result.width).toBe(220);
      expect(result.height).toBe(165);
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it("should resize from NE corner", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      };
      const delta: Point = { x: 30, y: -20 }; // Drag right/up

      const result = calculateResizeBounds(originalBounds, "ne", delta, false);

      expect(result.width).toBe(230); // Increase
      expect(result.height).toBe(170); // Increase (negative delta)
      expect(result.x).toBe(100); // Fixed
      expect(result.y).toBe(80); // Moved up
    });

    it("should resize from SW corner", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      };
      const delta: Point = { x: -10, y: 20 }; // Drag left/down

      const result = calculateResizeBounds(originalBounds, "sw", delta, false);

      expect(result.width).toBe(210); // Increase (negative delta)
      expect(result.height).toBe(170); // Increase
      expect(result.x).toBe(90); // Moved left
      expect(result.y).toBe(100); // Fixed
    });
  });

  describe("US-3 & AC-5: Edge Handle Resize (1D)", () => {
    it("should resize from top edge (vertical only)", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      };
      const delta: Point = { x: 50, y: 10 }; // X should be ignored

      const result = calculateResizeBounds(originalBounds, "n", delta, false);

      expect(result.width).toBe(200); // Unchanged
      expect(result.height).toBe(140); // Decreased
      expect(result.x).toBe(100); // Unchanged
      expect(result.y).toBe(110); // Moved down
    });

    it("should resize from right edge (horizontal only)", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      };
      const delta: Point = { x: 30, y: 50 }; // Y should be ignored

      const result = calculateResizeBounds(originalBounds, "e", delta, false);

      expect(result.width).toBe(230); // Increased
      expect(result.height).toBe(150); // Unchanged
      expect(result.x).toBe(100); // Unchanged
      expect(result.y).toBe(100); // Unchanged
    });

    it("should resize from bottom edge", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      };
      const delta: Point = { x: 100, y: 25 };

      const result = calculateResizeBounds(originalBounds, "s", delta, false);

      expect(result.width).toBe(200); // Unchanged
      expect(result.height).toBe(175);
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it("should resize from left edge", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      };
      const delta: Point = { x: -20, y: 100 };

      const result = calculateResizeBounds(originalBounds, "w", delta, false);

      expect(result.width).toBe(220); // Increased
      expect(result.height).toBe(150); // Unchanged
      expect(result.x).toBe(80); // Moved left
      expect(result.y).toBe(100);
    });
  });

  describe("US-4 & AC-6: Aspect Ratio Lock", () => {
    it("should lock aspect ratio when Shift pressed (SE corner)", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 200,
        height: 100, // 2:1 ratio
      };
      const delta: Point = { x: 50, y: 10 }; // Try to make non-proportional

      const result = calculateResizeBounds(originalBounds, "se", delta, true);

      expect(result.width).toBe(250);
      expect(result.height).toBe(125); // Locked to 2:1 ratio (not 110)
    });

    it("should lock aspect ratio for NW corner", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 400,
        height: 200, // 2:1 ratio
      };
      const delta: Point = { x: 40, y: 10 };

      const result = calculateResizeBounds(originalBounds, "nw", delta, true);

      expect(result.width).toBe(360);
      expect(result.height).toBe(180); // Locked to 2:1 ratio
    });

    it("should not lock aspect ratio when Shift not pressed", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      };
      const delta: Point = { x: 50, y: 10 };

      const result = calculateResizeBounds(originalBounds, "se", delta, false);

      expect(result.width).toBe(250);
      expect(result.height).toBe(110); // Not locked
    });
  });

  describe("Minimum Size Constraint", () => {
    it("should enforce minimum width", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 50,
        height: 100,
      };
      const delta: Point = { x: -100, y: 0 }; // Try to make negative

      const result = calculateResizeBounds(originalBounds, "e", delta, false);

      expect(result.width).toBe(MIN_ELEMENT_SIZE); // Clamped
    });

    it("should enforce minimum height", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 100,
        height: 50,
      };
      const delta: Point = { x: 0, y: -100 };

      const result = calculateResizeBounds(originalBounds, "s", delta, false);

      expect(result.height).toBe(MIN_ELEMENT_SIZE);
    });

    it("should enforce minimum on both dimensions", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 20,
        height: 20,
      };
      const delta: Point = { x: -50, y: -50 };

      const result = calculateResizeBounds(originalBounds, "se", delta, false);

      expect(result.width).toBe(MIN_ELEMENT_SIZE);
      expect(result.height).toBe(MIN_ELEMENT_SIZE);
    });
  });

  describe("US-5 & AC-3: Rotation Calculation", () => {
    it("should calculate rotation angle from point", () => {
      const element = createTestElement("el-1", {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
      });

      // Element center at (150, 150)
      // Test points at different angles

      // Right (0°)
      const point1: Point = { x: 200, y: 150 };
      expect(calculateRotation(element, point1)).toBe(0);

      // Bottom (90°)
      const point2: Point = { x: 150, y: 200 };
      expect(calculateRotation(element, point2)).toBe(90);

      // Left (180°)
      const point3: Point = { x: 100, y: 150 };
      expect(calculateRotation(element, point3)).toBe(180);

      // Top (270°)
      const point4: Point = { x: 150, y: 100 };
      expect(calculateRotation(element, point4)).toBe(270);
    });

    it("should calculate diagonal angles", () => {
      const element = createTestElement("el-1", {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
      });

      // Bottom-right diagonal (45°)
      const point1: Point = { x: 200, y: 200 };
      expect(calculateRotation(element, point1)).toBe(45);

      // Top-right diagonal (315°)
      const point2: Point = { x: 200, y: 100 };
      const angle2 = calculateRotation(element, point2);
      expect(angle2).toBeGreaterThanOrEqual(315);
      expect(angle2).toBeLessThanOrEqual(316);
    });

    it("should normalize angle to 0-360", () => {
      const element = createTestElement("el-1", {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });

      // Any point should return 0-360
      const point: Point = { x: 25, y: 25 };
      const angle = calculateRotation(element, point);

      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThan(360);
    });
  });

  describe("Element Transform Capability", () => {
    it("should allow transform for rectangle", () => {
      const element = createTestElement("el-1", { type: "rectangle" });
      expect(canTransform(element)).toBe(true);
    });

    it("should allow transform for circle", () => {
      const element = createTestElement("el-1", { type: "circle" });
      expect(canTransform(element)).toBe(true);
    });

    it("should not allow transform for line", () => {
      const element = createTestElement("el-1", {
        type: "line",
        width: undefined,
        height: undefined,
      });
      expect(canTransform(element)).toBe(false);
    });

    it("should not allow transform for text", () => {
      const element = createTestElement("el-1", {
        type: "text",
        width: undefined,
        height: undefined,
        text: "Hello",
        fontSize: 16,
      });
      expect(canTransform(element)).toBe(false);
    });

    it("should not allow transform for pen", () => {
      const element = createTestElement("el-1", {
        type: "pen",
        width: undefined,
        height: undefined,
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
      });
      expect(canTransform(element)).toBe(false);
    });

    it("should require both width and height", () => {
      const elementNoWidth = createTestElement("el-1", {
        type: "rectangle",
        width: undefined,
      });
      expect(canTransform(elementNoWidth)).toBe(false);

      const elementNoHeight = createTestElement("el-1", {
        type: "rectangle",
        height: undefined,
      });
      expect(canTransform(elementNoHeight)).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very small elements", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 15,
        height: 15,
      };
      const delta: Point = { x: -20, y: -20 };

      const result = calculateResizeBounds(originalBounds, "se", delta, false);

      expect(result.width).toBe(MIN_ELEMENT_SIZE);
      expect(result.height).toBe(MIN_ELEMENT_SIZE);
    });

    it("should handle very large elements", () => {
      const originalBounds: Bounds = {
        x: 0,
        y: 0,
        width: 10000,
        height: 10000,
      };
      const delta: Point = { x: 1000, y: 1000 };

      const result = calculateResizeBounds(originalBounds, "se", delta, false);

      expect(result.width).toBe(11000);
      expect(result.height).toBe(11000);
    });

    it("should handle negative position coordinates", () => {
      const originalBounds: Bounds = {
        x: -100,
        y: -50,
        width: 200,
        height: 150,
      };
      const delta: Point = { x: 20, y: 15 };

      const result = calculateResizeBounds(originalBounds, "se", delta, false);

      expect(result.x).toBe(-100);
      expect(result.y).toBe(-50);
      expect(result.width).toBe(220);
      expect(result.height).toBe(165);
    });

    it("should handle square elements (1:1 aspect ratio)", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
      };
      const delta: Point = { x: 25, y: 50 };

      const result = calculateResizeBounds(originalBounds, "se", delta, true);

      expect(result.width).toBe(125);
      expect(result.height).toBe(125); // Locked to 1:1
    });

    it("should handle extreme aspect ratios", () => {
      const originalBounds: Bounds = {
        x: 100,
        y: 100,
        width: 1000,
        height: 10, // 100:1 ratio
      };
      const delta: Point = { x: 100, y: 50 };

      const result = calculateResizeBounds(originalBounds, "se", delta, true);

      expect(result.width).toBe(1100);
      expect(result.height).toBe(11); // Locked to 100:1
    });
  });

  describe("Constants Validation", () => {
    it("should have reasonable handle size", () => {
      expect(HANDLE_SIZE).toBeGreaterThan(0);
      expect(HANDLE_SIZE).toBeLessThan(20);
    });

    it("should have reasonable rotation handle size", () => {
      expect(ROTATION_HANDLE_SIZE).toBeGreaterThan(0);
      expect(ROTATION_HANDLE_SIZE).toBeLessThan(30);
    });

    it("should have positive rotation handle offset", () => {
      expect(ROTATION_HANDLE_OFFSET).toBeGreaterThan(0);
    });

    it("should have positive minimum element size", () => {
      expect(MIN_ELEMENT_SIZE).toBeGreaterThan(0);
      expect(MIN_ELEMENT_SIZE).toBeLessThan(100);
    });
  });
});

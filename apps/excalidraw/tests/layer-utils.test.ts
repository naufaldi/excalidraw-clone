import { describe, expect, it } from "vitest";
import type { Element } from "../lib/database/shared/types.js";
import {
	bringSelectionToFront,
	sendSelectionToBack,
	bringSelectionForward,
	sendSelectionBackward,
} from "../lib/canvas/layer-utils.js";

function createTestElement(
	id: string,
	zIndex: number,
	overrides: Partial<Element> = {},
): Element {
	return {
		id,
		type: "rectangle",
		x: 0,
		y: 0,
		width: 100,
		height: 100,
		strokeColor: "#000000",
		fillColor: "#ffffff",
		strokeWidth: 2,
		opacity: 1,
		zIndex,
		...overrides,
	};
}

describe("Layer utils (zIndex)", () => {
	it("bringSelectionToFront: moves a single selected element above all unselected", () => {
		const elements = [
			createTestElement("a", 0),
			createTestElement("b", 1),
			createTestElement("c", 2),
		];
		const selectedIds = new Set(["a"]);

		const next = bringSelectionToFront(elements, selectedIds);

		const a = next.find((e) => e.id === "a");
		const b = next.find((e) => e.id === "b");
		const c = next.find((e) => e.id === "c");

		expect(a?.zIndex).toBeGreaterThan(Math.max(b?.zIndex ?? 0, c?.zIndex ?? 0));
		expect(b?.zIndex).toBe(1);
		expect(c?.zIndex).toBe(2);
	});

	it("bringSelectionToFront: preserves relative order within a multi-selection", () => {
		const elements = [
			createTestElement("a", 0),
			createTestElement("b", 2),
			createTestElement("c", 5),
			createTestElement("d", 6),
		];
		const selectedIds = new Set(["b", "c"]);

		const next = bringSelectionToFront(elements, selectedIds);

		const b = next.find((e) => e.id === "b");
		const c = next.find((e) => e.id === "c");
		const d = next.find((e) => e.id === "d");

		expect(b?.zIndex).toBeGreaterThan(d?.zIndex ?? 0);
		expect(c?.zIndex).toBeGreaterThan(d?.zIndex ?? 0);
		expect(b?.zIndex).toBeLessThan(c?.zIndex ?? 0);
	});

	it("sendSelectionToBack: moves a multi-selection below all unselected, preserving relative order", () => {
		const elements = [
			createTestElement("a", 0),
			createTestElement("b", 2),
			createTestElement("c", 5),
			createTestElement("d", 6),
		];
		const selectedIds = new Set(["c", "d"]);

		const next = sendSelectionToBack(elements, selectedIds);

		const a = next.find((e) => e.id === "a");
		const b = next.find((e) => e.id === "b");
		const c = next.find((e) => e.id === "c");
		const d = next.find((e) => e.id === "d");

		const minUnselected = Math.min(a?.zIndex ?? 0, b?.zIndex ?? 0);
		expect(c?.zIndex).toBeLessThan(minUnselected);
		expect(d?.zIndex).toBeLessThan(minUnselected);
		expect(c?.zIndex).toBeLessThan(d?.zIndex ?? 0);
	});

	it("bringSelectionForward: moves a single selected element one step forward", () => {
		const elements = [
			createTestElement("a", 0),
			createTestElement("b", 1),
			createTestElement("c", 2),
		];
		const selectedIds = new Set(["b"]);

		const next = bringSelectionForward(elements, selectedIds);
		const b = next.find((e) => e.id === "b");
		const c = next.find((e) => e.id === "c");

		expect(b?.zIndex).toBeGreaterThan(c?.zIndex ?? 0);
	});

	it("sendSelectionBackward: moves a single selected element one step backward", () => {
		const elements = [
			createTestElement("a", 0),
			createTestElement("b", 1),
			createTestElement("c", 2),
		];
		const selectedIds = new Set(["b"]);

		const next = sendSelectionBackward(elements, selectedIds);
		const a = next.find((e) => e.id === "a");
		const b = next.find((e) => e.id === "b");

		expect(b?.zIndex).toBeLessThan(a?.zIndex ?? 0);
	});
});


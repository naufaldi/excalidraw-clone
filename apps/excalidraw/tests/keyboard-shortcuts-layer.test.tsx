import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts.js";
import type { Tool } from "@repo/shared-ui/components";

function Harness({
	selectedIds,
	onBringToFront,
	onSendToBack,
	onBringForward,
	onSendBackward,
}: {
	selectedIds: Set<string>;
	onBringToFront?: () => void;
	onSendToBack?: () => void;
	onBringForward?: () => void;
	onSendBackward?: () => void;
}) {
	useKeyboardShortcuts({
		currentTool: "selection" as Tool,
		onToolSelect: () => {},
		selectedIds,
		onBringToFront,
		onSendToBack,
		onBringForward,
		onSendBackward,
	});
	return null;
}

describe("Keyboard shortcuts: layer controls", () => {
	it("Ctrl/Cmd+Shift+] triggers bring-to-front when there is a selection", async () => {
		const onBringToFront = vi.fn();
		render(<Harness selectedIds={new Set(["a"])} onBringToFront={onBringToFront} />);

		window.dispatchEvent(
			new KeyboardEvent("keydown", { key: "]", ctrlKey: true, shiftKey: true }),
		);

		expect(onBringToFront).toHaveBeenCalledTimes(1);
	});

	it("Ctrl/Cmd+Shift+[ triggers send-to-back when there is a selection", async () => {
		const onSendToBack = vi.fn();
		render(<Harness selectedIds={new Set(["a"])} onSendToBack={onSendToBack} />);

		window.dispatchEvent(
			new KeyboardEvent("keydown", { key: "[", ctrlKey: true, shiftKey: true }),
		);

		expect(onSendToBack).toHaveBeenCalledTimes(1);
	});

	it("Ctrl/Cmd+] triggers bring-forward when there is a single selection", async () => {
		const onBringForward = vi.fn();
		render(
			<Harness selectedIds={new Set(["a"])} onBringForward={onBringForward} />,
		);

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "]", ctrlKey: true }));

		expect(onBringForward).toHaveBeenCalledTimes(1);
	});

	it("Ctrl/Cmd+[ triggers send-backward when there is a single selection", async () => {
		const onSendBackward = vi.fn();
		render(
			<Harness selectedIds={new Set(["a"])} onSendBackward={onSendBackward} />,
		);

		window.dispatchEvent(new KeyboardEvent("keydown", { key: "[", ctrlKey: true }));

		expect(onSendBackward).toHaveBeenCalledTimes(1);
	});

	it("does not trigger layer actions when selection is empty", async () => {
		const onBringToFront = vi.fn();
		const onSendToBack = vi.fn();
		const onBringForward = vi.fn();
		const onSendBackward = vi.fn();

		render(
			<Harness
				selectedIds={new Set()}
				onBringToFront={onBringToFront}
				onSendToBack={onSendToBack}
				onBringForward={onBringForward}
				onSendBackward={onSendBackward}
			/>,
		);

		window.dispatchEvent(
			new KeyboardEvent("keydown", { key: "]", ctrlKey: true, shiftKey: true }),
		);
		window.dispatchEvent(
			new KeyboardEvent("keydown", { key: "[", ctrlKey: true, shiftKey: true }),
		);
		window.dispatchEvent(new KeyboardEvent("keydown", { key: "]", ctrlKey: true }));
		window.dispatchEvent(new KeyboardEvent("keydown", { key: "[", ctrlKey: true }));

		expect(onBringToFront).toHaveBeenCalledTimes(0);
		expect(onSendToBack).toHaveBeenCalledTimes(0);
		expect(onBringForward).toHaveBeenCalledTimes(0);
		expect(onSendBackward).toHaveBeenCalledTimes(0);
	});
});


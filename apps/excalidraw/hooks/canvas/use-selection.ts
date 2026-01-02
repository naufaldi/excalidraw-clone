/**
 * Hook for canvas selection state management
 */

import { useCallback, useRef, useState } from "react";
import type { Element, Point } from "../../lib/database/shared/types.js";
import {
	createEmptySelection,
	findElementsAtPoint,
	findElementsInBox,
	getBoundingBox,
	type SelectionState,
} from "../../lib/canvas/index.js";

interface UseSelectionOptions {
	elements: Element[];
	onSelectionChange?: (selectedIds: Set<string>) => void;
}

interface UseSelectionReturn {
	selection: SelectionState;
	isShiftPressed: boolean;
	handleSelectionStart: (point: Point) => boolean;
	handleSelectionMove: (point: Point) => void;
	handleSelectionEnd: (point: Point) => void;
	clearSelection: () => void;
	setShiftPressed: (pressed: boolean) => void;
}

/**
 * Manages selection state and handlers for canvas elements
 */
export function useSelection({
	elements,
	onSelectionChange,
}: UseSelectionOptions): UseSelectionReturn {
	const [selection, setSelection] = useState<SelectionState>({
		...createEmptySelection(),
	});

	const isShiftPressedRef = useRef(false);

	const clearSelection = useCallback(() => {
		const newSelection = createEmptySelection();
		setSelection(newSelection);
		onSelectionChange?.(new Set());
	}, [onSelectionChange]);

	const setShiftPressed = useCallback((pressed: boolean) => {
		isShiftPressedRef.current = pressed;
	}, []);

	const handleSelectionStart = useCallback(
		(point: Point): boolean => {
			const hitElements = findElementsAtPoint(elements, point);
			const hitElement = hitElements[0];

			if (hitElement && !selection.selectedIds.has(hitElement.id)) {
				// Clicked on unselected element
				if (!isShiftPressedRef.current) {
					// Clear previous selection
					setSelection({
						...createEmptySelection(),
						selectedIds: new Set([hitElement.id]),
					});
					onSelectionChange?.(new Set([hitElement.id]));
				} else {
					// Add to selection
					const newIds = new Set(selection.selectedIds);
					newIds.add(hitElement.id);
					setSelection({
						...selection,
						selectedIds: newIds,
					});
					onSelectionChange?.(newIds);
				}
				return true;
			}

			if (hitElement && selection.selectedIds.has(hitElement.id)) {
				// Clicked on already selected element - deselect if no shift
				if (!isShiftPressedRef.current) {
					setSelection({
						...createEmptySelection(),
					});
					onSelectionChange?.(new Set());
				}
				return true;
			}

			// Clicked on empty space - start selection box
			setSelection({
				...createEmptySelection(),
				isSelecting: true,
				selectionStartPoint: point,
				selectedIds: isShiftPressedRef.current
					? new Set(selection.selectedIds)
					: new Set(),
			});
			return false;
		},
		[elements, selection, onSelectionChange],
	);

	const handleSelectionMove = useCallback(
		(point: Point) => {
			if (!selection.isSelecting || !selection.selectionStartPoint) return;

			const box = getBoundingBox(selection.selectionStartPoint, point);
			setSelection((prev) => ({
				...prev,
				selectionBox: box,
			}));
		},
		[selection.isSelecting, selection.selectionStartPoint],
	);

	const handleSelectionEnd = useCallback(
		(point: Point) => {
			if (!selection.isSelecting || !selection.selectionStartPoint) return;

			const box = getBoundingBox(selection.selectionStartPoint, point);

			if (box.width > 5 && box.height > 5) {
				// Find elements in selection box
				const elementsInBox = findElementsInBox(elements, box);
				const newIds: Set<string> = isShiftPressedRef.current
					? new Set(selection.selectedIds)
					: new Set<string>();

				for (const el of elementsInBox) {
					newIds.add(el.id);
				}

				setSelection({
					...createEmptySelection(),
					selectedIds: newIds,
				});
				onSelectionChange?.(newIds);
			} else {
				// Box too small, treat as click - clear if no shift
				if (!isShiftPressedRef.current) {
					setSelection({
						...createEmptySelection(),
						selectedIds: new Set<string>(),
					});
					onSelectionChange?.(new Set<string>());
				}
			}
		},
		[elements, selection, onSelectionChange],
	);

	return {
		selection,
		isShiftPressed: isShiftPressedRef.current,
		handleSelectionStart,
		handleSelectionMove,
		handleSelectionEnd,
		clearSelection,
		setShiftPressed,
	};
}

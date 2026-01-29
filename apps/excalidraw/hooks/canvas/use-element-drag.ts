/**
 * Hook for dragging selected elements on the canvas
 */

import { useCallback, useRef, useState } from "react";
import type { Element, Point } from "../../lib/database/shared/types.js";
import { moveElements } from "../../lib/canvas/manipulation.js";

interface UseElementDragOptions {
	elements: Element[];
	selectedIds: Set<string>;
	onElementsMove?: (movedElements: Element[]) => void;
}

interface DragState {
	isDragging: boolean;
	startPoint: Point | null;
	draggedElements: Element[];
}

interface UseElementDragReturn {
	dragState: DragState;
	handleDragStart: (point: Point) => boolean;
	handleDragMove: (point: Point) => Element[];
	handleDragEnd: () => void;
}

/**
 * Manages drag state for moving selected elements
 */
export function useElementDrag({
	elements,
	selectedIds,
	onElementsMove,
}: UseElementDragOptions): UseElementDragReturn {
	const [dragState, setDragState] = useState<DragState>({
		isDragging: false,
		startPoint: null,
		draggedElements: [],
	});

	const lastPointRef = useRef<Point | null>(null);

	const handleDragStart = useCallback(
		(point: Point): boolean => {
			if (selectedIds.size === 0) return false;

			const selectedElements = elements.filter((el) => selectedIds.has(el.id));

			if (selectedElements.length === 0) return false;

			lastPointRef.current = point;
			setDragState({
				isDragging: true,
				startPoint: point,
				draggedElements: selectedElements,
			});

			return true;
		},
		[elements, selectedIds],
	);

	const handleDragMove = useCallback(
		(point: Point): Element[] => {
			if (!dragState.isDragging || !lastPointRef.current) return [];

			const dx = point.x - lastPointRef.current.x;
			const dy = point.y - lastPointRef.current.y;

			if (dx === 0 && dy === 0) return dragState.draggedElements;

			lastPointRef.current = point;

			const movedElements = moveElements(dragState.draggedElements, dx, dy);

			setDragState((prev) => ({
				...prev,
				draggedElements: movedElements,
			}));

			return movedElements;
		},
		[dragState.isDragging, dragState.draggedElements],
	);

	const handleDragEnd = useCallback(() => {
		if (!dragState.isDragging) return;

		if (dragState.draggedElements.length > 0) {
			onElementsMove?.(dragState.draggedElements);
		}

		lastPointRef.current = null;
		setDragState({
			isDragging: false,
			startPoint: null,
			draggedElements: [],
		});
	}, [dragState.isDragging, dragState.draggedElements, onElementsMove]);

	return {
		dragState,
		handleDragStart,
		handleDragMove,
		handleDragEnd,
	};
}

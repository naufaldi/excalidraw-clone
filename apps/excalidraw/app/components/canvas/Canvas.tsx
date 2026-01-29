/**
 * Main Canvas component for whiteboard drawing
 * Refactored to use custom hooks and shared renderer functions
 */

import type { Tool } from "@repo/shared-ui/components";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
	useCanvasEvents,
	useCanvasSize,
	useDrawing,
	useDrawLoop,
	useElementDrag,
	usePan,
	useSelection,
	useViewport,
} from "#hooks/canvas/index.js";
import {
	findElementsAtPoint,
	getCursorForTool,
	renderElement,
	renderSelectionBox,
	renderSelectionHighlights,
} from "#lib/canvas/index.js";
import type { Element, Point } from "#lib/database/shared/types.js";

interface CanvasProps {
	elements: Element[];
	currentTool?: Tool;
	strokeWidth?: number;
	strokeColor?: string;
	fillColor?: string;
	onElementCreate?: (element: Element) => void;
	onSelectionChange?: (selectedIds: Set<string>) => void;
	onElementDelete?: (elementId: string) => void;
	onElementsMove?: (movedElements: Element[]) => void;
}

/**
 * Whiteboard canvas with drawing capabilities
 * Uses custom hooks for separation of concerns
 */
export const Canvas = memo(function CanvasComponent({
	elements,
	currentTool = "rectangle",
	strokeWidth = 2,
	strokeColor = "var(--stroke-primary)",
	fillColor = "var(--fill-transparent)",
	onElementCreate,
	onSelectionChange,
	onElementDelete,
	onElementsMove,
}: CanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { width, height } = useCanvasSize();
	const { viewport, pan } = useViewport();

	// Selection hook
	const {
		selection,
		handleSelectionStart,
		handleSelectionMove,
		handleSelectionEnd,
		clearSelection,
		setShiftPressed,
	} = useSelection({
		elements,
		onSelectionChange,
	});

	// Track shift key state for drawing constraints
	const [isShiftPressed, setIsShiftPressed] = useState(false);

	// Element drag hook
	const { dragState, handleDragStart, handleDragMove, handleDragEnd } =
		useElementDrag({
			elements,
			selectedIds: selection.selectedIds,
			onElementsMove,
		});

	// Drawing hook
	const {
		drawingState,
		handleDrawingStart,
		handleDrawingMove,
		handleDrawingEnd,
		syncDrawingState,
	} = useDrawing({
		currentTool: currentTool as any,
		strokeWidth,
		strokeColor,
		fillColor,
		elementsCount: elements.length,
		isShiftPressed,
		onElementCreate,
	});

	// Pan hook
	usePan({
		canvasRef,
		enabled: currentTool === "hand",
		onPan: pan,
	});

	// Sync drawing state with props
	useEffect(() => {
		syncDrawingState();
	}, [syncDrawingState]);

	// Clear selection when switching away from selection tool
	useEffect(() => {
		if (currentTool !== "selection" && selection.selectedIds.size > 0) {
			clearSelection();
		}
	}, [currentTool, selection.selectedIds.size, clearSelection]);

	// Keyboard event handling for shift key (shared between selection and drawing)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Shift") {
				setShiftPressed(true);
				setIsShiftPressed(true);
			}
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === "Shift") {
				setShiftPressed(false);
				setIsShiftPressed(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [setShiftPressed]);

	// Unified draw start handler
	const handleDrawStart = useCallback(
		(point: Point) => {
			if (currentTool === "selection") {
				// Check if clicking on an already selected element to start drag
				const hitElements = findElementsAtPoint(elements, point);
				const hitElement = hitElements[0];

				if (hitElement && selection.selectedIds.has(hitElement.id)) {
					// Start dragging selected elements
					handleDragStart(point);
					return;
				}

				handleSelectionStart(point);
				return;
			}

			if (currentTool === "eraser") {
				const hitElements = findElementsAtPoint(elements, point);
				if (hitElements.length > 0) {
					onElementDelete?.(hitElements[0].id);
				}
				return;
			}

			if (currentTool === "hand") {
				return; // Handled by usePan
			}

			handleDrawingStart(point);
		},
		[
			currentTool,
			elements,
			selection.selectedIds,
			handleSelectionStart,
			handleDragStart,
			handleDrawingStart,
			onElementDelete,
		],
	);

	// Unified draw move handler
	const handleDrawMove = useCallback(
		(point: Point) => {
			if (currentTool === "selection") {
				if (dragState.isDragging) {
					handleDragMove(point);
					return;
				}
				handleSelectionMove(point);
				return;
			}

			handleDrawingMove(point);
		},
		[
			currentTool,
			dragState.isDragging,
			handleDragMove,
			handleSelectionMove,
			handleDrawingMove,
		],
	);

	// Unified draw end handler
	const handleDrawEnd = useCallback(
		(point: Point) => {
			if (currentTool === "selection") {
				if (dragState.isDragging) {
					handleDragEnd();
					return;
				}
				handleSelectionEnd(point);
				return;
			}

			handleDrawingEnd(point);
		},
		[
			currentTool,
			dragState.isDragging,
			handleDragEnd,
			handleSelectionEnd,
			handleDrawingEnd,
		],
	);

	// Setup event handlers
	useCanvasEvents({
		canvasRef,
		viewport,
		onDrawStart: handleDrawStart,
		onDrawMove: handleDrawMove,
		onDrawEnd: handleDrawEnd,
		enabled: currentTool !== "hand",
	});

	// Custom render function with selection
	const renderWithSelection = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			// Render elements
			const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
			for (const element of sortedElements) {
				// Skip selected elements when dragging (we render them separately)
				if (dragState.isDragging && selection.selectedIds.has(element.id)) {
					continue;
				}
				if (selection.selectedIds.has(element.id)) continue;
				ctx.save();
				ctx.translate(viewport.offsetX, viewport.offsetY);
				ctx.scale(viewport.zoom, viewport.zoom);
				renderElement(ctx, element);
				ctx.restore();
			}

			// Render dragged elements at their preview positions
			if (dragState.isDragging) {
				for (const el of dragState.draggedElements) {
					ctx.save();
					ctx.translate(viewport.offsetX, viewport.offsetY);
					ctx.scale(viewport.zoom, viewport.zoom);
					renderElement(ctx, el);
					ctx.restore();
				}
			}

			// Render preview element
			if (drawingState.previewElement) {
				ctx.save();
				ctx.translate(viewport.offsetX, viewport.offsetY);
				ctx.scale(viewport.zoom, viewport.zoom);
				renderElement(ctx, drawingState.previewElement);
				ctx.restore();
			}

			// Render selection box
			if (selection.isSelecting && selection.selectionBox) {
				renderSelectionBox(ctx, selection.selectionBox, viewport);
			}

			// Render selection highlights (use dragged positions if dragging)
			if (selection.selectedIds.size > 0) {
				const elementsForHighlight = dragState.isDragging
					? dragState.draggedElements
					: elements.filter((el) => selection.selectedIds.has(el.id));
				renderSelectionHighlights(
					ctx,
					selection.selectedIds,
					dragState.isDragging ? elementsForHighlight : elements,
					viewport,
				);
			}
		},
		[elements, drawingState.previewElement, selection, viewport, dragState],
	);

	// Setup render loop
	useDrawLoop({
		canvasRef,
		elements,
		viewport,
		previewElement: drawingState.previewElement,
		customRender: renderWithSelection,
	});

	const cursor = getCursorForTool(currentTool, selection.isSelecting);

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			style={{
				display: "block",
				cursor,
				touchAction: "none",
			}}
		/>
	);
});

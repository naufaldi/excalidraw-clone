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
			handleSelectionStart,
			handleDrawingStart,
			onElementDelete,
		],
	);

	// Unified draw move handler
	const handleDrawMove = useCallback(
		(point: Point) => {
			if (currentTool === "selection") {
				handleSelectionMove(point);
				return;
			}

			handleDrawingMove(point);
		},
		[currentTool, handleSelectionMove, handleDrawingMove],
	);

	// Unified draw end handler
	const handleDrawEnd = useCallback(
		(point: Point) => {
			if (currentTool === "selection") {
				handleSelectionEnd(point);
				return;
			}

			handleDrawingEnd(point);
		},
		[currentTool, handleSelectionEnd, handleDrawingEnd],
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
				if (selection.selectedIds.has(element.id)) continue;
				ctx.save();
				ctx.translate(viewport.offsetX, viewport.offsetY);
				ctx.scale(viewport.zoom, viewport.zoom);
				renderElement(ctx, element);
				ctx.restore();
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

			// Render selection highlights
			if (selection.selectedIds.size > 0) {
				renderSelectionHighlights(
					ctx,
					selection.selectedIds,
					elements,
					viewport,
				);
			}
		},
		[elements, drawingState.previewElement, selection, viewport],
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

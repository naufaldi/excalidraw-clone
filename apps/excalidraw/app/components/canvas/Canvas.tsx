/**
 * Main Canvas component for whiteboard drawing
 */

import { useCallback, useRef, useState } from "react";
import {
	useCanvasEvents,
	useCanvasSize,
	useDrawLoop,
	useViewport,
} from "#hooks/canvas/index.js";
import {
	DEFAULT_DRAWING_STATE,
	type DrawingState,
	generateElementId,
	getBoundingBox,
} from "#lib/canvas/index.js";
import type {
	Element,
	ElementType,
	Point,
} from "#lib/database/shared/types.js";

interface CanvasProps {
	elements: Element[];
	currentTool?: ElementType;
	onElementCreate?: (element: Element) => void;
}

/**
 * Whiteboard canvas with drawing capabilities
 */
export function Canvas({
	elements,
	currentTool = "rectangle",
	onElementCreate,
}: CanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { width, height } = useCanvasSize();
	const { viewport } = useViewport();

	const [drawingState, setDrawingState] = useState<DrawingState>({
		...DEFAULT_DRAWING_STATE,
		currentTool,
	});

	// Update current tool when prop changes
	if (drawingState.currentTool !== currentTool) {
		setDrawingState((prev) => ({ ...prev, currentTool }));
	}

	const handleDrawStart = useCallback((point: Point) => {
		setDrawingState((prev) => ({
			...prev,
			isDrawing: true,
			startPoint: point,
			previewElement: createPreviewElement(prev.currentTool, point, point),
		}));
	}, []);

	const handleDrawMove = useCallback((point: Point) => {
		setDrawingState((prev) => {
			if (!prev.isDrawing || !prev.startPoint) return prev;
			return {
				...prev,
				previewElement: createPreviewElement(
					prev.currentTool,
					prev.startPoint,
					point,
				),
			};
		});
	}, []);

	const handleDrawEnd = useCallback(
		(point: Point) => {
			setDrawingState((prev) => {
				if (!prev.isDrawing || !prev.startPoint) return prev;

				const element = createFinalElement(
					prev.currentTool,
					prev.startPoint,
					point,
					elements.length,
				);

				if (element && onElementCreate) {
					onElementCreate(element);
				}

				return {
					...prev,
					isDrawing: false,
					startPoint: null,
					previewElement: null,
				};
			});
		},
		[elements.length, onElementCreate],
	);

	// Setup event handlers
	useCanvasEvents({
		canvasRef,
		viewport,
		onDrawStart: handleDrawStart,
		onDrawMove: handleDrawMove,
		onDrawEnd: handleDrawEnd,
	});

	// Setup render loop
	useDrawLoop({
		canvasRef,
		elements,
		viewport,
		previewElement: drawingState.previewElement,
	});

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			style={{
				display: "block",
				cursor: "crosshair",
				touchAction: "none",
			}}
		/>
	);
}

/**
 * Create a preview element during drawing
 */
function createPreviewElement(
	tool: ElementType,
	start: Point,
	end: Point,
): Element {
	const { x, y, width, height } = getBoundingBox(start, end);
	const now = new Date();

	const base: Element = {
		id: "preview",
		type: tool,
		x,
		y,
		width,
		height,
		strokeColor: "#000000",
		fillColor: "#ffffff",
		strokeWidth: 2,
		opacity: 1,
		zIndex: 999999,
		createdAt: now,
		updatedAt: now,
	};

	if (tool === "line" || tool === "arrow") {
		return {
			...base,
			x: start.x,
			y: start.y,
			width: end.x - start.x,
			height: end.y - start.y,
		};
	}

	return base;
}

/**
 * Create the final element when drawing completes
 */
function createFinalElement(
	tool: ElementType,
	start: Point,
	end: Point,
	zIndex: number,
): Element | null {
	const { x, y, width, height } = getBoundingBox(start, end);

	// Skip tiny elements (likely accidental clicks)
	if (width < 5 && height < 5) {
		return null;
	}

	const now = new Date();

	const base: Element = {
		id: generateElementId(),
		type: tool,
		x,
		y,
		width,
		height,
		strokeColor: "#000000",
		fillColor: "#ffffff",
		strokeWidth: 2,
		opacity: 1,
		zIndex,
		createdAt: now,
		updatedAt: now,
	};

	if (tool === "line" || tool === "arrow") {
		return {
			...base,
			x: start.x,
			y: start.y,
			width: end.x - start.x,
			height: end.y - start.y,
		};
	}

	return base;
}

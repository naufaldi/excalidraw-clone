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
import type { Tool } from "@repo/shared-ui/components";

interface CanvasProps {
	elements: Element[];
	currentTool?: Tool;
	strokeWidth?: number;
	strokeColor?: string;
	fillColor?: string;
	onElementCreate?: (element: Element) => void;
}

/**
 * Whiteboard canvas with drawing capabilities
 */
export function Canvas({
	elements,
	currentTool = "rectangle",
	strokeWidth = 2,
	strokeColor = "var(--stroke-primary)",
	fillColor = "var(--fill-transparent)",
	onElementCreate,
}: CanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { width, height } = useCanvasSize();
	const { viewport } = useViewport();

	const [drawingState, setDrawingState] = useState<DrawingState>({
		...DEFAULT_DRAWING_STATE,
		currentTool: currentTool as ElementType,
		strokeWidth,
		strokeColor,
		fillColor,
	});

	// Update current tool and styles when props change
	if (
		drawingState.currentTool !== currentTool ||
		drawingState.strokeWidth !== strokeWidth ||
		drawingState.strokeColor !== strokeColor ||
		drawingState.fillColor !== fillColor
	) {
		setDrawingState((prev) => ({
			...prev,
			currentTool: currentTool as ElementType,
			strokeWidth,
			strokeColor,
			fillColor,
		}));
	}

	const handleDrawStart = useCallback((point: Point) => {
		if (drawingState.currentTool === "pen") {
			// For pen tool, start collecting points
			const penElement: Element = {
				id: "preview",
				type: "pen",
				x: 0,
				y: 0,
				points: [point],
				strokeColor: drawingState.strokeColor,
				fillColor: drawingState.fillColor,
				strokeWidth: drawingState.strokeWidth,
				opacity: 1,
				zIndex: 999999,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			setDrawingState((prev) => ({
				...prev,
				isDrawing: true,
				startPoint: point,
				previewElement: penElement,
			}));
		} else if (drawingState.currentTool === "text") {
			// For text tool, create text element directly
			const textElement: Element = {
				id: generateElementId(),
				type: "text",
				x: point.x,
				y: point.y,
				text: "Double-click to edit",
				fontSize: 16,
				strokeColor: drawingState.strokeColor,
				fillColor: "transparent",
				strokeWidth: 0,
				opacity: 1,
				zIndex: elements.length,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			if (onElementCreate) {
				onElementCreate(textElement);
			}

			// Don't set drawing state for text tool
			return;
		} else {
			setDrawingState((prev) => ({
				...prev,
				isDrawing: true,
				startPoint: point,
				previewElement: createPreviewElement(
					prev.currentTool,
					point,
					point,
					prev.strokeColor,
					prev.fillColor,
					prev.strokeWidth
				),
			}));
		}
	}, [drawingState.currentTool, drawingState.strokeColor, drawingState.fillColor, drawingState.strokeWidth, elements.length, onElementCreate]);

	const handleDrawMove = useCallback((point: Point) => {
		setDrawingState((prev) => {
			if (!prev.isDrawing || !prev.startPoint) return prev;
			
			if (prev.currentTool === "pen" && prev.previewElement && prev.previewElement.points) {
				// For pen tool, add point to the path
				const lastPoint = prev.previewElement.points[prev.previewElement.points.length - 1];
				const distance = Math.sqrt(
					(point.x - lastPoint.x) ** 2 + (point.y - lastPoint.y) ** 2
				);
				
				// Only add point if it's far enough from the last point (performance optimization)
				if (distance > 2) {
					return {
						...prev,
						previewElement: {
							...prev.previewElement,
							points: [...prev.previewElement.points, point],
						},
					};
				}
				return prev;
			} else {
				return {
					...prev,
					previewElement: createPreviewElement(
						prev.currentTool,
						prev.startPoint,
						point,
						prev.strokeColor,
						prev.fillColor,
						prev.strokeWidth
					),
				};
			}
		});
	}, []);

	const handleDrawEnd = useCallback(
		(point: Point) => {
			setDrawingState((prev) => {
				if (!prev.isDrawing || !prev.startPoint) return prev;

				let element: Element | null = null;

				if (prev.currentTool === "pen" && prev.previewElement && prev.previewElement.points) {
					// For pen tool, finalize the path
					if (prev.previewElement.points.length > 1) {
						element = {
							...prev.previewElement,
							id: generateElementId(),
							points: prev.previewElement.points,
							createdAt: new Date(),
							updatedAt: new Date(),
						};
					}
				} else {
					// For other tools, use the standard creation method
					element = createFinalElement(
						prev.currentTool,
						prev.startPoint,
						point,
						elements.length,
						prev.strokeColor,
						prev.fillColor,
						prev.strokeWidth
					);
				}

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
	strokeColor: string,
	fillColor: string,
	strokeWidth: number,
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
		strokeColor,
		fillColor,
		strokeWidth,
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
	strokeColor: string,
	fillColor: string,
	strokeWidth: number,
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
		strokeColor,
		fillColor,
		strokeWidth,
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

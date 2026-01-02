/**
 * Main Canvas component for whiteboard drawing
 */

import { useCallback, useRef, useState, useEffect } from "react";
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
	type BoundingBox,
	createEmptySelection,
	findElementsAtPoint,
	findElementsInBox,
	getCombinedBoundingBox,
} from "#lib/canvas/index.js";
import {
	renderSelectionBox,
	renderSelectionHighlights,
} from "#lib/canvas/renderer.js";

// Debug: Track re-renders
let renderCount = 0;
let mountCount = 0;
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
	onSelectionChange?: (selectedIds: Set<string>) => void;
	onElementDelete?: (elementId: string) => void;
}

/** Selection state interface */
interface SelectionState {
	selectedIds: Set<string>;
	selectionBox: BoundingBox | null;
	isSelecting: boolean;
	selectionStartPoint: Point | null;
}

/** Get cursor style based on tool */
function getCursorForTool(tool: Tool, isSelecting: boolean): string {
	if (isSelecting) return "crosshair";
	switch (tool) {
		case "selection":
			return "default";
		case "hand":
			return "grab";
		case "eraser":
			return "crosshair";
		default:
			return "crosshair";
	}
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
	onSelectionChange,
	onElementDelete,
}: CanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { width, height } = useCanvasSize();
	const { viewport, pan } = useViewport();

	// Debug: Log component mount
	useEffect(() => {
		mountCount++;
		console.log(`[Canvas Component] MOUNTED (count: ${mountCount})`);

		return () => {
			console.log(`[Canvas Component] UNMOUNTED (count: ${mountCount})`);
		};
	}, []);

	// Debug: Log re-renders
	useEffect(() => {
		renderCount++;
		console.log(
			`[Canvas Component] RENDERED (count: ${renderCount}, tool: ${currentTool})`,
		);
	}, [currentTool, elements]);

	const [drawingState, setDrawingState] = useState<DrawingState>({
		...DEFAULT_DRAWING_STATE,
		currentTool: currentTool as ElementType,
		strokeWidth,
		strokeColor,
		fillColor,
	});

	const [selection, setSelection] = useState<SelectionState>({
		...createEmptySelection(),
		selectionStartPoint: null,
	});

	const [panState, setPanState] = useState({
		isPanning: false,
		startX: 0,
		startY: 0,
	});

	const isShiftPressedRef = useRef(false);

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

	// Clear selection when switching away from selection tool
	useEffect(() => {
		if (currentTool !== "selection") {
			if (selection.selectedIds.size > 0) {
				const newSelection = createEmptySelection();
				setSelection({ ...newSelection, selectionStartPoint: null });
				onSelectionChange?.(new Set());
			}
		}
	}, [currentTool, selection.selectedIds.size, onSelectionChange]);

	const handleDrawStart = useCallback(
		(point: Point) => {
			const isSelectionTool = currentTool === "selection";
			const isEraserTool = currentTool === "eraser";
			const isHandTool = currentTool === "hand";

			if (isSelectionTool) {
				// Start selection box or single element selection
				const hitElements = findElementsAtPoint(elements, point);
				const hitElement = hitElements[0];

				if (hitElement && !selection.selectedIds.has(hitElement.id)) {
					// Clicked on unselected element
					if (!isShiftPressedRef.current) {
						// Clear previous selection
						setSelection({
							...createEmptySelection(),
							selectedIds: new Set([hitElement.id]),
							selectionStartPoint: null,
						});
						onSelectionChange?.(new Set([hitElement.id]));
					} else {
						// Add to selection
						const newIds = new Set(selection.selectedIds);
						newIds.add(hitElement.id);
						setSelection({
							...selection,
							selectedIds: newIds,
							selectionStartPoint: null,
						});
						onSelectionChange?.(newIds);
					}
				} else if (hitElement && selection.selectedIds.has(hitElement.id)) {
					// Clicked on already selected element - clear selection if no shift
					if (!isShiftPressedRef.current) {
						setSelection({
							...createEmptySelection(),
							selectionStartPoint: null,
						});
						onSelectionChange?.(new Set());
					}
				} else {
					// Clicked on empty space - start selection box
					setSelection({
						...createEmptySelection(),
						isSelecting: true,
						selectionStartPoint: point,
						selectedIds: isShiftPressedRef.current
							? new Set(selection.selectedIds)
							: new Set(),
					});
				}
				return;
			}

			if (isEraserTool) {
				const hitElements = findElementsAtPoint(elements, point);
				if (hitElements.length > 0) {
					const hitElement = hitElements[0];
					const newIds = new Set(selection.selectedIds);
					newIds.delete(hitElement.id);
					setSelection({
						...selection,
						selectedIds: newIds,
					});
					onSelectionChange?.(newIds);
					onElementDelete?.(hitElement.id);
				}
				return;
			}

			if (isHandTool) {
				// Pan handled by useCanvasEvents through viewport
				return;
			}

			// Drawing tools
			if (drawingState.currentTool === "pen") {
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
						prev.strokeWidth,
					),
				}));
			}
		},
		[
			currentTool,
			drawingState.currentTool,
			drawingState.strokeColor,
			drawingState.fillColor,
			drawingState.strokeWidth,
			elements,
			selection,
			onElementCreate,
			onSelectionChange,
			onElementDelete,
		],
	);

	const handleDrawMove = useCallback(
		(point: Point) => {
			const isSelectionTool = currentTool === "selection";

			if (
				isSelectionTool &&
				selection.isSelecting &&
				selection.selectionStartPoint
			) {
				// Update selection box
				const box = getBoundingBox(selection.selectionStartPoint, point);
				setSelection((prev) => ({
					...prev,
					selectionBox: box,
				}));
				return;
			}

			setDrawingState((prev) => {
				if (!prev.isDrawing || !prev.startPoint) return prev;

				if (
					prev.currentTool === "pen" &&
					prev.previewElement &&
					prev.previewElement.points
				) {
					const lastPoint =
						prev.previewElement.points[prev.previewElement.points.length - 1];
					const distance = Math.sqrt(
						(point.x - lastPoint.x) ** 2 + (point.y - lastPoint.y) ** 2,
					);

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
							prev.strokeWidth,
						),
					};
				}
			});
		},
		[currentTool, selection],
	);

	const handleDrawEnd = useCallback(
		(point: Point) => {
			const isSelectionTool = currentTool === "selection";

			if (
				isSelectionTool &&
				selection.isSelecting &&
				selection.selectionStartPoint
			) {
				// Complete selection box
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
				return;
			}

			setDrawingState((prev) => {
				if (!prev.isDrawing || !prev.startPoint) return prev;

				let element: Element | null = null;

				if (
					prev.currentTool === "pen" &&
					prev.previewElement &&
					prev.previewElement.points
				) {
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
					element = createFinalElement(
						prev.currentTool,
						prev.startPoint,
						point,
						elements.length,
						prev.strokeColor,
						prev.fillColor,
						prev.strokeWidth,
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
		[currentTool, elements, selection, onElementCreate, onSelectionChange],
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

	// Pan tool event handlers
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || currentTool !== "hand") return;

		const handleMouseDown = (e: MouseEvent) => {
			if (e.button !== 0) return;
			setPanState({
				isPanning: true,
				startX: e.clientX,
				startY: e.clientY,
			});
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!panState.isPanning) return;
			const dx = e.clientX - panState.startX;
			const dy = e.clientY - panState.startY;
			if (dx !== 0 || dy !== 0) {
				pan(dx, dy);
				setPanState({
					isPanning: true,
					startX: e.clientX,
					startY: e.clientY,
				});
			}
		};

		const handleMouseUp = () => {
			setPanState({
				isPanning: false,
				startX: 0,
				startY: 0,
			});
		};

		canvas.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			canvas.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [canvasRef, currentTool, panState, pan]);

	// Custom render function with selection
	const renderWithSelection = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			// Render elements
			const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
			for (const element of sortedElements) {
				// Skip rendering selected elements (they'll be rendered with highlights)
				if (selection.selectedIds.has(element.id)) continue;
				ctx.save();
				ctx.translate(viewport.offsetX, viewport.offsetY);
				ctx.scale(viewport.zoom, viewport.zoom);

				// Simple element rendering (for selected elements, skip)
				switch (element.type) {
					case "rectangle":
						drawSimpleRectangle(ctx, element);
						break;
					case "circle":
						drawSimpleCircle(ctx, element);
						break;
					case "line":
						drawSimpleLine(ctx, element);
						break;
					case "arrow":
						drawSimpleArrow(ctx, element);
						break;
					case "pen":
						drawSimplePen(ctx, element);
						break;
					case "text":
						drawSimpleText(ctx, element);
						break;
				}

				ctx.restore();
			}

			// Render preview element
			if (drawingState.previewElement) {
				ctx.save();
				ctx.translate(viewport.offsetX, viewport.offsetY);
				ctx.scale(viewport.zoom, viewport.zoom);
				renderPreviewElement(ctx, drawingState.previewElement);
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

	// Setup render loop with custom render
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
}

/** Simple rectangle rendering for selection */
function drawSimpleRectangle(
	ctx: CanvasRenderingContext2D,
	element: Element,
): void {
	const { x, y, width = 0, height = 0 } = element;

	ctx.beginPath();
	ctx.rect(x, y, width, height);

	if (element.fillColor && element.fillColor !== "transparent") {
		ctx.fillStyle = element.fillColor;
		ctx.globalAlpha = element.opacity;
		ctx.fill();
	}

	ctx.strokeStyle = element.strokeColor;
	ctx.lineWidth = element.strokeWidth;
	ctx.globalAlpha = element.opacity;
	ctx.stroke();
}

/** Simple circle rendering for selection */
function drawSimpleCircle(
	ctx: CanvasRenderingContext2D,
	element: Element,
): void {
	const { x, y, width = 0, height = 0 } = element;
	const centerX = x + width / 2;
	const centerY = y + height / 2;
	const radiusX = width / 2;
	const radiusY = height / 2;

	ctx.beginPath();
	ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

	if (element.fillColor && element.fillColor !== "transparent") {
		ctx.fillStyle = element.fillColor;
		ctx.globalAlpha = element.opacity;
		ctx.fill();
	}

	ctx.strokeStyle = element.strokeColor;
	ctx.lineWidth = element.strokeWidth;
	ctx.globalAlpha = element.opacity;
	ctx.stroke();
}

/** Simple line rendering for selection */
function drawSimpleLine(ctx: CanvasRenderingContext2D, element: Element): void {
	const { x, y, width = 0, height = 0 } = element;

	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + width, y + height);

	ctx.strokeStyle = element.strokeColor;
	ctx.lineWidth = element.strokeWidth;
	ctx.globalAlpha = element.opacity;
	ctx.stroke();
}

/** Simple arrow rendering for selection */
function drawSimpleArrow(
	ctx: CanvasRenderingContext2D,
	element: Element,
): void {
	const { x, y, width = 0, height = 0 } = element;
	const endX = x + width;
	const endY = y + height;

	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(endX, endY);
	ctx.strokeStyle = element.strokeColor;
	ctx.lineWidth = element.strokeWidth;
	ctx.globalAlpha = element.opacity;
	ctx.stroke();

	const angle = Math.atan2(height, width);
	const headLength = 15;

	ctx.beginPath();
	ctx.moveTo(endX, endY);
	ctx.lineTo(
		endX - headLength * Math.cos(angle - Math.PI / 6),
		endY - headLength * Math.sin(angle - Math.PI / 6),
	);
	ctx.moveTo(endX, endY);
	ctx.lineTo(
		endX - headLength * Math.cos(angle + Math.PI / 6),
		endY - headLength * Math.sin(angle + Math.PI / 6),
	);
	ctx.stroke();
}

/** Simple pen rendering for selection */
function drawSimplePen(ctx: CanvasRenderingContext2D, element: Element): void {
	const { points } = element;
	if (!points || points.length < 2) return;

	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);

	for (let i = 1; i < points.length; i++) {
		ctx.lineTo(points[i].x, points[i].y);
	}

	ctx.strokeStyle = element.strokeColor;
	ctx.lineWidth = element.strokeWidth;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.globalAlpha = element.opacity;
	ctx.stroke();
}

/** Simple text rendering for selection */
function drawSimpleText(ctx: CanvasRenderingContext2D, element: Element): void {
	const { x, y, text, fontSize = 16 } = element;
	if (!text) return;

	ctx.font = `${fontSize}px sans-serif`;
	ctx.fillStyle = element.strokeColor;
	ctx.globalAlpha = element.opacity;
	ctx.fillText(text, x, y + fontSize);
}

/** Render preview element during drawing */
function renderPreviewElement(
	ctx: CanvasRenderingContext2D,
	element: Element,
): void {
	switch (element.type) {
		case "rectangle":
			drawSimpleRectangle(ctx, element);
			break;
		case "circle":
			drawSimpleCircle(ctx, element);
			break;
		case "line":
			drawSimpleLine(ctx, element);
			break;
		case "arrow":
			drawSimpleArrow(ctx, element);
			break;
		case "pen":
			drawSimplePen(ctx, element);
			break;
		case "text":
			drawSimpleText(ctx, element);
			break;
	}
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

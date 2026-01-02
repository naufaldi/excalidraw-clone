/**
 * Hook for canvas drawing state management
 */

import { useCallback, useState } from "react";
import type { Element, ElementType, Point } from "../../lib/database/shared/types.js";
import {
	DEFAULT_DRAWING_STATE,
	type DrawingState,
	createPreviewElement,
	createFinalElement,
	createPenPreviewElement,
	createTextElement,
	generateElementId,
} from "../../lib/canvas/index.js";

interface UseDrawingOptions {
	currentTool: ElementType;
	strokeWidth: number;
	strokeColor: string;
	fillColor: string;
	elementsCount: number;
	onElementCreate?: (element: Element) => void;
}

interface UseDrawingReturn {
	drawingState: DrawingState;
	handleDrawingStart: (point: Point) => void;
	handleDrawingMove: (point: Point) => void;
	handleDrawingEnd: (point: Point) => void;
	syncDrawingState: () => void;
}

/**
 * Manages drawing state and handlers for shape/pen/text creation
 */
export function useDrawing({
	currentTool,
	strokeWidth,
	strokeColor,
	fillColor,
	elementsCount,
	onElementCreate,
}: UseDrawingOptions): UseDrawingReturn {
	const [drawingState, setDrawingState] = useState<DrawingState>({
		...DEFAULT_DRAWING_STATE,
		currentTool,
		strokeWidth,
		strokeColor,
		fillColor,
	});

	// Sync drawing state with props
	const syncDrawingState = useCallback(() => {
		setDrawingState((prev) => {
			if (
				prev.currentTool !== currentTool ||
				prev.strokeWidth !== strokeWidth ||
				prev.strokeColor !== strokeColor ||
				prev.fillColor !== fillColor
			) {
				return {
					...prev,
					currentTool,
					strokeWidth,
					strokeColor,
					fillColor,
				};
			}
			return prev;
		});
	}, [currentTool, strokeWidth, strokeColor, fillColor]);

	const handleDrawingStart = useCallback(
		(point: Point) => {
			if (currentTool === "pen") {
				const penElement = createPenPreviewElement(
					point,
					strokeColor,
					fillColor,
					strokeWidth,
				);
				setDrawingState((prev) => ({
					...prev,
					isDrawing: true,
					startPoint: point,
					previewElement: penElement,
				}));
			} else if (currentTool === "text") {
				const textElement = createTextElement(point, elementsCount);
				if (onElementCreate) {
					onElementCreate(textElement);
				}
			} else {
				setDrawingState((prev) => ({
					...prev,
					isDrawing: true,
					startPoint: point,
					previewElement: createPreviewElement(
						currentTool,
						point,
						point,
						strokeColor,
						fillColor,
						strokeWidth,
					),
				}));
			}
		},
		[currentTool, strokeColor, fillColor, strokeWidth, elementsCount, onElementCreate],
	);

	const handleDrawingMove = useCallback(
		(point: Point) => {
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
				}

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
			});
		},
		[],
	);

	const handleDrawingEnd = useCallback(
		(point: Point) => {
			if (!drawingState.isDrawing || !drawingState.startPoint) {
				return;
			}

			let elementToCreate: Element | null = null;

			if (
				drawingState.currentTool === "pen" &&
				drawingState.previewElement &&
				drawingState.previewElement.points
			) {
				if (drawingState.previewElement.points.length > 1) {
					elementToCreate = {
						...drawingState.previewElement,
						id: generateElementId(),
						points: drawingState.previewElement.points,
						createdAt: new Date(),
						updatedAt: new Date(),
					};
				}
			} else {
				elementToCreate = createFinalElement(
					drawingState.currentTool,
					drawingState.startPoint,
					point,
					elementsCount,
					drawingState.strokeColor,
					drawingState.fillColor,
					drawingState.strokeWidth,
				);
			}

			// Reset drawing state
			setDrawingState((prev) => ({
				...prev,
				isDrawing: false,
				startPoint: null,
				previewElement: null,
			}));

			// Call onElementCreate after reading state
			if (elementToCreate && onElementCreate) {
				onElementCreate(elementToCreate);
			}
		},
		[drawingState, elementsCount, onElementCreate],
	);

	return {
		drawingState,
		handleDrawingStart,
		handleDrawingMove,
		handleDrawingEnd,
		syncDrawingState,
	};
}

/**
 * Hook for canvas mouse/touch event handling
 */

import { type RefObject, useEffect, useRef } from "react";
import type { Viewport } from "../../lib/canvas/types.js";
import {
	getMousePosition,
	getTouchPosition,
	screenToCanvas,
} from "../../lib/canvas/utils.js";
import type { Point } from "../../lib/database/shared/types.js";

interface UseCanvasEventsOptions {
	canvasRef: RefObject<HTMLCanvasElement | null>;
	viewport: Viewport;
	onDrawStart: (point: Point) => void;
	onDrawMove: (point: Point) => void;
	onDrawEnd: (point: Point) => void;
	enabled?: boolean;
}

/**
 * Handles mouse and touch events for canvas drawing
 */
export function useCanvasEvents({
	canvasRef,
	viewport,
	onDrawStart,
	onDrawMove,
	onDrawEnd,
	enabled = true,
}: UseCanvasEventsOptions): void {
	const isDrawingRef = useRef(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !enabled) return;

		const handleMouseDown = (e: MouseEvent) => {
			if (e.button !== 0) return; // Only left click
			isDrawingRef.current = true;
			const screenPos = getMousePosition(e, canvas);
			const canvasPos = screenToCanvas(screenPos.x, screenPos.y, viewport);
			onDrawStart(canvasPos);
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!isDrawingRef.current) return;
			const screenPos = getMousePosition(e, canvas);
			const canvasPos = screenToCanvas(screenPos.x, screenPos.y, viewport);
			onDrawMove(canvasPos);
		};

		const handleMouseUp = (e: MouseEvent) => {
			if (!isDrawingRef.current) return;
			isDrawingRef.current = false;
			const screenPos = getMousePosition(e, canvas);
			const canvasPos = screenToCanvas(screenPos.x, screenPos.y, viewport);
			onDrawEnd(canvasPos);
		};

		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches.length !== 1) return;
			e.preventDefault();
			isDrawingRef.current = true;
			const screenPos = getTouchPosition(e.touches[0], canvas);
			const canvasPos = screenToCanvas(screenPos.x, screenPos.y, viewport);
			onDrawStart(canvasPos);
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (!isDrawingRef.current || e.touches.length !== 1) return;
			e.preventDefault();
			const screenPos = getTouchPosition(e.touches[0], canvas);
			const canvasPos = screenToCanvas(screenPos.x, screenPos.y, viewport);
			onDrawMove(canvasPos);
		};

		const handleTouchEnd = (e: TouchEvent) => {
			if (!isDrawingRef.current) return;
			e.preventDefault();
			isDrawingRef.current = false;
			// Use last known position from changedTouches
			if (e.changedTouches.length > 0) {
				const screenPos = getTouchPosition(e.changedTouches[0], canvas);
				const canvasPos = screenToCanvas(screenPos.x, screenPos.y, viewport);
				onDrawEnd(canvasPos);
			}
		};

		// Mouse events
		canvas.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		// Touch events
		canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
		canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
		canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

		return () => {
			canvas.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
			canvas.removeEventListener("touchstart", handleTouchStart);
			canvas.removeEventListener("touchmove", handleTouchMove);
			canvas.removeEventListener("touchend", handleTouchEnd);
		};
	}, [canvasRef, viewport, onDrawStart, onDrawMove, onDrawEnd, enabled]);
}

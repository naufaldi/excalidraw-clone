/**
 * Hook for requestAnimationFrame render loop
 */

import { useEffect, useRef } from "react";
import {
	clearCanvas,
	renderElement,
	renderElements,
} from "../../lib/canvas/renderer.js";
import type { Viewport } from "../../lib/canvas/types.js";
import type { Element } from "../../lib/database/shared/types.js";

interface UseDrawLoopOptions {
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	elements: Element[];
	viewport: Viewport;
	previewElement: Element | null;
}

/**
 * Manages the canvas render loop using requestAnimationFrame
 */
export function useDrawLoop({
	canvasRef,
	elements,
	viewport,
	previewElement,
}: UseDrawLoopOptions): void {
	const frameRef = useRef<number | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;

		const render = () => {
			// Clear canvas
			clearCanvas(ctx, canvas.width, canvas.height);

			// Draw background
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Render all elements
			renderElements(ctx, elements, viewport);

			// Render preview element (if drawing)
			if (previewElement) {
				ctx.save();
				ctx.translate(viewport.offsetX, viewport.offsetY);
				ctx.scale(viewport.zoom, viewport.zoom);
				ctx.globalAlpha = 0.6;
				renderElement(ctx, previewElement);
				ctx.restore();
			}

			frameRef.current = requestAnimationFrame(render);
		};

		frameRef.current = requestAnimationFrame(render);

		return () => {
			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current);
			}
		};
	}, [canvasRef, elements, viewport, previewElement]);
}

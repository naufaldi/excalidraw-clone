/**
 * Hook for viewport state management (pan/zoom)
 */

import { useCallback, useState } from "react";
import { DEFAULT_VIEWPORT, type Viewport } from "../../lib/canvas/types.js";

interface UseViewportReturn {
	viewport: Viewport;
	pan: (dx: number, dy: number) => void;
	zoom: (factor: number, centerX: number, centerY: number) => void;
	reset: () => void;
	setViewport: (viewport: Viewport) => void;
}

/**
 * Manages viewport state for canvas pan/zoom
 */
export function useViewport(
	initialViewport?: Partial<Viewport>,
): UseViewportReturn {
	const [viewport, setViewport] = useState<Viewport>({
		...DEFAULT_VIEWPORT,
		...initialViewport,
	});

	const pan = useCallback((dx: number, dy: number) => {
		setViewport((prev) => ({
			...prev,
			offsetX: prev.offsetX + dx,
			offsetY: prev.offsetY + dy,
		}));
	}, []);

	const zoom = useCallback(
		(factor: number, centerX: number, centerY: number) => {
			setViewport((prev) => {
				const newZoom = Math.max(0.1, Math.min(5, prev.zoom * factor));
				const zoomRatio = newZoom / prev.zoom;

				return {
					zoom: newZoom,
					offsetX: centerX - (centerX - prev.offsetX) * zoomRatio,
					offsetY: centerY - (centerY - prev.offsetY) * zoomRatio,
				};
			});
		},
		[],
	);

	const reset = useCallback(() => {
		setViewport(DEFAULT_VIEWPORT);
	}, []);

	return { viewport, pan, zoom, reset, setViewport };
}

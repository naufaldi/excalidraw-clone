/**
 * Hook for canvas pan tool state management
 */

import { type RefObject, useCallback, useEffect, useState } from "react";

interface UsePanOptions {
	canvasRef: RefObject<HTMLCanvasElement | null>;
	enabled: boolean;
	onPan: (dx: number, dy: number) => void;
}

interface PanState {
	isPanning: boolean;
	startX: number;
	startY: number;
}

/**
 * Manages pan tool state and mouse event handlers
 */
export function usePan({
	canvasRef,
	enabled,
	onPan,
}: UsePanOptions): { isPanning: boolean } {
	const [panState, setPanState] = useState<PanState>({
		isPanning: false,
		startX: 0,
		startY: 0,
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !enabled) return;

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
				onPan(dx, dy);
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
	}, [canvasRef, enabled, panState, onPan]);

	return { isPanning: panState.isPanning };
}

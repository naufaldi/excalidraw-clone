/**
 * Hook for tracking canvas/window size
 */

import { useEffect, useState } from "react";

interface CanvasSize {
	width: number;
	height: number;
}

/**
 * Returns current window dimensions and updates on resize
 */
export function useCanvasSize(): CanvasSize {
	const [size, setSize] = useState<CanvasSize>(() => ({
		width: typeof window !== "undefined" ? window.innerWidth : 800,
		height: typeof window !== "undefined" ? window.innerHeight : 600,
	}));

	useEffect(() => {
		const handleResize = () => {
			setSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener("resize", handleResize);
		// Initial size
		handleResize();

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return size;
}

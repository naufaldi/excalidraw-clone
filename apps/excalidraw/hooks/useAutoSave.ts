/**
 * Auto-save hook for canvas elements
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Element } from "../lib/database/shared/types.js";

interface UseAutoSaveOptions {
	boardId: string;
	elements: Element[];
	onSave?: () => void;
	onError?: (error: Error) => void;
	interval?: number;
}

interface UseAutoSaveReturn {
	saveStatus: "idle" | "saving" | "saved" | "error";
	lastSaved: Date | null;
	forceSave: () => void;
}

/**
 * Auto-save elements to IndexedDB with debouncing
 */
export function useAutoSave({
	boardId,
	elements,
	onSave,
	onError,
	interval = 2000,
}: UseAutoSaveOptions): UseAutoSaveReturn {
	const [saveStatus, setSaveStatus] = useState<
		"idle" | "saving" | "saved" | "error"
	>("idle");
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const timeoutRef = useRef<number | null>(null);
	const pendingSaveRef = useRef<Element[] | null>(null);

	// Save function
	const saveElements = useCallback(
		async (elementsToSave: Element[]) => {
			setSaveStatus("saving");

			try {
				// Dynamic import to avoid circular dependencies
				const { updateBoard, getBoardByIdQuery } = await import(
					"#lib/database/index.js"
				);

				// Get current board to preserve other properties
				const board = await getBoardByIdQuery(boardId);
				if (board) {
					await updateBoard(boardId, { elements: elementsToSave });
					setLastSaved(new Date());
					setSaveStatus("saved");
					onSave?.();
				}
			} catch (error) {
				console.error("Auto-save failed:", error);
				setSaveStatus("error");
				if (onError) {
					onError(error instanceof Error ? error : new Error(String(error)));
				}
			}
		},
		[boardId, onSave, onError],
	);

	// Debounced save trigger
	const triggerSave = useCallback(
		(newElements: Element[]) => {
			// Clear pending timeout
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current);
			}

			// Set pending elements
			pendingSaveRef.current = newElements;

			// Set timeout for auto-save
			timeoutRef.current = window.setTimeout(async () => {
				if (pendingSaveRef.current) {
					await saveElements(pendingSaveRef.current);
					pendingSaveRef.current = null;
				}
			}, interval);
		},
		[interval, saveElements],
	);

	// Effect to trigger save when elements change
	useEffect(() => {
		if (elements.length === 0) return;
		triggerSave(elements);
	}, [elements]);

	// Force save function
	const forceSave = useCallback(async () => {
		// Clear pending timeout
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		// Get current elements to save
		const elementsToSave = pendingSaveRef.current ?? elements;

		if (elementsToSave.length > 0) {
			await saveElements(elementsToSave);
			pendingSaveRef.current = null;
		}
	}, [elements, saveElements]);

	// Page unload handler - save immediately
	useEffect(() => {
		const handleBeforeUnload = () => {
			// Try to save any pending changes
			// Note: IndexedDB operations are async and might not complete before unload
			// but this is the best we can do without a backend server (V1)
			if (pendingSaveRef.current) {
				void forceSave();
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [forceSave]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return {
		saveStatus,
		lastSaved,
		forceSave,
	};
}

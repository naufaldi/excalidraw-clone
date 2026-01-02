/**
 * Undo/Redo hook for canvas elements
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Element } from "../lib/database/shared/types.js";

/** Command interface for undo/redo */
interface Command {
	type: "create" | "delete" | "update";
	element?: Element;
	elementId?: string;
	previousState?: Partial<Element>;
	newState?: Partial<Element>;
}

interface UseUndoRedoOptions {
	elements: Element[];
	maxHistory?: number;
	onUndo?: (elements: Element[]) => void;
	onRedo?: (elements: Element[]) => void;
}

interface UseUndoRedoReturn {
	elements: Element[];
	undo: () => void;
	redo: () => void;
	canUndo: boolean;
	canRedo: boolean;
	historyCount: number;
	executeCreate: (element: Element) => void;
	executeDelete: (elementId: string) => void;
	executeUpdate: (elementId: string, updates: Partial<Element>) => void;
	clearHistory: () => void;
}

/**
 * Undo/Redo hook with simplified command pattern
 */
export function useUndoRedo({
	elements: initialElements,
	maxHistory = 50,
	onUndo,
	onRedo,
}: UseUndoRedoOptions): UseUndoRedoReturn {
	const [elements, setElements] = useState<Element[]>(initialElements);
	const [history, setHistory] = useState<Command[]>([]);
	const [future, setFuture] = useState<Command[]>([]);
	const currentElementsRef = useRef<Element[]>(initialElements);

	// Update ref when elements change
	useEffect(() => {
		currentElementsRef.current = elements;
	}, [elements]);

	// Execute create command
	const executeCreate = useCallback((element: Element) => {
		const command: Command = { type: "create", element };
		execute(command);
	}, []);

	// Execute delete command
	const executeDelete = useCallback((elementId: string) => {
		const element = currentElementsRef.current.find(
			(el) => el.id === elementId,
		);
		if (!element) return;

		const command: Command = { type: "delete", element: { ...element } };
		execute(command);
	}, []);

	// Execute update command
	const executeUpdate = useCallback(
		(elementId: string, updates: Partial<Element>) => {
			const element = currentElementsRef.current.find(
				(el) => el.id === elementId,
			);
			if (!element) return;

			const command: Command = {
				type: "update",
				elementId,
				previousState: {},
				newState: updates,
			};
			for (const key of Object.keys(updates) as (keyof Element)[]) {
				(command.previousState as any)[key] = element[key];
			}
			execute(command);
		},
		[],
	);

	// Main execute function
	const execute = useCallback(
		(command: Command) => {
			const currentElements = currentElementsRef.current;
			let newElements: Element[];

			switch (command.type) {
				case "create":
					if (!command.element) return;
					newElements = [...currentElements, command.element];
					break;
				case "delete":
					if (!command.element) return;
					newElements = currentElements.filter(
						(el) => el.id !== command.element!.id,
					);
					break;
				case "update":
					if (!command.elementId || !command.newState) return;
					newElements = currentElements.map((el) =>
						el.id === command.elementId ? { ...el, ...command.newState } : el,
					);
					break;
				default:
					return;
			}

			setHistory((prev) => {
				const newHistory = [...prev, command];
				if (newHistory.length > maxHistory) {
					return newHistory.slice(-maxHistory);
				}
				return newHistory;
			});
			setFuture([]);

			currentElementsRef.current = newElements;
			setElements(newElements);
		},
		[maxHistory],
	);

	// Undo
	const undo = useCallback(() => {
		if (history.length === 0) return;

		const newHistory = [...history];
		const command = newHistory.pop()!;
		const currentElements = currentElementsRef.current;
		let newElements: Element[];

		switch (command.type) {
			case "create":
				// Undo create = delete the element
				if (!command.element) return;
				newElements = currentElements.filter(
					(el) => el.id !== command.element!.id,
				);
				break;
			case "delete":
				// Undo delete = restore the element
				if (!command.element) return;
				newElements = [...currentElements, command.element];
				break;
			case "update":
				// Undo update = restore previous state
				if (!command.elementId || !command.previousState) return;
				newElements = currentElements.map((el) =>
					el.id === command.elementId
						? { ...el, ...command.previousState }
						: el,
				);
				break;
			default:
				return;
		}

		setFuture((prev) => [...prev, command]);
		setHistory(newHistory);

		currentElementsRef.current = newElements;
		setElements(newElements);

		onUndo?.(newElements);
	}, [history, onUndo]);

	// Redo
	const redo = useCallback(() => {
		if (future.length === 0) return;

		const newFuture = [...future];
		const command = newFuture.pop()!;
		const currentElements = currentElementsRef.current;
		let newElements: Element[];

		switch (command.type) {
			case "create":
				// Redo create = add the element back
				if (!command.element) return;
				newElements = [...currentElements, command.element];
				break;
			case "delete":
				// Redo delete = remove the element again
				if (!command.element) return;
				newElements = currentElements.filter(
					(el) => el.id !== command.element!.id,
				);
				break;
			case "update":
				// Redo update = apply new state again
				if (!command.elementId || !command.newState) return;
				newElements = currentElements.map((el) =>
					el.id === command.elementId ? { ...el, ...command.newState } : el,
				);
				break;
			default:
				return;
		}

		setHistory((prev) => [...prev, command]);
		setFuture(newFuture);

		currentElementsRef.current = newElements;
		setElements(newElements);

		onRedo?.(newElements);
	}, [future, onRedo]);

	// Clear history
	const clearHistory = useCallback(() => {
		setHistory([]);
		setFuture([]);
	}, []);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "z") {
				e.preventDefault();
				if (e.shiftKey) {
					redo();
				} else {
					undo();
				}
			} else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
				e.preventDefault();
				redo();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [undo, redo]);

	return {
		elements,
		undo,
		redo,
		canUndo: history.length > 0,
		canRedo: future.length > 0,
		historyCount: history.length,
		executeCreate,
		executeDelete,
		executeUpdate,
		clearHistory,
	};
}

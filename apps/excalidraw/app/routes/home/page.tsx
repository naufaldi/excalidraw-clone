import { useCallback, useEffect, useState } from "react";
import { Canvas } from "@/components/canvas/index.js";
import { CanvasToolbar, type Tool } from "@repo/shared-ui/components";
import {
	addElementToBoard,
	createBoard,
	createLiveBoardQuery,
	deleteElementFromBoard,
	deleteMultipleElementsFromBoard,
	getBoardByIdQuery,
	initializeDatabase,
	updateMultipleElementsInBoard,
} from "#lib/database/index.js";
import { useAutoSave } from "#hooks/useAutoSave.js";
import { useKeyboardShortcuts } from "#hooks/useKeyboardShortcuts.js";
import type { Element } from "#lib/database/shared/types.js";
import type { Route } from "./+types/page";

export function meta(_props: Route.MetaArgs) {
	return [
		{ title: "Excalidraw Clone" },
		{ name: "description", content: "Offline-first collaborative whiteboard" },
	];
}

const DEFAULT_BOARD_ID = "default-board";

export default function Page() {
	const [elements, setElements] = useState<Element[]>([]);
	const [currentTool, setCurrentTool] = useState<Tool>("rectangle");
	const [strokeWidth, setStrokeWidth] = useState(2);
	const [strokeColor, setStrokeColor] = useState("var(--stroke-primary)");
	const [fillColor, setFillColor] = useState("var(--fill-transparent)");
	const [isReady, setIsReady] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	// Initialize database and subscribe to board
	useEffect(() => {
		let subscription: { unsubscribe: () => void } | null = null;

		async function init() {
			try {
				await initializeDatabase();

				// Check if board exists, create if not
				const existingBoard = await getBoardByIdQuery(DEFAULT_BOARD_ID);
				if (!existingBoard) {
					await createBoard({
						id: DEFAULT_BOARD_ID,
						name: "My Whiteboard",
					});
				}

				// Subscribe to live board updates
				const boardObservable = createLiveBoardQuery(DEFAULT_BOARD_ID);
				subscription = boardObservable.subscribe({
					next: (board) => {
						if (board) {
							const newElements = board.elements || [];
							// Only update state if elements actually changed (by comparing IDs and length)
							setElements((prevElements) => {
								if (prevElements.length !== newElements.length) {
									console.log(
										"[Page] Elements changed: length",
										prevElements.length,
										"->",
										newElements.length,
									);
									return newElements;
								}
								// Quick check: compare IDs to see if array changed
								const prevIds = prevElements.map((el) => el.id).join(",");
								const newIds = newElements
									.map((el: Element) => el.id)
									.join(",");
								if (prevIds !== newIds) {
									console.log("[Page] Elements changed: IDs differ");
									return newElements;
								}
								// No change, return previous array reference
								return prevElements;
							});
						}
						setIsReady(true);
					},
					error: (err: Error) => {
						console.error("Board subscription error:", err);
					},
				});
			} catch (err) {
				console.error("Failed to initialize database:", err);
				setError(err instanceof Error ? err.message : "Failed to initialize");
				// Still allow drawing without persistence
				setIsReady(true);
			}
		}

		init();

		return () => {
			subscription?.unsubscribe();
		};
	}, []);

	const handleElementCreate = useCallback(async (element: Element) => {
		// Note: No optimistic update needed - RxDB subscription handles state updates
		// This prevents double re-renders (one from optimistic update, one from subscription)
		try {
			await addElementToBoard(DEFAULT_BOARD_ID, element);
		} catch (err) {
			console.error("Failed to save element:", err);
		}
	}, []);

	const handleElementDelete = useCallback(async (elementId: string) => {
		// Note: No optimistic update needed - RxDB subscription handles state updates
		try {
			await deleteElementFromBoard(DEFAULT_BOARD_ID, elementId);
		} catch (err) {
			console.error("Failed to delete element:", err);
		}
	}, []);

	const handleSelectionChange = useCallback((ids: Set<string>) => {
		setSelectedIds(ids);
	}, []);

	const handleDeleteSelected = useCallback(async () => {
		if (selectedIds.size === 0) return;
		try {
			await deleteMultipleElementsFromBoard(
				DEFAULT_BOARD_ID,
				Array.from(selectedIds),
			);
			setSelectedIds(new Set());
		} catch (err) {
			console.error("Failed to delete selected elements:", err);
		}
	}, [selectedIds]);

	const handleClearSelection = useCallback(() => {
		setSelectedIds(new Set());
	}, []);

	const handleElementsMove = useCallback(async (movedElements: Element[]) => {
		if (movedElements.length === 0) return;
		try {
			const updates = movedElements.map((el) => ({
				id: el.id,
				updates: { x: el.x, y: el.y },
			}));
			await updateMultipleElementsInBoard(DEFAULT_BOARD_ID, updates);
		} catch (err) {
			console.error("Failed to move elements:", err);
		}
	}, []);

	// Keyboard shortcuts
	useKeyboardShortcuts({
		currentTool,
		onToolSelect: setCurrentTool,
		onDeleteSelected: handleDeleteSelected,
		onClearSelection: handleClearSelection,
		selectedIds,
	});

	// Auto-save
	const { saveStatus, lastSaved } = useAutoSave({
		boardId: DEFAULT_BOARD_ID,
		elements,
	});

	if (!isReady) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100vh",
					fontFamily: "system-ui, sans-serif",
				}}
			>
				Loading...
			</div>
		);
	}

	return (
		<div
			style={{
				position: "relative",
				width: "100vw",
				height: "100vh",
				overflow: "hidden",
			}}
		>
			{/* Enhanced Toolbar */}
			<div
				style={{
					position: "absolute",
					top: 16,
					left: "50%",
					transform: "translateX(-50%)",
					zIndex: 100,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 8,
				}}
			>
				<CanvasToolbar
					selectedTool={currentTool}
					strokeWidth={strokeWidth}
					strokeColor={strokeColor}
					fillColor={fillColor}
					onToolSelect={setCurrentTool}
					onStrokeWidthChange={setStrokeWidth}
					onStrokeColorChange={setStrokeColor}
					onFillColorChange={setFillColor}
					orientation="horizontal"
				/>
				{/* Save status indicator */}
				<div
					style={{
						fontSize: 12,
						color:
							saveStatus === "saved"
								? "#22c55e"
								: saveStatus === "saving"
									? "#f59e0b"
									: saveStatus === "error"
										? "#ef4444"
										: "#6b7280",
						display: "flex",
						alignItems: "center",
						gap: 4,
					}}
				>
					{saveStatus === "idle" && "All changes saved"}
					{saveStatus === "saving" && "Saving..."}
					{saveStatus === "saved" && "Saved"}
					{saveStatus === "error" && "Save failed"}
					{lastSaved && saveStatus === "saved" && (
						<span style={{ opacity: 0.7 }}>
							{lastSaved.toLocaleTimeString()}
						</span>
					)}
				</div>
			</div>

			{/* Error banner */}
			{error && (
				<div
					style={{
						position: "absolute",
						top: 80,
						left: "50%",
						transform: "translateX(-50%)",
						padding: "8px 16px",
						backgroundColor: "#fee",
						color: "#c00",
						borderRadius: 4,
						fontSize: 14,
						zIndex: 100,
					}}
				>
					{error} (drawing without persistence)
				</div>
			)}

			{/* Canvas */}
			<Canvas
				elements={elements}
				currentTool={currentTool}
				strokeWidth={strokeWidth}
				strokeColor={strokeColor}
				fillColor={fillColor}
				onElementCreate={handleElementCreate}
				onElementDelete={handleElementDelete}
				onSelectionChange={handleSelectionChange}
				onElementsMove={handleElementsMove}
			/>
		</div>
	);
}

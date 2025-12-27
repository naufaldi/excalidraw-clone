import { useCallback, useEffect, useState } from "react";
import { Canvas } from "@/components/canvas/index.js";
import { CanvasToolbar, type Tool } from "@repo/shared-ui/components";
import {
  addElementToBoard,
  createBoard,
  createLiveBoardQuery,
  getBoardByIdQuery,
  initializeDatabase,
} from "#lib/database/index.js";
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
              setElements(board.elements || []);
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
    // Optimistic update
    setElements((prev) => [...prev, element]);

    try {
      await addElementToBoard(DEFAULT_BOARD_ID, element);
    } catch (err) {
      console.error("Failed to save element:", err);
      // Element still visible due to optimistic update
    }
  }, []);

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
      />
    </div>
  );
}

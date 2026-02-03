/**
 * Keyboard shortcuts hook for whiteboard tools and operations
 */

import { useEffect, useRef } from "react";
import type { Tool } from "@repo/shared-ui/components";

interface KeyboardShortcutsOptions {
  currentTool: Tool;
  onToolSelect: (tool: Tool) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onDeleteSelected?: () => void;
  onClearSelection?: () => void;
  selectedIds: Set<string>;
}

/**
 * Hook to handle keyboard shortcuts for tool switching and operations
 */
export function useKeyboardShortcuts({
  currentTool,
  onToolSelect,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onDeleteSelected,
  onClearSelection,
  selectedIds,
}: KeyboardShortcutsOptions): void {
  const isSpacePressedRef = useRef(false);

  // Tool shortcuts mapping
  const TOOL_SHORTCUTS: Record<string, Tool> = {
    v: "selection",
    p: "pen",
    r: "rectangle",
    o: "circle",
    l: "line",
    a: "arrow",
    t: "text",
    e: "eraser",
    " ": "hand", // Space
  };

  // Handle space bar for pan tool (hold to pan)
  useEffect(() => {
    // Check if user is typing in a text input or editable element
    const isTextInput = (target: EventTarget | null): boolean => {
      const element = target as HTMLElement;
      if (!element || !element.tagName) return false;
      return (
        element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.isContentEditable
      );
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in text inputs
      if (isTextInput(e.target)) return;

      // Handle space bar for pan tool
      if (e.key === " ") {
        e.preventDefault();
        if (!isSpacePressedRef.current) {
          isSpacePressedRef.current = true;
          if (currentTool !== "hand") {
            onToolSelect("hand");
          }
        }
        return;
      }

      // Tool shortcuts (single key, no modifiers)
      const key = e.key.toLowerCase();
      if (TOOL_SHORTCUTS[key] && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        onToolSelect(TOOL_SHORTCUTS[key]);
        return;
      }

      // Operation shortcuts with modifiers
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          // Ctrl/Cmd+Shift+Z = Redo
          onRedo?.();
        } else {
          // Ctrl/Cmd+Z = Undo
          onUndo?.();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        // Ctrl/Cmd+Y = Redo
        onRedo?.();
        return;
      }

      // Layer shortcuts (z-index)
      // Note: Depending on keyboard layout, Shift+[/] may report "{" / "}" as e.key.
      const isMod = e.ctrlKey || e.metaKey;
      const isRightBracket = e.key === "]" || e.key === "}";
      const isLeftBracket = e.key === "[" || e.key === "{";

      if (isMod && isRightBracket) {
        if (e.shiftKey && selectedIds.size > 0) {
          e.preventDefault();
          onBringToFront?.();
          return;
        }
        if (!e.shiftKey && selectedIds.size === 1) {
          e.preventDefault();
          onBringForward?.();
          return;
        }
      }

      if (isMod && isLeftBracket) {
        if (e.shiftKey && selectedIds.size > 0) {
          e.preventDefault();
          onSendToBack?.();
          return;
        }
        if (!e.shiftKey && selectedIds.size === 1) {
          e.preventDefault();
          onSendBackward?.();
          return;
        }
      }

      // Copy selected  elements
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedIds.size > 0) {
        e.preventDefault();
        onCopy?.();
        return;
      }

      // Paste elements
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        onPaste?.();
        return;
      }

      // Duplicate selected elements
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && selectedIds.size > 0) {
        e.preventDefault();
        onDuplicate?.();
        return;
      }

      // Delete selected elements
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.size > 0) {
        e.preventDefault();
        onDeleteSelected?.();
        return;
      }

      // Escape = Clear selection
      if (e.key === "Escape") {
        e.preventDefault();
        onClearSelection?.();
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Handle space bar release - restore previous tool
      if (e.key === " ") {
        e.preventDefault();
        if (isSpacePressedRef.current) {
          isSpacePressedRef.current = false;
          // Restore the tool that was active before space was pressed
          // For now, we'll restore to "selection" as the default
          // In a real implementation, we'd track the previous tool
          if (currentTool === "hand") {
            onToolSelect("selection");
          }
        }
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    currentTool,
    onToolSelect,
    onUndo,
    onRedo,
    onCopy,
    onPaste,
    onDuplicate,
    onBringToFront,
    onSendToBack,
    onBringForward,
    onSendBackward,
    onDeleteSelected,
    onClearSelection,
    selectedIds,
  ]);
}

/**
 * @file Transform Handles Hook
 * Manages resize and rotation state and interactions
 */

import { useCallback, useState } from "react";
import type { Element, Point } from "../../lib/database/shared/types.js";
import {
  calculateResizeBounds,
  calculateRotation,
  canTransform,
  getHandleAtPoint,
  type Bounds,
  type HandleType,
  type TransformResult,
} from "../../lib/canvas/transform-utils.js";

interface UseTransformHandlesOptions {
  elements: Element[];
  selectedIds: Set<string>;
  onElementsTransform?: (transformedElements: Element[]) => void;
}

interface TransformState {
  isTransforming: boolean;
  activeHandle: HandleType | null;
  originalBounds: Bounds | null;
  previewElement: Element | null;
  startPoint: Point | null;
}

interface UseTransformHandlesReturn {
  transformState: TransformState;
  handleTransformStart: (point: Point) => boolean;
  handleTransformMove: (point: Point, isShiftPressed: boolean) => void;
  handleTransformEnd: () => void;
  getTransformCursor: (point: Point) => string | null;
}

const DEFAULT_TRANSFORM_STATE: TransformState = {
  isTransforming: false,
  activeHandle: null,
  originalBounds: null,
  previewElement: null,
  startPoint: null,
};

/**
 * Hook for managing transform handles (resize/rotate)
 * Only active when a single element is selected
 */
export function useTransformHandles({
  elements,
  selectedIds,
  onElementsTransform,
}: UseTransformHandlesOptions): UseTransformHandlesReturn {
  const [transformState, setTransformState] = useState<TransformState>(DEFAULT_TRANSFORM_STATE);

  /**
   * Get the selected element if exactly one is selected and transformable
   */
  const getSelectedElement = useCallback((): Element | null => {
    if (selectedIds.size !== 1) return null;

    const selectedId = Array.from(selectedIds)[0];
    const element = elements.find((el) => el.id === selectedId);

    if (!element || !canTransform(element)) return null;

    return element;
  }, [elements, selectedIds]);

  /**
   * Get cursor style based on mouse position over handles
   */
  const getTransformCursor = useCallback(
    (point: Point): string | null => {
      const element = getSelectedElement();
      if (!element) return null;

      const handle = getHandleAtPoint(element, point);
      if (!handle) return null;

      // Return cursor style from transform-utils
      const cursors: Record<HandleType, string> = {
        nw: "nwse-resize",
        ne: "nesw-resize",
        se: "nwse-resize",
        sw: "nesw-resize",
        n: "ns-resize",
        s: "ns-resize",
        e: "ew-resize",
        w: "ew-resize",
        rotate: "grab",
      };

      return cursors[handle];
    },
    [getSelectedElement],
  );

  /**
   * Start transform operation
   * Returns true if transform started, false otherwise
   */
  const handleTransformStart = useCallback(
    (point: Point): boolean => {
      const element = getSelectedElement();
      if (!element) return false;

      const handle = getHandleAtPoint(element, point);
      if (!handle) return false;

      // Store original bounds for transform calculation
      const originalBounds: Bounds = {
        x: element.x,
        y: element.y,
        width: element.width || 0,
        height: element.height || 0,
      };

      setTransformState({
        isTransforming: true,
        activeHandle: handle,
        originalBounds,
        previewElement: { ...element }, // Clone for preview
        startPoint: point,
      });

      return true;
    },
    [getSelectedElement],
  );

  /**
   * Update transform preview during mouse move
   */
  const handleTransformMove = useCallback(
    (point: Point, isShiftPressed: boolean = false) => {
      if (!transformState.isTransforming || !transformState.originalBounds) {
        return;
      }

      const { activeHandle, originalBounds, startPoint, previewElement } = transformState;
      if (!activeHandle || !startPoint || !previewElement) return;

      // Calculate delta from start point
      const delta: Point = {
        x: point.x - startPoint.x,
        y: point.y - startPoint.y,
      };

      if (activeHandle === "rotate") {
        // Rotation mode
        const angle = calculateRotation(previewElement, point);
        setTransformState((prev) => ({
          ...prev,
          previewElement: prev.previewElement ? { ...prev.previewElement, angle } : null,
        }));
      } else {
        // Resize mode
        const result = calculateResizeBounds(originalBounds, activeHandle, delta, isShiftPressed);

        setTransformState((prev) => ({
          ...prev,
          previewElement: prev.previewElement
            ? {
                ...prev.previewElement,
                x: result.x,
                y: result.y,
                width: result.width,
                height: result.height,
              }
            : null,
        }));
      }
    },
    [transformState],
  );

  /**
   * Commit transform changes
   */
  const handleTransformEnd = useCallback(() => {
    if (!transformState.isTransforming || !transformState.previewElement || !onElementsTransform) {
      setTransformState(DEFAULT_TRANSFORM_STATE);
      return;
    }

    // Commit the transformed element
    onElementsTransform([transformState.previewElement]);

    // Reset state
    setTransformState(DEFAULT_TRANSFORM_STATE);
  }, [transformState, onElementsTransform]);

  return {
    transformState,
    handleTransformStart,
    handleTransformMove,
    handleTransformEnd,
    getTransformCursor,
  };
}

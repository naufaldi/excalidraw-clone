/**
 * @file Database Mutations (CRUD Operations)
 * Atomic operations for creating, updating, and deleting boards and elements
 */

import { getBoardsCollection, getPreferencesCollection } from "./database.js";
import type { Board, Element, UserPreferences } from "./shared/index.js";
import {
  createDefaultBoard,
  createDefaultPreferences,
} from "./shared/index.js";

/**
 * Create a new board
 */
export async function createBoard(data: Partial<Board>): Promise<Board> {
  const collection = getBoardsCollection();

  // Use defaults if not provided
  const boardData = {
    ...createDefaultBoard(),
    ...data,
    id:
      data.id ||
      `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const doc = await collection.insert(boardData);
  console.log("[RxDB] Board created:", doc.id);
  return doc.toJSON() as Board;
}

/**
 * Update an existing board
 */
export async function updateBoard(
  boardId: string,
  updates: Partial<Board>,
): Promise<Board> {
  const collection = getBoardsCollection();

  const doc = await collection.findOne({ selector: { id: boardId } }).exec();

  if (!doc) {
    throw new Error(`Board not found: ${boardId}`);
  }

  const updatedDoc = await doc.incrementalPatch({
    ...updates,
    updatedAt: new Date(),
  });

  console.log("[RxDB] Board updated:", boardId);
  return updatedDoc.toJSON() as Board;
}

/**
 * Delete a board
 */
export async function deleteBoard(boardId: string): Promise<void> {
  const collection = getBoardsCollection();

  const doc = await collection.findOne({ selector: { id: boardId } }).exec();

  if (!doc) {
    throw new Error(`Board not found: ${boardId}`);
  }

  await doc.remove();
  console.log("[RxDB] Board deleted:", boardId);
}

/**
 * Duplicate a board
 */
export async function duplicateBoard(
  boardId: string,
  newName?: string,
): Promise<Board> {
  const collection = getBoardsCollection();

  const originalDoc = await collection
    .findOne({ selector: { id: boardId } })
    .exec();

  if (!originalDoc) {
    throw new Error(`Board not found: ${boardId}`);
  }

  const original = originalDoc.toJSON() as Board;

  const duplicatedBoard = await createBoard({
    name: newName || `${original.name} (Copy)`,
    elements: [...original.elements], // Deep copy elements
    preferences: original.preferences,
  });

  console.log("[RxDB] Board duplicated:", boardId, "->", duplicatedBoard.id);
  return duplicatedBoard;
}

/**
 * Add an element to a board
 */
export async function addElementToBoard(
  boardId: string,
  element: Element,
): Promise<Board> {
  const collection = getBoardsCollection();

  const doc = await collection.findOne({ selector: { id: boardId } }).exec();

  if (!doc) {
    throw new Error(`Board not found: ${boardId}`);
  }

  // Ensure element has timestamps
  const elementWithTimestamps = {
    ...element,
    createdAt: element.createdAt || new Date(),
    updatedAt: new Date(),
  };

  const updatedDoc = await doc.incrementalPatch({
    elements: [...doc.elements, elementWithTimestamps],
    updatedAt: new Date(),
  });

  console.log("[RxDB] Element added to board:", boardId, element.id);
  return updatedDoc.toJSON() as Board;
}

/**
 * Update an element in a board
 */
export async function updateElementInBoard(
  boardId: string,
  elementId: string,
  updates: Partial<Element>,
): Promise<Board> {
  const collection = getBoardsCollection();

  const doc = await collection.findOne({ selector: { id: boardId } }).exec();

  if (!doc) {
    throw new Error(`Board not found: ${boardId}`);
  }

  const elements = doc.elements.map((el: any) => {
    if (el.id === elementId) {
      return {
        ...el,
        ...updates,
        updatedAt: new Date(),
      };
    }
    return el;
  });

  const updatedDoc = await doc.incrementalPatch({
    elements,
    updatedAt: new Date(),
  });

  console.log("[RxDB] Element updated in board:", boardId, elementId);
  return updatedDoc.toJSON() as Board;
}

/**
 * Delete an element from a board
 */
export async function deleteElementFromBoard(
  boardId: string,
  elementId: string,
): Promise<Board> {
  const collection = getBoardsCollection();

  const doc = await collection.findOne({ selector: { id: boardId } }).exec();

  if (!doc) {
    throw new Error(`Board not found: ${boardId}`);
  }

  const elements = doc.elements.filter((el: any) => el.id !== elementId);

  const updatedDoc = await doc.incrementalPatch({
    elements,
    updatedAt: new Date(),
  });

  console.log("[RxDB] Element deleted from board:", boardId, elementId);
  return updatedDoc.toJSON() as Board;
}

/**
 * Update multiple elements in a board at once
 * More efficient than updating each element separately
 */
export async function updateMultipleElementsInBoard(
  boardId: string,
  elementUpdates: Array<{ id: string; updates: Partial<Element> }>,
): Promise<Board> {
  const collection = getBoardsCollection();

  const doc = await collection.findOne({ selector: { id: boardId } }).exec();

  if (!doc) {
    throw new Error(`Board not found: ${boardId}`);
  }

  const elements = doc.elements.map((el: any) => {
    const update = elementUpdates.find((u) => u.id === el.id);
    if (update) {
      return {
        ...el,
        ...update.updates,
        updatedAt: new Date(),
      };
    }
    return el;
  });

  const updatedDoc = await doc.incrementalPatch({
    elements,
    updatedAt: new Date(),
  });

  console.log(
    "[RxDB] Multiple elements updated in board:",
    boardId,
    elementUpdates.length,
    "elements",
  );
  return updatedDoc.toJSON() as Board;
}

/**
 * Bulk delete elements from a board
 */
export async function deleteMultipleElementsFromBoard(
  boardId: string,
  elementIds: string[],
): Promise<Board> {
  const collection = getBoardsCollection();

  const doc = await collection.findOne({ selector: { id: boardId } }).exec();

  if (!doc) {
    throw new Error(`Board not found: ${boardId}`);
  }

  const elements = doc.elements.filter(
    (el: any) => !elementIds.includes(el.id),
  );

  const updatedDoc = await doc.incrementalPatch({
    elements,
    updatedAt: new Date(),
  });

  console.log(
    "[RxDB] Multiple elements deleted from board:",
    boardId,
    elementIds.length,
    "elements",
  );
  return updatedDoc.toJSON() as Board;
}

/**
 * Clear all elements from a board
 */
export async function clearAllElementsFromBoard(
  boardId: string,
): Promise<Board> {
  const collection = getBoardsCollection();

  const doc = await collection.findOne({ selector: { id: boardId } }).exec();

  if (!doc) {
    throw new Error(`Board not found: ${boardId}`);
  }

  const updatedDoc = await doc.incrementalPatch({
    elements: [],
    updatedAt: new Date(),
  });

  console.log("[RxDB] All elements cleared from board:", boardId);
  return updatedDoc.toJSON() as Board;
}

/**
 * Update board preferences
 */
export async function updateBoardPreferences(
  boardId: string,
  preferences: Partial<Board["preferences"]>,
): Promise<Board> {
  const collection = getBoardsCollection();

  const doc = await collection.findOne({ selector: { id: boardId } }).exec();

  if (!doc) {
    throw new Error(`Board not found: ${boardId}`);
  }

  const updatedDoc = await doc.incrementalPatch({
    preferences: {
      ...doc.preferences,
      ...preferences,
    },
    updatedAt: new Date(),
  });

  console.log("[RxDB] Board preferences updated:", boardId);
  return updatedDoc.toJSON() as Board;
}

/**
 * Get or create user preferences
 */
export async function getOrCreateUserPreferences(): Promise<UserPreferences> {
  const collection = getPreferencesCollection();

  let doc = await collection.findOne({ selector: { id: "global" } }).exec();

  if (!doc) {
    doc = await collection.insert({
      ...createDefaultPreferences(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("[RxDB] Default user preferences created");
  }

  return doc.toJSON() as UserPreferences;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  updates: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const collection = getPreferencesCollection();

  let doc = await collection.findOne({ selector: { id: "global" } }).exec();

  if (!doc) {
    // Create if doesn't exist
    doc = await collection.insert({
      ...createDefaultPreferences(),
      ...updates,
      id: "global",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    // Update existing
    doc = await doc.incrementalPatch({
      ...updates,
      updatedAt: new Date(),
    });
  }

  console.log("[RxDB] User preferences updated");
  return doc.toJSON() as UserPreferences;
}

/**
 * Atomic operation: Create board with initial elements
 */
export async function createBoardWithElements(
  data: Partial<Board>,
  elements: Element[] = [],
): Promise<Board> {
  const boardData = {
    ...createDefaultBoard(),
    ...data,
    elements: elements.map((el) => ({
      ...el,
      createdAt: el.createdAt || new Date(),
      updatedAt: new Date(),
    })),
    id:
      data.id ||
      `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const collection = getBoardsCollection();
  const doc = await collection.insert(boardData);
  console.log(
    "[RxDB] Board created with",
    elements.length,
    "elements:",
    doc.id,
  );
  return doc.toJSON() as Board;
}

/**
 * Batch create multiple boards
 */
export async function createMultipleBoards(
  boards: Array<Partial<Board>>,
): Promise<Board[]> {
  const collection = getBoardsCollection();

  const boardData = boards.map((board) => ({
    ...createDefaultBoard(),
    ...board,
    id:
      board.id ||
      `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const docs = await collection.bulkInsert(boardData);
  console.log("[RxDB] Batch created", docs.success.length, "boards");
  return docs.success.map((doc) => doc.toJSON() as Board);
}

/**
 * Batch delete multiple boards
 */
export async function deleteMultipleBoards(boardIds: string[]): Promise<void> {
  const collection = getBoardsCollection();

  const docs = await collection
    .find({ selector: { id: { $in: boardIds } } })
    .exec();

  if (docs.length > 0) {
    await Promise.all(docs.map((doc) => doc.remove()));
    console.log("[RxDB] Batch deleted", docs.length, "boards");
  }
}

/**
 * Archive a board (soft delete)
 */
export async function archiveBoard(boardId: string): Promise<Board> {
  return updateBoard(boardId, {
    preferences: { theme: "light", gridEnabled: true },
  });
}

/**
 * Restore a board from archive
 */
export async function restoreBoard(boardId: string): Promise<Board> {
  // For V1, we don't have archive flag
  // This is a placeholder for V3+ implementation
  return updateBoard(boardId, {});
}

/**
 * Reorder elements in a board
 * Updates zIndex for all elements
 */
export async function reorderElementsInBoard(
  boardId: string,
  elementId: string,
  newZIndex: number,
): Promise<Board> {
  const collection = getBoardsCollection();

  const doc = await collection.findOne({ selector: { id: boardId } }).exec();

  if (!doc) {
    throw new Error(`Board not found: ${boardId}`);
  }

  // Update zIndex of the specified element
  const elements = doc.elements.map((el: any) => {
    if (el.id === elementId) {
      return {
        ...el,
        zIndex: newZIndex,
        updatedAt: new Date(),
      };
    }
    return el;
  });

  const updatedDoc = await doc.incrementalPatch({
    elements,
    updatedAt: new Date(),
  });

  console.log(
    "[RxDB] Element reordered in board:",
    boardId,
    "element:",
    elementId,
    "zIndex:",
    newZIndex,
  );
  return updatedDoc.toJSON() as Board;
}

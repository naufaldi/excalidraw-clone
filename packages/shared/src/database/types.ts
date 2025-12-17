/**
 * @file Database type definitions for RxDB
 * Shared across all applications (V1-V4)
 */

export type ElementType =
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'text'
  | 'pen';

export type Theme = 'light' | 'dark';

/**
 * Point coordinate for freehand drawing
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Drawing element stored within a board
 * V1-V3: Embedded in board.elements array
 * V4: Normalized to separate collection with boardId reference
 */
export interface Element {
  id: string; // Unique identifier within the board
  type: ElementType;
  x: number; // X coordinate
  y: number; // Y coordinate
  width?: number; // Width for shapes
  height?: number; // Height for shapes
  points?: Point[]; // For pen tool (freehand drawing)
  text?: string; // For text tool
  fontSize?: number; // Font size for text elements
  angle?: number; // Rotation in degrees
  strokeColor: string; // Stroke color in hex format (#000000)
  fillColor: string; // Fill color in hex format (#ffffff)
  strokeWidth: number; // Line width (1-20 pixels)
  opacity: number; // Opacity 0.0 - 1.0
  zIndex: number; // Layer ordering (0 = bottom)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Board document structure
 * V1-V3: Contains embedded elements array
 * V4: Migrates to reference elements by ID
 */
export interface Board {
  id: string; // Unique identifier
  name: string; // Board name
  elements: Element[]; // EMBEDDED elements (V1-V3)
  preferences?: {
    theme: Theme;
    gridEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  version: '1.0'; // Schema version for migration tracking
}

/**
 * User preferences (V2+)
 * Stored separately from boards for global settings
 */
export interface UserPreferences {
  id: string; // 'global' for global preferences
  theme: Theme;
  defaultTool: ElementType;
  gridEnabled: boolean;
  autoSaveInterval: number; // milliseconds
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Board metadata for dashboard (V3+)
 * Lightweight view of boards for listing
 */
export interface BoardMetadata {
  id: string;
  name: string;
  templateType?: 'blank' | 'flowchart' | 'mindmap' | 'uml' | 'wireframe';
  thumbnailUrl?: string;
  elementCount: number;
  createdAt: Date;
  updatedAt: Date;
  isArchived?: boolean;
}

/**
 * Database configuration options
 */
export interface DatabaseConfig {
  name: string;
  storage?: any; // Storage adapter (IndexedDB, etc.)
  multiInstance?: boolean;
  ignoreDuplicate?: boolean;
  options?: any;
}

/**
 * Reactive query options
 */
export interface QueryOptions {
  sort?: string;
  limit?: number;
  skip?: number;
}

/**
 * Mutation options for atomic operations
 */
export interface MutationOptions {
  priority?: 'low' | 'normal' | 'high';
  conflictStrategy?: 'acceptChanges' | 'throwOnConflict';
}

/**
 * V2 Migration: Board data structure for PostgreSQL
 */
export interface BoardDataV2 {
  id: string;
  userId: string;
  name: string;
  data: {
    // Contains V1 embedded schema
    elements: Element[];
    preferences?: Board['preferences'];
  };
  schemaVersion: '1.0';
  createdAt: Date;
  updatedAt: Date;
  lastSynced?: Date;
}

/**
 * V4 Normalized: Referenced elements
 */
export interface ElementV4 {
  id: string;
  boardId: string;
  type: ElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Point[];
  text?: string;
  fontSize?: number;
  angle?: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  zIndex: number;
  version: number; // For optimistic locking in real-time collaboration
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type guard to check if element is a pen tool
 */
export function isPenElement(element: Element): element is Element & { points: Point[] } {
  return element.type === 'pen' && element.points !== undefined;
}

/**
 * Type guard to check if element is a shape
 */
export function isShapeElement(element: Element): element is Element & { width: number; height: number } {
  return ['rectangle', 'circle'].includes(element.type) &&
         element.width !== undefined &&
         element.height !== undefined;
}

/**
 * Type guard to check if element is text
 */
export function isTextElement(element: Element): element is Element & { text: string; fontSize: number } {
  return element.type === 'text' &&
         element.text !== undefined &&
         element.fontSize !== undefined;
}

/**
 * Default element template
 */
export const createDefaultElement = (type: ElementType): Omit<Element, 'id' | 'createdAt' | 'updatedAt'> => {
  const base = {
    type,
    x: 0,
    y: 0,
    strokeColor: '#000000',
    fillColor: '#ffffff',
    strokeWidth: 2,
    opacity: 1,
    zIndex: 0,
  };

  switch (type) {
    case 'rectangle':
    case 'circle':
      return {
        ...base,
        width: 100,
        height: 100,
      };
    case 'line':
    case 'arrow':
      return base;
    case 'pen':
      return {
        ...base,
        points: [],
      };
    case 'text':
      return {
        ...base,
        text: 'Text',
        fontSize: 16,
      };
    default:
      return base;
  }
};

/**
 * @file RxDB schema definitions
 * JSON Schema for RxDB collections
 */

import type { RxJsonSchema } from 'rxdb'
import type { Board, Element, UserPreferences } from './types.js'

/**
 * JSON Schema for Element embedded in Board
 * Note: Elements are embedded in V1-V3, not a separate collection
 */
export const elementSchema: RxJsonSchema<Omit<Element, 'createdAt' | 'updatedAt'>> = {
  title: 'Element',
  description: 'Drawing element within a board',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100, // Safe upper bound for document IDs
    },
    type: {
      type: 'string',
      enum: ['rectangle', 'circle', 'line', 'arrow', 'text', 'pen'],
    },
    x: {
      type: 'number',
    },
    y: {
      type: 'number',
    },
    width: {
      type: 'number',
    },
    height: {
      type: 'number',
    },
    points: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          x: { type: 'number' },
          y: { type: 'number' },
        },
        required: ['x', 'y'],
      },
    },
    text: {
      type: 'string',
    },
    fontSize: {
      type: 'number',
    },
    angle: {
      type: 'number',
    },
    strokeColor: {
      type: 'string',
    },
    fillColor: {
      type: 'string',
    },
    strokeWidth: {
      type: 'integer',
      minimum: 0,
      maximum: 20,
    },
    opacity: {
      type: 'number',
      minimum: 0,
      maximum: 1,
    },
    zIndex: {
      type: 'integer',
      minimum: 0,
    },
  },
  required: [
    'id',
    'type',
    'x',
    'y',
    'strokeColor',
    'fillColor',
    'strokeWidth',
    'opacity',
    'zIndex',
  ],
  indexes: ['type', 'zIndex'],
}

/**
 * JSON Schema for Board collection
 * Contains embedded elements array for V1-V3
 */
export const boardSchema: RxJsonSchema<Omit<Board, 'createdAt' | 'updatedAt'>> = {
  title: 'Board',
  description: 'Whiteboard document with embedded elements',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    name: {
      type: 'string',
      maxLength: 200,
    },
    elements: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            maxLength: 100,
          },
          type: {
            type: 'string',
            enum: ['rectangle', 'circle', 'line', 'arrow', 'text', 'pen'],
          },
          x: { type: 'number' },
          y: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' },
          points: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                x: { type: 'number' },
                y: { type: 'number' },
              },
              required: ['x', 'y'],
            },
          },
          text: { type: 'string' },
          fontSize: { type: 'number' },
          angle: { type: 'number' },
          strokeColor: {
            type: 'string',
          },
          fillColor: {
            type: 'string',
          },
          strokeWidth: {
            type: 'integer',
            minimum: 0,
            maximum: 20,
          },
          opacity: {
            type: 'number',
            minimum: 0,
            maximum: 1,
          },
          zIndex: {
            type: 'integer',
            minimum: 0,
          },
        },
        required: [
          'id',
          'type',
          'x',
          'y',
          'strokeColor',
          'fillColor',
          'strokeWidth',
          'opacity',
          'zIndex',
        ],
      },
    },
    preferences: {
      type: 'object',
      properties: {
        theme: {
          type: 'string',
          enum: ['light', 'dark'],
        },
        gridEnabled: {
          type: 'boolean',
        },
      },
      required: ['theme', 'gridEnabled'],
    },
    version: {
      type: 'string',
      enum: ['1.0'],
    },
  },
  required: ['id', 'name', 'elements', 'version'],
  indexes: ['name', 'version'],
}

/**
 * JSON Schema for UserPreferences
 * Global user settings (V2+)
 */
export const userPreferencesSchema: RxJsonSchema<Omit<UserPreferences, 'createdAt' | 'updatedAt'>> =
  {
    title: 'UserPreferences',
    description: 'Global user preferences',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        maxLength: 100,
      },
      theme: {
        type: 'string',
        enum: ['light', 'dark'],
      },
      defaultTool: {
        type: 'string',
        enum: ['rectangle', 'circle', 'line', 'arrow', 'text', 'pen'],
      },
      gridEnabled: {
        type: 'boolean',
      },
      autoSaveInterval: {
        type: 'integer',
        minimum: 1000, // Minimum 1 second
        maximum: 60000, // Maximum 60 seconds
      },
    },
    required: ['id', 'theme', 'defaultTool', 'gridEnabled', 'autoSaveInterval'],
    indexes: ['id'],
  }

/**
 * Complete database schema
 * All collections and their schemas
 */
export const databaseSchemas = {
  boards: boardSchema,
  userPreferences: userPreferencesSchema,
}

/**
 * Schema versions for migration tracking
 */
export const SCHEMA_VERSIONS = {
  CURRENT: 1,
  MIGRATIONS: {
    // Future migrations will be defined here
    // 1: (oldDoc) => { /* migration logic */ },
  },
} as const

/**
 * Validate board schema version
 */
export function validateBoardVersion(board: Board): boolean {
  return board.version === '1.0'
}

/**
 * Create default board
 */
export function createDefaultBoard(
  name: string = 'Untitled Board'
): Omit<Board, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name,
    elements: [],
    preferences: {
      theme: 'light',
      gridEnabled: true,
    },
    version: '1.0',
  }
}

/**
 * Create default user preferences
 */
export function createDefaultPreferences(): Omit<UserPreferences, 'createdAt' | 'updatedAt'> {
  return {
    id: 'global',
    theme: 'light',
    defaultTool: 'pen',
    gridEnabled: true,
    autoSaveInterval: 2000, // 2 seconds
  }
}

/**
 * Get all schemas as array
 */
export const getAllSchemas = (): RxJsonSchema<any>[] => {
  return Object.values(databaseSchemas)
}

/**
 * Get schema by collection name
 */
export function getSchemaByCollection(
  collectionName: keyof typeof databaseSchemas
): RxJsonSchema<any> {
  return databaseSchemas[collectionName]
}

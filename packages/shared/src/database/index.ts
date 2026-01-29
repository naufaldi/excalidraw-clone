/**
 * @repo/shared/database - Database Types and Schemas
 *
 * Shared database definitions for RxDB across all applications.
 * Provides TypeScript interfaces and JSON schemas for V1-V4 evolution.
 */

// Type exports
export type * from './types.js'

// Schema exports
export type * from './schema.js'

// Individual schema exports
export { elementSchema, boardSchema, userPreferencesSchema } from './schema.js'
export { databaseSchemas, SCHEMA_VERSIONS } from './schema.js'
export {
  validateBoardVersion,
  createDefaultBoard,
  createDefaultPreferences,
  getAllSchemas,
  getSchemaByCollection,
} from './schema.js'

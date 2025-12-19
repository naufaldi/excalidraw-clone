/**
 * @repo/shared/database - Database Types and Schemas
 *
 * Shared database definitions for RxDB across all applications.
 * Provides TypeScript interfaces and JSON schemas for V1-V4 evolution.
 */

// Schema exports
export {
  boardSchema,
  boardMigrationStrategies,
  createDefaultBoard,
  createDefaultPreferences,
  databaseSchemas,
  elementSchema,
  getAllSchemas,
  getSchemaByCollection,
  SCHEMA_VERSIONS,
  userPreferencesSchema,
  validateBoardVersion,
} from "./schema.js";
// Type exports
export type * from "./types.js";

/**
 * @file Database Module Exports
 * Central exports for all database functionality
 */

// Initialization
export {
	checkDatabaseHealth,
	closeDatabase,
	exportDatabase,
	getBoardsCollection,
	getDatabase,
	getPreferencesCollection,
	importDatabase,
	initializeDatabase,
	resetDatabase,
	setupDatabaseEventHandlers,
} from "./database.js";
// Mutations (CRUD)
export {
	addElementToBoard,
	archiveBoard,
	clearAllElementsFromBoard,
	createBoard,
	createBoardWithElements,
	createMultipleBoards,
	deleteBoard,
	deleteElementFromBoard,
	deleteMultipleBoards,
	deleteMultipleElementsFromBoard,
	duplicateBoard,
	getOrCreateUserPreferences,
	reorderElementsInBoard,
	restoreBoard,
	updateBoard,
	updateBoardPreferences,
	updateElementInBoard,
	updateMultipleElementsInBoard,
	updateUserPreferences,
} from "./mutations.js";
// Queries (reactive)
export {
	createBoardCountObservable,
	createBoardsQuery,
	createCustomQuery,
	createLiveBoardQuery,
	createLiveBoardsQuery,
	createLivePreferencesQuery,
	getAllBoardsPlain,
	getAllBoardsQuery,
	getBoardByIdQuery,
	getBoardCountQuery,
	getBoardsByElementCountRange,
	getBoardsCreatedAfter,
	getBoardsForSync,
	getBoardsUpdatedAfter,
	getBoardsWithElementType,
	getBoardsWithMostElements,
	getElementFromBoard,
	getElementStatistics,
	getRecentBoardsQuery,
	getUserPreferencesQuery,
	searchBoardsQuery,
} from "./queries.js";

// Types (from shared package)
export type {
	Board,
	BoardMetadata,
	DatabaseConfig,
	Element,
	ElementType,
	MutationOptions,
	Point,
	QueryOptions,
	Theme,
	UserPreferences,
} from "./shared/index.js";

// Schemas (from shared package)
export {
	boardSchema,
	createDefaultBoard,
	createDefaultPreferences,
	databaseSchemas,
	elementSchema,
	getAllSchemas,
	getSchemaByCollection,
	SCHEMA_VERSIONS,
	userPreferencesSchema,
	validateBoardVersion,
} from "./shared/index.js";

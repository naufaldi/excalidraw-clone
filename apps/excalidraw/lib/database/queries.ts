/**
 * @file Reactive Database Queries
 * Provides reactive queries for boards and elements with automatic UI updates
 */

import { getBoardsCollection, getPreferencesCollection } from "./database.js";
import type { Board, QueryOptions, UserPreferences } from "./shared/index.js";

const LAST_WRITE_TIME_FIELD = "_meta.lwt" as const;

/**
 * Reactive query for all boards
 * Returns an observable that updates when boards change
 */
export function getAllBoardsQuery() {
	const collection = getBoardsCollection();
	return collection
		.find()
		.sort({ [LAST_WRITE_TIME_FIELD]: "desc" } as any)
		.exec();
}

/**
 * Reactive query for a single board by ID
 * Returns an observable that updates when the board changes
 */
export function getBoardByIdQuery(boardId: string) {
	const collection = getBoardsCollection();
	return collection.findOne({ selector: { id: boardId } }).exec();
}

/**
 * Reactive query for recently updated boards
 * Returns boards sorted by update time (most recent first)
 */
export function getRecentBoardsQuery(limit: number = 10) {
	const collection = getBoardsCollection();
	return collection
		.find()
		.sort({ [LAST_WRITE_TIME_FIELD]: "desc" } as any)
		.limit(limit)
		.exec();
}

/**
 * Reactive query for boards by name (search)
 * Case-insensitive search on board names
 */
export function searchBoardsQuery(searchTerm: string) {
	const collection = getBoardsCollection();
	return collection
		.find({
			selector: {
				name: { $regex: `(?i)${searchTerm}` },
			},
		})
		.sort({ [LAST_WRITE_TIME_FIELD]: "desc" } as any)
		.exec();
}

/**
 * Reactive query for user preferences
 * Returns the global user preferences document
 */
export function getUserPreferencesQuery() {
	const collection = getPreferencesCollection();
	return collection.findOne({ selector: { id: "global" } }).exec();
}

/**
 * Count total boards
 * Returns an observable count that updates when boards change
 */
export function getBoardCountQuery() {
	const collection = getBoardsCollection();
	return collection
		.count()
		.exec()
		.then((count) => count);
}

/**
 * Count boards by element count range
 * Useful for analytics (e.g., boards with 0-10, 10-50, 50+ elements)
 */
export function getBoardsByElementCountRange(min: number, max: number) {
	const collection = getBoardsCollection();
	return collection
		.find({
			selector: {},
		})
		.exec()
		.then((docs) =>
			docs.filter((doc) => {
				const elementCount = doc.elements.length;
				return elementCount >= min && elementCount <= max;
			}),
		);
}

/**
 * Get all boards as a live query
 * Returns a query that can be re-executed with new parameters
 */
export function createBoardsQuery(options: QueryOptions = {}) {
	const collection = getBoardsCollection();
	let query = collection
		.find()
		.sort({ [LAST_WRITE_TIME_FIELD]: "desc" } as any);

	if (options.limit) {
		query = query.limit(options.limit);
	}

	if (options.skip) {
		query = query.skip(options.skip);
	}

	return query.exec();
}

/**
 * Get boards created after a specific date
 * Useful for showing only recent boards
 */
export function getBoardsCreatedAfter(date: Date) {
	const collection = getBoardsCollection();
	const since = date.getTime();
	return collection
		.find({
			selector: { [LAST_WRITE_TIME_FIELD]: { $gt: since } } as any,
		})
		.sort({ [LAST_WRITE_TIME_FIELD]: "desc" } as any)
		.exec();
}

/**
 * Get boards updated after a specific date
 * Useful for sync scenarios
 */
export function getBoardsUpdatedAfter(date: Date) {
	const collection = getBoardsCollection();
	const since = date.getTime();
	return collection
		.find({
			selector: { [LAST_WRITE_TIME_FIELD]: { $gt: since } } as any,
		})
		.sort({ [LAST_WRITE_TIME_FIELD]: "desc" } as any)
		.exec();
}

/**
 * Get all boards with a specific element type
 * Useful for filtering boards that contain certain types of elements
 */
export function getBoardsWithElementType(elementType: string) {
	const collection = getBoardsCollection();
	return collection
		.find({
			selector: {},
		})
		.exec()
		.then((docs) =>
			docs.filter((doc) =>
				doc.elements.some((el: any) => el.type === elementType),
			),
		);
}

/**
 * Get a specific element from a board
 * Note: In V1-V3, elements are embedded in the board document
 */
export function getElementFromBoard(
	boardId: string,
	elementId: string,
): Promise<any> {
	return getBoardByIdQuery(boardId).then((boardDoc) => {
		if (!boardDoc) {
			return null;
		}

		const element = boardDoc.elements.find((el: any) => el.id === elementId);
		return element || null;
	});
}

/**
 * Get all boards as plain JavaScript objects
 * Strips RxDB document wrapper for serialization
 */
export function getAllBoardsPlain(): Promise<Board[]> {
	return getAllBoardsQuery().then((docs) =>
		docs.map((doc) => doc.toJSON() as Board),
	);
}

/**
 * Get board count observable for UI
 * Returns a function that can be called to get the current count
 */
export function createBoardCountObservable() {
	return getBoardCountQuery();
}

/**
 * Live query for boards with auto-update
 * Returns a query that emits new results when data changes
 */
export function createLiveBoardsQuery() {
	const collection = getBoardsCollection();
	return collection.find().sort({ [LAST_WRITE_TIME_FIELD]: "desc" } as any).$; // $ returns an observable
}

/**
 * Live query for single board with auto-update
 * Returns an observable that emits the board document
 */
export function createLiveBoardQuery(boardId: string) {
	const collection = getBoardsCollection();
	return collection.findOne({ selector: { id: boardId } }).$;
}

/**
 * Live query for user preferences with auto-update
 * Returns an observable that emits preferences changes
 */
export function createLivePreferencesQuery() {
	const collection = getPreferencesCollection();
	return collection.findOne({ selector: { id: "global" } }).$;
}

/**
 * Query for boards that need to be synced (V2 feature)
 * Returns boards modified after last sync
 */
export function getBoardsForSync(lastSyncTime: Date) {
	const collection = getBoardsCollection();
	const since = lastSyncTime.getTime();
	return collection
		.find({
			selector: { [LAST_WRITE_TIME_FIELD]: { $gt: since } } as any,
		})
		.exec();
}

/**
 * Get boards with most elements
 * Useful for performance monitoring
 */
export function getBoardsWithMostElements(limit: number = 10) {
	const collection = getBoardsCollection();
	return collection
		.find()
		.exec()
		.then((docs) =>
			docs
				.map((doc) => ({
					...doc.toJSON(),
					elementCount: doc.elements.length,
				}))
				.sort((a, b) => b.elementCount - a.elementCount)
				.slice(0, limit),
		);
}

/**
 * Aggregate query: Get element statistics
 * Returns counts of different element types across all boards
 */
export function getElementStatistics(): Promise<Record<string, number>> {
	return getAllBoardsQuery().then((docs) => {
		const stats: Record<string, number> = {};

		docs.forEach((doc) => {
			doc.elements.forEach((element: any) => {
				stats[element.type] = (stats[element.type] || 0) + 1;
			});
		});

		return stats;
	});
}

/**
 * Query with custom selector
 * Generic function for custom queries
 */
export function createCustomQuery(selector: any, options: any = {}) {
	const collection = getBoardsCollection();
	let query = collection.find({ selector });

	if (options.sort) {
		query = query.sort(options.sort);
	}

	if (options.limit) {
		query = query.limit(options.limit);
	}

	if (options.skip) {
		query = query.skip(options.skip);
	}

	return query.exec();
}

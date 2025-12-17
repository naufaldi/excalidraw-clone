/**
 * Direct test of database initialization
 */

import { createRxDatabase } from "rxdb";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import {
	boardSchema,
	userPreferencesSchema,
} from "../lib/database/shared/schema.js";

describe("Direct Database Init", () => {
	it("should initialize database directly", async () => {
		const db = await createRxDatabase({
			name: "test-direct",
			storage: getRxStorageMemory(),
			multiInstance: false,
			collections: [
				{
					name: "boards",
					schema: boardSchema,
				},
				{
					name: "userPreferences",
					schema: userPreferencesSchema,
				},
			],
		});

		expect(db).toBeDefined();
		expect(db.name).toBe("test-direct");
	});
});

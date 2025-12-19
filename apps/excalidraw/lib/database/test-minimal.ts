/**
 * Test minimal schema to debug DB9 error
 */

import { createRxDatabase } from "rxdb";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import { boardSchema, userPreferencesSchema } from "./shared/index.js";

async function testMinimal() {
	try {
		console.log("[Test] Creating database with minimal schema...");
		const db = await createRxDatabase({
			name: "whiteboard-db",
			storage: getRxStorageMemory(),
			multiInstance: true,
		});

		await db.addCollections({
			boards: {
				schema: boardSchema,
			},
			userPreferences: {
				schema: userPreferencesSchema,
			},
		});

		console.log("[Test] ✅ Success! Minimal schema works");
		console.log("[Test] Collections: boards, userPreferences");

		// Note: Database cleanup handled by RxDB internals
		console.log("[Test] Database destroyed");
	} catch (error) {
		console.error("[Test] ❌ Failed:", error);
		console.error(
			"[Test] Error details:",
			JSON.stringify(error, Object.getOwnPropertyNames(error)),
		);
	}
}

testMinimal();

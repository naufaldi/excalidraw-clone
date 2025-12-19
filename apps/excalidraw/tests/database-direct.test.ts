/**
 * Direct test of database initialization
 */

import { createRxDatabase, addRxPlugin } from "rxdb";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import { RxDBMigrationSchemaPlugin } from "rxdb/plugins/migration-schema";
import {
  boardSchema,
  userPreferencesSchema,
} from "../lib/database/shared/schema.js";

// Add the migration schema plugin
addRxPlugin(RxDBMigrationSchemaPlugin);

describe("Direct Database Init", () => {
  it("should initialize database directly", async () => {
    const db = await createRxDatabase({
      name: "test-direct",
      storage: getRxStorageMemory(),
      multiInstance: false,
    });

    await db.addCollections({
      boards: {
        schema: boardSchema,
      },
      userPreferences: {
        schema: userPreferencesSchema,
      },
    });

    expect(db).toBeDefined();
    expect(db.name).toBe("test-direct");
    expect(db.boards).toBeDefined();
    expect(db.userPreferences).toBeDefined();
  });
});

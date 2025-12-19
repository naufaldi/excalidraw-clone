/**
 * @file RxDB Database Initialization
 * Sets up IndexedDB storage with multi-instance support for V1 offline-first whiteboard
 */

import {
  addRxPlugin,
  createRxDatabase,
  type RxStorage,
  type RxCollection,
  type RxDatabase,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { RxDBMigrationSchemaPlugin } from "rxdb/plugins/migration-schema";

// Import schemas and types from shared package
import {
  type Board,
  boardMigrationStrategies,
  boardSchema,
  type UserPreferences,
  userPreferencesSchema,
} from "./shared/index.js";

// Add required plugins
addRxPlugin(RxDBMigrationSchemaPlugin);

// Add dev-mode plugin in development
if (process.env.NODE_ENV === "development") {
  addRxPlugin(RxDBDevModePlugin);
}

/**
 * Database instance
 * Singleton pattern to prevent multiple connections
 */
let databaseInstance: RxDatabase | null = null;

/**
 * Initialize RxDB database
 * Sets up IndexedDB storage with multi-instance mode
 */
export async function initializeDatabase(): Promise<RxDatabase> {
  // Return existing instance if already initialized
  if (databaseInstance) {
    console.log("[RxDB] Using existing database instance");
    return databaseInstance;
  }

  console.log("[RxDB] Initializing database...");

  try {
    // Use appropriate storage based on environment
    // Tests run in Node.js (no IndexedDB) - use memory storage
    // Browser uses IndexedDB
    const baseStorage: RxStorage<any, any> =
      typeof window !== "undefined" && "indexedDB" in window
        ? getRxStorageDexie()
        : getRxStorageMemory();

    const storage = wrappedValidateAjvStorage({
      storage: baseStorage,
    });

    // Create database first (RxDB v16 API)
    const db = await createRxDatabase({
      name: "whiteboard-db",
      storage, // Use appropriate storage with validation
      multiInstance: typeof window !== "undefined" && "indexedDB" in window, // Only enable in browser
      eventReduce: true, // Optimize memory usage
      closeDuplicates: true, // Automatically close duplicates (dev-mode only)
    });

    // Add collections after database creation (RxDB v16 API)
    await db.addCollections({
      boards: {
        schema: boardSchema,
        migrationStrategies: boardMigrationStrategies,
        autoMigrate: true,
      },
      userPreferences: {
        schema: userPreferencesSchema,
      },
    });

    // Set as singleton instance
    databaseInstance = db;

    console.log("[RxDB] Database initialized successfully");
    console.log("[RxDB] Collections: boards, userPreferences");

    return db;
  } catch (error) {
    console.error("[RxDB] Failed to initialize database:", error);
    console.error(
      "[RxDB] Error details:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );

    const rxCode =
      typeof error === "object" && error !== null && "code" in error
        ? (error as any).code
        : undefined;
    const isSchemaMismatch =
      rxCode === "DB6" ||
      (error instanceof Error &&
        (error.message.includes("DB6") ||
          error.message.includes("different schema")));

    if (isSchemaMismatch) {
      console.error(
        [
          "[RxDB] Schema mismatch detected (DB6).",
          "This happens when the persisted IndexedDB database was created with an older/different collection schema.",
          "Fix: bump the RxDB schema `version` and add `migrationStrategies`, or (dev only) wipe the local database via `resetDatabase()` / browser storage clear.",
        ].join(" "),
      );
    }

    throw new Error(
      `Database initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get database instance
 * Throws error if not initialized
 */
export function getDatabase(): RxDatabase {
  if (!databaseInstance) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first.",
    );
  }
  return databaseInstance;
}

/**
 * Get boards collection
 */
export function getBoardsCollection(): RxCollection<Board> {
  const db = getDatabase();
  return db.boards as RxCollection<Board>;
}

/**
 * Get user preferences collection
 */
export function getPreferencesCollection(): RxCollection<UserPreferences> {
  const db = getDatabase();
  return db.userPreferences as RxCollection<UserPreferences>;
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  message: string;
  details?: any;
}> {
  try {
    const db = getDatabase();

    // Check if collections exist
    const collections = Object.keys(db.collections);
    const expectedCollections = ["boards", "userPreferences"];

    const missingCollections = expectedCollections.filter(
      (name) => !collections.includes(name),
    );

    if (missingCollections.length > 0) {
      return {
        healthy: false,
        message: `Missing collections: ${missingCollections.join(", ")}`,
        details: { collections, expectedCollections },
      };
    }

    // Try a simple query
    const boardCount = await db.boards.find().exec();

    return {
      healthy: true,
      message: `Database healthy. Collections: ${collections.join(", ")}. Board count: ${boardCount.length}`,
      details: { boardCount: boardCount.length },
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Database health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: { error: String(error) },
    };
  }
}

/**
 * Close database connection
 * Use when app is shutting down
 */
export async function closeDatabase(): Promise<void> {
  if (!databaseInstance) {
    console.log("[RxDB] No database instance to close");
    return;
  }

  try {
    // Properly close the RxDB database before nullifying reference
    await databaseInstance.close();
    console.log("[RxDB] Database connection closed");
    databaseInstance = null;
  } catch (error) {
    console.error("[RxDB] Error closing database:", error);
    throw error;
  }
}

/**
 * Reset database
 * WARNING: Deletes all data
 */
export async function resetDatabase(): Promise<void> {
  console.warn("[RxDB] Resetting database - all data will be lost!");

  await closeDatabase();

  // Delete IndexedDB database
  if ("indexedDB" in globalThis) {
    const dbName = "whiteboard-db";
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => {
        console.log("[RxDB] IndexedDB database deleted");
        resolve();
      };
      request.onerror = () => {
        console.error("[RxDB] Error deleting IndexedDB database");
        reject(request.error);
      };
    });
  }

  console.log("[RxDB] Database reset complete");
}

/**
 * Database event handlers
 */
export function setupDatabaseEventHandlers(): void {
  const db = getDatabase();

  // Handle database events (for future V2)
  // Note: Event handling may require specific RxDB plugins

  // Handle collection changes
  // Note: Collection change observables may need RxDB replication plugins
  // For now, we'll skip automatic change logging
  console.log("[RxDB] Event handlers setup complete");
}

/**
 * Export database for testing
 */
export function exportDatabase(): Promise<any> {
  const db = getDatabase();
  return db.exportJSON();
}

/**
 * Import database from JSON
 */
export async function importDatabase(jsonData: any): Promise<void> {
  const db = getDatabase();
  await db.importJSON(jsonData);
  console.log("[RxDB] Database imported from JSON");
}

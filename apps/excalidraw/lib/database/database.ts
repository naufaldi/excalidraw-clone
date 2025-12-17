/**
 * @file RxDB Database Initialization
 * Sets up IndexedDB storage with multi-instance support for V1 offline-first whiteboard
 */

import {
  addRxPlugin,
  createRxDatabase,
  type RxCollection,
  type RxDatabase,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";

// Import schemas and types from shared package
import {
  type Board,
  boardSchema,
  type UserPreferences,
  userPreferencesSchema,
} from "./shared/index.js";

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
    // Use memory storage for testing
    const storage = getRxStorageMemory();

    // Create database first (RxDB v16 API)
    const db = await createRxDatabase({
      name: "whiteboard-db",
      storage, // Use memory storage for testing
      multiInstance: true, // Enable multi-tab synchronization
      eventReduce: true, // Optimize memory usage
    });

    // Add collections after database creation (RxDB v16 API)
    await db.addCollections({
      boards: {
        schema: boardSchema,
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
    // Note: Database cleanup handled by RxDB internals
    databaseInstance = null;
    console.log("[RxDB] Database connection closed");
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

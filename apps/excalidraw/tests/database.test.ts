/**
 * @file Database Integration Tests
 * Tests for RxDB database initialization and basic operations
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	checkDatabaseHealth,
	closeDatabase,
	initializeDatabase,
} from "../lib/database/index.js";

describe("RxDB Database", () => {
	beforeEach(async () => {
		// Clean up any existing database
		await closeDatabase().catch(() => {});
	});

	afterEach(async () => {
		// Clean up after each test
		await closeDatabase().catch(() => {});
	});

	it("should initialize database successfully", async () => {
		const db = await initializeDatabase();
		expect(db).toBeDefined();
		expect(db.name).toBe("whiteboard-db");
		expect(db.collections).toHaveProperty("boards");
		expect(db.collections).toHaveProperty("userPreferences");
	});

	it("should return same instance on second call", async () => {
		const db1 = await initializeDatabase();
		const db2 = await initializeDatabase();
		expect(db1).toBe(db2);
	});

	it("should pass health check", async () => {
		await initializeDatabase();
		const health = await checkDatabaseHealth();
		expect(health.healthy).toBe(true);
	});

	it("should create a board", async () => {
		const { createBoard, getBoardByIdQuery } = await import(
			"../lib/database/index.js"
		);

		await initializeDatabase();
		const board = await createBoard({
			name: "Test Board",
		});

		expect(board.id).toBeDefined();
		expect(board.name).toBe("Test Board");
		expect(board.elements).toEqual([]);
		expect(board.version).toBe("1.0");
	});

	it("should add element to board", async () => {
		const { createBoard, addElementToBoard, getBoardByIdQuery } = await import(
			"../lib/database/index.js"
		);

		await initializeDatabase();
		const board = await createBoard({ name: "Test Board" });

		const element = {
			id: "element-1",
			type: "rectangle" as const,
			x: 100,
			y: 100,
			width: 200,
			height: 150,
			strokeColor: "#000000",
			fillColor: "#ffffff",
			strokeWidth: 2,
			opacity: 1,
			zIndex: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const updatedBoard = await addElementToBoard(board.id, element);

		expect(updatedBoard.elements).toHaveLength(1);
		expect(updatedBoard.elements[0].id).toBe("element-1");
		expect(updatedBoard.elements[0].type).toBe("rectangle");
	});

	it("should update element in board", async () => {
		const {
			createBoard,
			addElementToBoard,
			updateElementInBoard,
			getBoardByIdQuery,
		} = await import("../lib/database/index.js");

		await initializeDatabase();
		const board = await createBoard({ name: "Test Board" });

		const element = {
			id: "element-1",
			type: "rectangle" as const,
			x: 100,
			y: 100,
			width: 200,
			height: 150,
			strokeColor: "#000000",
			fillColor: "#ffffff",
			strokeWidth: 2,
			opacity: 1,
			zIndex: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await addElementToBoard(board.id, element);
		const updatedBoard = await updateElementInBoard(board.id, "element-1", {
			width: 300,
			height: 200,
		});

		expect(updatedBoard.elements[0].width).toBe(300);
		expect(updatedBoard.elements[0].height).toBe(200);
	});

	it("should delete element from board", async () => {
		const { createBoard, addElementToBoard, deleteElementFromBoard } =
			await import("../lib/database/index.js");

		await initializeDatabase();
		const board = await createBoard({ name: "Test Board" });

		const element = {
			id: "element-1",
			type: "rectangle" as const,
			x: 100,
			y: 100,
			width: 200,
			height: 150,
			strokeColor: "#000000",
			fillColor: "#ffffff",
			strokeWidth: 2,
			opacity: 1,
			zIndex: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await addElementToBoard(board.id, element);
		const updatedBoard = await deleteElementFromBoard(board.id, "element-1");

		expect(updatedBoard.elements).toHaveLength(0);
	});

	it("should get or create user preferences", async () => {
		const { getOrCreateUserPreferences, updateUserPreferences } = await import(
			"../lib/database/index.js"
		);

		await initializeDatabase();
		const prefs = await getOrCreateUserPreferences();

		expect(prefs.id).toBe("global");
		expect(prefs.theme).toBe("light");
		expect(prefs.defaultTool).toBe("pen");
		expect(prefs.gridEnabled).toBe(true);
	});

	it("should update user preferences", async () => {
		const { getOrCreateUserPreferences, updateUserPreferences } = await import(
			"../lib/database/index.js"
		);

		await initializeDatabase();
		await getOrCreateUserPreferences();

		const updated = await updateUserPreferences({
			theme: "dark",
			defaultTool: "rectangle",
		});

		expect(updated.theme).toBe("dark");
		expect(updated.defaultTool).toBe("rectangle");
	});
});

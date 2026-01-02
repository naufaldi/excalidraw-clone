/**
 * Command pattern for undo/redo operations
 */

import type { Element } from "../../lib/database/shared/types.js";

/** Base command interface */
export interface Command {
	execute(): Element[];
	undo(): Element[];
}

/** Create element command */
export class CreateElementCommand implements Command {
	private element: Element;

	constructor(element: Element) {
		this.element = element;
	}

	execute(): Element[] {
		return [this.element];
	}

	undo(): Element[] {
		return [];
	}
}

/** Update element command */
export class UpdateElementCommand implements Command {
	private elementId: string;
	private previousState: Partial<Element>;
	private newState: Partial<Element>;

	constructor(
		elementId: string,
		previousState: Partial<Element>,
		newState: Partial<Element>,
	) {
		this.elementId = elementId;
		this.previousState = previousState;
		this.newState = newState;
	}

	execute(): Element[] {
		return [];
	}

	undo(): Element[] {
		return [];
	}
}

/** Delete element command */
export class DeleteElementCommand implements Command {
	private element: Element;

	constructor(element: Element) {
		this.element = element;
	}

	execute(): Element[] {
		return [];
	}

	undo(): Element[] {
		return [this.element];
	}
}

/** Batch command for multiple operations */
export class BatchCommand implements Command {
	private commands: Command[];

	constructor(commands: Command[]) {
		this.commands = commands;
	}

	execute(): Element[] {
		return this.commands.flatMap((cmd) => cmd.execute());
	}

	undo(): Element[] {
		return this.commands
			.slice()
			.reverse()
			.flatMap((cmd) => cmd.undo());
	}
}

/** History entry */
export interface HistoryEntry {
	command: Command;
	timestamp: number;
}

/** Action type for history */
export type ActionType = "create" | "update" | "delete" | "batch";

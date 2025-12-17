/**
 * @file Minimal test schema for debugging DB9 error
 */

import type { RxJsonSchema } from "rxdb";

export const minimalBoardSchema: RxJsonSchema<any> = {
	version: 0,
	primaryKey: "id",
	type: "object" as const,
	properties: {
		id: {
			type: "string" as const,
			maxLength: 100,
		},
		name: {
			type: "string" as const,
		},
		elements: {
			type: "array" as const,
			items: {
				type: "object" as const,
				properties: {
					id: {
						type: "string" as const,
						maxLength: 100,
					},
					type: {
						type: "string" as const,
					},
					x: { type: "number" as const },
					y: { type: "number" as const },
					width: { type: "number" as const },
					height: { type: "number" as const },
					strokeColor: {
						type: "string" as const,
						pattern: "^#[0-9A-Fa-f]{6}$",
					},
					fillColor: {
						type: "string" as const,
						pattern: "^#[0-9A-Fa-f]{6}$",
					},
					strokeWidth: {
						type: "integer" as const,
						minimum: 1,
						maximum: 20,
					},
					opacity: {
						type: "number" as const,
						minimum: 0,
						maximum: 1,
					},
					zIndex: {
						type: "integer" as const,
						minimum: 0,
					},
				},
				required: [
					"id",
					"type",
					"x",
					"y",
					"strokeColor",
					"fillColor",
					"strokeWidth",
					"opacity",
					"zIndex",
				],
			},
		},
		version: {
			type: "string" as const,
			enum: ["1.0"],
		},
	},
	required: ["id", "name", "elements", "version"],
	indexes: ["name", "version"],
};

export const fullBoardSchema: RxJsonSchema<any> = {
	version: 0,
	primaryKey: "id",
	type: "object" as const,
	properties: {
		id: {
			type: "string" as const,
			maxLength: 100,
		},
		name: {
			type: "string" as const,
			maxLength: 200,
		},
		elements: {
			type: "array" as const,
			items: {
				type: "object" as const,
				properties: {
					id: {
						type: "string" as const,
						maxLength: 100,
					},
					type: {
						type: "string" as const,
					},
					x: { type: "number" as const },
					y: { type: "number" as const },
					width: { type: "number" as const },
					height: { type: "number" as const },
					points: {
						type: "array" as const,
						items: {
							type: "object" as const,
							properties: {
								x: { type: "number" as const },
								y: { type: "number" as const },
							},
							required: ["x", "y"],
						},
					},
					text: { type: "string" as const },
					fontSize: { type: "number" as const },
					angle: { type: "number" as const },
					strokeColor: {
						type: "string" as const,
						pattern: "^#[0-9A-Fa-f]{6}$",
					},
					fillColor: {
						type: "string" as const,
						pattern: "^#[0-9A-Fa-f]{6}$",
					},
					strokeWidth: {
						type: "integer" as const,
						minimum: 1,
						maximum: 20,
					},
					opacity: {
						type: "number" as const,
						minimum: 0,
						maximum: 1,
					},
					zIndex: {
						type: "integer" as const,
						minimum: 0,
					},
				},
				required: [
					"id",
					"type",
					"x",
					"y",
					"strokeColor",
					"fillColor",
					"strokeWidth",
					"opacity",
					"zIndex",
				],
			},
		},
		preferences: {
			type: "object" as const,
			properties: {
				theme: {
					type: "string" as const,
					enum: ["light", "dark"],
				},
				gridEnabled: {
					type: "boolean" as const,
				},
			},
			required: ["theme", "gridEnabled"],
		},
		version: {
			type: "string" as const,
			enum: ["1.0"],
		},
	},
	required: ["id", "name", "elements", "version"],
	indexes: ["name", "version"],
};

export const minimalPrefsSchema: RxJsonSchema<any> = {
	version: 0,
	primaryKey: "id",
	type: "object" as const,
	properties: {
		id: {
			type: "string" as const,
			maxLength: 100,
		},
		theme: {
			type: "string" as const,
			enum: ["light", "dark"],
		},
	},
	required: ["id", "theme"],
};

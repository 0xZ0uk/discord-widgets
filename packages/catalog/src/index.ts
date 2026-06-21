// Widget catalog — schema definitions and template access
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";
import { type Widget, WidgetSchema } from "./schemas.js";

/**
 * Load all widget definitions from YAML files in the catalog.
 * Reads from packages/catalog/src/widgets/ relative to the catalog package root.
 */
export function loadWidgets(): Widget[] {
	// Resolve the widgets directory — works both in source and when bundled
	const catalogDir = import.meta.dirname ?? ".";
	const widgetsDir = join(catalogDir, "widgets");

	let files: string[];
	try {
		files = readdirSync(widgetsDir).filter(
			(f) => f.endsWith(".yaml") || f.endsWith(".yml"),
		);
	} catch {
		return [];
	}

	return files.map((file) => {
		const raw = readFileSync(join(widgetsDir, file), "utf-8");
		const parsed = yaml.load(raw) as Record<string, unknown>;
		return WidgetSchema.parse(parsed);
	});
}

/**
 * Get a single widget definition by name.
 */
export function getWidget(name: string): Widget | undefined {
	return loadWidgets().find((w) => w.name === name);
}

export type { Widget } from "./schemas.js";
export { WidgetSchema } from "./schemas.js";

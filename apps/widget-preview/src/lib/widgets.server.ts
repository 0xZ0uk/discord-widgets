import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Widget } from "@discord-widgets/catalog";
import { WidgetSchema } from "@discord-widgets/catalog";
import yaml from "js-yaml";

const PROJECT_ROOT = join(import.meta.dirname, "..", "..", "..", "..");
const WIDGETS_DIR = join(PROJECT_ROOT, "packages", "catalog", "src", "widgets");

let widgets: Widget[] = [];

export function loadWidgets(): Widget[] {
	if (!existsSync(WIDGETS_DIR)) return [];

	const files = readdirSync(WIDGETS_DIR).filter(
		(f) => f.endsWith(".yaml") || f.endsWith(".yml"),
	);

	widgets = files.map((file) => {
		const raw = readFileSync(join(WIDGETS_DIR, file), "utf-8");
		const parsed = yaml.load(raw) as Record<string, unknown>;
		return WidgetSchema.parse(parsed);
	});

	return widgets;
}

export function getWidgets(): Widget[] {
	if (widgets.length === 0) {
		loadWidgets();
	}
	return widgets;
}

export function reloadWidgets(): Widget[] {
	return loadWidgets();
}

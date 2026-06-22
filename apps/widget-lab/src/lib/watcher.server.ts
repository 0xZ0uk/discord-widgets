import { existsSync } from "node:fs";
import { join } from "node:path";
import { watch } from "chokidar";
import { reloadWidgets } from "#/lib/widgets.server";

const PROJECT_ROOT = join(import.meta.dirname, "..", "..", "..", "..");
const WIDGETS_DIR = join(PROJECT_ROOT, "packages", "catalog", "src", "widgets");

export function startWidgetWatcher() {
	if (!existsSync(WIDGETS_DIR)) {
		console.warn("Widgets directory not found:", WIDGETS_DIR);
		return;
	}

	const watcher = watch(WIDGETS_DIR, {
		persistent: true,
		ignoreInitial: true,
		depth: 0,
	});

	watcher.on("all", (event, path) => {
		console.log(`Widget catalog ${event}: ${path}`);
		reloadWidgets();
	});

	console.log(`Watching for widget changes in ${WIDGETS_DIR}`);
}

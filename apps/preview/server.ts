import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Widget } from "@discord-widgets/catalog";
import { WidgetSchema } from "@discord-widgets/catalog";
import { renderWidgetByName, widgetRegistry } from "@discord-widgets/render";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { watch } from "chokidar";
import { Hono } from "hono";
import yaml from "js-yaml";

// ─── Paths ──────────────────────────────────────────────────────────
const PROJECT_ROOT = join(import.meta.dirname, "..", "..");
const WIDGETS_DIR = join(PROJECT_ROOT, "packages", "catalog", "src", "widgets");

// ─── Widget cache ───────────────────────────────────────────────────
let widgets: Widget[] = [];

function loadWidgets(): Widget[] {
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

// Initial load
loadWidgets();

// ─── File watcher ───────────────────────────────────────────────────
const watcher = watch(WIDGETS_DIR, {
	persistent: true,
	ignoreInitial: true,
	depth: 0,
});

watcher.on("all", (event, path) => {
	console.log(`📁 Widget catalog ${event}: ${path}`);
	loadWidgets();
});

// ─── Demo data for widget rendering ─────────────────────────────────
const demoData: Record<string, Record<string, unknown>> = {
	weather: {
		location: "Porto, Portugal",
		temp: "22°",
		condition: "Partly Cloudy",
		icon: "⛅",
		color: "#3498db",
	},
	"rss-feed": {
		item: {
			title: "Takumi: Rust-Powered JSX-to-Image Renderer",
			summary:
				"Takumi is a Rust-based rendering engine that converts React components to images with full Tailwind CSS support.",
			source: "Takumi Blog",
			date: "Jun 21, 2026",
			link: "https://takumi.kane.tw",
		},
		currentIndex: 0,
		totalItems: 3,
		color: "#5865f2",
	},
};

// ─── Hono app ───────────────────────────────────────────────────────
const app = new Hono();

// API: list all widgets
app.get("/api/widgets", (c) => {
	return c.json(widgets);
});

// API: render a widget and return file path
app.get("/api/render/:name", async (c) => {
	const name = c.req.param("name");

	if (!widgetRegistry[name]) {
		return c.json({ error: `Widget "${name}" not found in registry` }, 404);
	}

	const data = demoData[name] ?? {};

	try {
		const result = await renderWidgetByName(name, data, {
			width: 800,
			height: name === "rss-feed" ? 480 : 400,
		});

		return c.json(result);
	} catch (err) {
		console.error(`Render failed for "${name}":`, err);
		return c.json({ error: "Render failed", details: String(err) }, 500);
	}
});

// Serve static files (built client) in production
const distPath = join(import.meta.dirname, "dist", "client");
if (existsSync(distPath)) {
	app.use("/*", serveStatic({ root: "./dist/client" }));
	app.get("*", serveStatic({ root: "./dist/client", path: "index.html" }));
} else {
	app.get("*", (c) => {
		return c.text(
			"Dev mode: use Vite dev server at http://localhost:5173",
			200,
		);
	});
}

// ─── Start server ───────────────────────────────────────────────────
const PORT = 3001;

serve(
	{
		fetch: app.fetch,
		port: PORT,
	},
	(info) => {
		console.log(`🚀 Preview server running at http://localhost:${info.port}`);
	},
);

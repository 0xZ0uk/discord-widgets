import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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
	"crypto-prices": {
		coin: "Bitcoin",
		symbol: "BTC",
		price: "$67,432",
		change24h: "+2.45%",
		source: "CoinGecko",
		color: "#f7931a",
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

// Serve rendered PNGs from out/
app.use("/out/*", serveStatic({ root: "./" }));

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
		const t0 = performance.now();
		const result = await renderWidgetByName(name, data, {
			width: 800,
			height: name === "rss-feed" ? 480 : 400,
		});
		const renderTime = performance.now() - t0;
		const fileSize = statSync(result.url).size;

		return c.json({ ...result, fileSize, renderTime });
	} catch (err) {
		console.error(`Render failed for "${name}":`, err);
		return c.json({ error: "Render failed", details: String(err) }, 500);
	}
});

// API: render a widget with custom props (POST)
app.post("/api/render/:name", async (c) => {
	const name = c.req.param("name");

	if (!widgetRegistry[name]) {
		return c.json({ error: `Widget "${name}" not found in registry` }, 404);
	}

	let props: Record<string, unknown> = {};
	let width = 800;
	let height = name === "rss-feed" ? 480 : 400;

	try {
		const body = await c.req.json();
		props = (body.props as Record<string, unknown>) ?? {};
		if (body.width != null) width = Number(body.width);
		if (body.height != null) height = Number(body.height);
	} catch {
		return c.json({ error: "Invalid JSON body" }, 400);
	}

	try {
		const t0 = performance.now();
		const result = await renderWidgetByName(name, props, { width, height });
		const renderTime = performance.now() - t0;
		const fileSize = statSync(result.url).size;

		return c.json({ ...result, fileSize, renderTime });
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
	// Dev mode: proxy to Vite dev server
	app.get("*", async (c) => {
		const url = new URL(c.req.url);
		const target = `http://localhost:5173${url.pathname}${url.search}`;

		try {
			const res = await fetch(target);
			const text = await res.text();
			return c.html(text);
		} catch {
			return c.html(
				`<!DOCTYPE html><html><body style="background:#313338;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;flex-direction:column;gap:8px">
					<h2>Vite dev server not running</h2>
					<p style="color:#949ba4">Run <code style="background:#1e1f22;padding:2px 8px;border-radius:4px">pnpm -F @discord-widgets/preview vite</code> in another terminal</p>
				</body></html>`,
				503,
			);
		}
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

import { statSync } from "node:fs";
import { renderWidgetByName, widgetRegistry } from "@discord-widgets/render";
import { createFileRoute } from "@tanstack/react-router";

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

export const Route = createFileRoute("/api/render/$name")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const { name } = params;

				if (!widgetRegistry[name]) {
					return Response.json(
						{ error: `Widget "${name}" not found in registry` },
						{ status: 404 },
					);
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

					return Response.json({ ...result, fileSize, renderTime });
				} catch (err) {
					console.error(`Render failed for "${name}":`, err);
					return Response.json(
						{ error: "Render failed", details: String(err) },
						{ status: 500 },
					);
				}
			},
			POST: async ({ params, request }) => {
				const { name } = params;

				if (!widgetRegistry[name]) {
					return Response.json(
						{ error: `Widget "${name}" not found in registry` },
						{ status: 404 },
					);
				}

				let props: Record<string, unknown> = {};
				let width = 800;
				let height = name === "rss-feed" ? 480 : 400;

				try {
					const body = (await request.json()) as Record<string, unknown>;
					props = (body.props as Record<string, unknown>) ?? {};
					if (body.width != null) width = Number(body.width);
					if (body.height != null) height = Number(body.height);
				} catch {
					return Response.json({ error: "Invalid JSON body" }, { status: 400 });
				}

				try {
					const t0 = performance.now();
					const result = await renderWidgetByName(name, props, {
						width,
						height,
					});
					const renderTime = performance.now() - t0;
					const fileSize = statSync(result.url).size;

					return Response.json({ ...result, fileSize, renderTime });
				} catch (err) {
					console.error(`Render failed for "${name}":`, err);
					return Response.json(
						{ error: "Render failed", details: String(err) },
						{ status: 500 },
					);
				}
			},
		},
	},
});

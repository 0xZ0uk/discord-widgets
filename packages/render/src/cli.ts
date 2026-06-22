#!/usr/bin/env node

/**
 * discord-widgets CLI
 *
 * Render widget PNGs from the command line.
 *
 * Usage:
 *   npx @discord-widgets/render <widget> [options]
 *
 * Examples:
 *   npx @discord-widgets/render weather --location "Porto" --temp "22°" --condition "Partly Cloudy"
 *   npx @discord-widgets/render crypto-prices --coin "Bitcoin" --symbol "BTC" --price "$67,500" --change24h "+2.3%"
 *   npx @discord-widgets/render rss-feed --json '{"item":{"title":"Hello","summary":"World"},"currentIndex":0,"totalItems":1}'
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import React from "react";
import { renderToPng } from "./engine.js";
import { widgetRegistry } from "./registry.js";

// Ensure React is globally available for Takumi's JSX processing
if (typeof globalThis.React === "undefined") {
	(globalThis as Record<string, unknown>).React = React;
}

const USAGE = `
discord-widgets — Render widget PNGs

Usage:
  npx @discord-widgets/render <widget> [options]
  npx @discord-widgets/render <widget> --json '<data>'
  npx @discord-widgets/render --list

Widgets:
  weather        Weather card (location, temp, condition)
  crypto-prices  Crypto price tracker (coin, symbol, price, change24h)
  rss-feed       RSS feed card (item, currentIndex, totalItems)

Options:
  --json <data>    JSON string with widget data
  --output <path>  Output file path (default: ./widget.png)
  --width <n>      Image width (default: 800)
  --height <n>     Image height (default: 400)
  --list           List available widgets
  --help           Show this help
`.trim();

function parseArgs(argv: string[]) {
	const args = argv.slice(2);
	const result: {
		widget?: string;
		json?: string;
		output?: string;
		width?: number;
		height?: number;
		list?: boolean;
		help?: boolean;
		props: Record<string, string>;
	} = { props: {} };

	let i = 0;
	while (i < args.length) {
		const arg = args[i]!;
		if (arg === "--help" || arg === "-h") {
			result.help = true;
		} else if (arg === "--list") {
			result.list = true;
		} else if (arg === "--json") {
			result.json = args[++i];
		} else if (arg === "--output" || arg === "-o") {
			result.output = args[++i];
		} else if (arg === "--width") {
			result.width = Number.parseInt(args[++i] ?? "", 10);
		} else if (arg === "--height") {
			result.height = Number.parseInt(args[++i] ?? "", 10);
		} else if (!arg.startsWith("-")) {
			result.widget = arg;
		} else {
			// Unknown flag — try as prop: --foo bar → props.foo = bar
			const key = arg.replace(/^-+/, "");
			result.props[key] = args[++i] ?? "";
		}
		i++;
	}
	return result;
}

function getComponentData(
	widget: string,
	props: Record<string, string>,
	json?: string,
): Record<string, unknown> {
	if (json) {
		return JSON.parse(json);
	}

	// Default data per widget
	const defaults: Record<string, Record<string, unknown>> = {
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
			price: "$67,500",
			change24h: "+2.3%",
			source: "CoinGecko",
			color: "#f7931a",
		},
		"rss-feed": {
			item: {
				title: "Latest Post",
				summary: "No summary provided.",
				source: "Feed",
			},
			currentIndex: 0,
			totalItems: 1,
			color: "#5865f2",
		},
	};

	const data = defaults[widget] ?? {};

	// Override with CLI props
	for (const [key, value] of Object.entries(props)) {
		try {
			data[key] = JSON.parse(value);
		} catch {
			data[key] = value;
		}
	}

	return data;
}

async function main() {
	const args = parseArgs(process.argv);

	if (args.help) {
		console.log(USAGE);
		process.exit(0);
	}

	if (args.list) {
		console.log("Available widgets:");
		for (const name of Object.keys(widgetRegistry)) {
			console.log(`  - ${name}`);
		}
		process.exit(0);
	}

	if (!args.widget) {
		console.error("Error: No widget specified. Use --help for usage.");
		process.exit(1);
	}

	const widget = args.widget;
	const Component = widgetRegistry[widget];
	if (!Component) {
		console.error(`Error: Widget "${widget}" not found.`);
		console.error(`Available: ${Object.keys(widgetRegistry).join(", ")}`);
		process.exit(1);
	}

	const data = getComponentData(widget, args.props, args.json);
	const width = args.width ?? 800;
	const height = args.height ?? (widget === "rss-feed" ? 480 : 400);
	const output = args.output ?? "widget.png";

	const element = React.createElement(Component, data);

	process.stderr.write(`Rendering ${widget} (${width}×${height})...\n`);
	const png = await renderToPng(element, { width, height });
	const outPath = resolve(output);
	writeFileSync(outPath, png);
	process.stderr.write(`Done: ${outPath} (${(png.length / 1024).toFixed(1)}KB)\n`);
}

main().catch((err) => {
	console.error("Fatal:", err);
	process.exit(1);
});

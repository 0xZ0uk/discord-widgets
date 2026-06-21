import { renderToPng } from "./engine.js";
import { WeatherCard } from "./components/WeatherCard.js";
import { RssFeedCard } from "./components/RssFeedCard.js";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DEMO_DIR = import.meta.dirname ?? ".";

async function renderWeatherCard(fontData: ArrayBuffer) {
	console.log("🎨 Rendering WeatherCard...");

	const png = await renderToPng(
		<WeatherCard
			location="Porto, Portugal"
			temp="22°"
			condition="Partly Cloudy"
			icon="⛅"
			color="#3498db"
		/>,
		{
			width: 800,
			height: 400,
			fonts: [{ name: "Liberation Sans", data: fontData }],
		},
	);

	writeFileSync(join(DEMO_DIR, "weather-demo.png"), png);
	console.log(`✅ WeatherCard (${(png.length / 1024).toFixed(1)}KB)`);
}

async function renderRssFeedCards(fontData: ArrayBuffer) {
	console.log("🎨 Rendering RssFeedCard items...");

	const items = [
		{
			title: "Satori: Render React to SVG on the Server",
			summary:
				"Vercel released Satori, a library that converts React components to SVG using Yoga for layout. It supports JSX, inline styles, and flexbox — perfect for generating OG images and widget cards without a browser.",
			source: "Vercel Blog",
			date: "Jun 21, 2026",
			link: "https://github.com/vercel/satori",
		},
		{
			title: "Discord Introduces Activity Embeds for Rich Interactive Content",
			summary:
				"Discord's new activity embeds allow developers to create mini-apps within embed messages. Users can interact with buttons, forms, and media — bringing Farcaster Frames-style experiences to Discord.",
			source: "Discord Blog",
			date: "Jun 20, 2026",
			link: "https://discord.com/developers",
		},
		{
			title: "Hermes Agent: Autonomous AI with Tool Use",
			summary:
				"Hermes Agent by Nous Research enables autonomous AI workflows with persistent memory, MCP tool integration, and multi-agent delegation. Now supports Discord widgets for rich responses.",
			source: "Nous Research",
			date: "Jun 19, 2026",
			link: "https://hermes-agent.nousresearch.com",
		},
	];

	for (let i = 0; i < items.length; i++) {
		const png = await renderToPng(
			<RssFeedCard
				item={items[i]}
				currentIndex={i}
				totalItems={items.length}
				color="#5865f2"
			/>,
			{
				width: 800,
				height: 480,
				fonts: [{ name: "Liberation Sans", data: fontData }],
			},
		);

		writeFileSync(join(DEMO_DIR, `rss-demo-${i + 1}.png`), png);
		console.log(`✅ RssFeedCard #${i + 1} (${(png.length / 1024).toFixed(1)}KB)`);
	}
}

async function main() {
	const fontData = readFileSync(
		join(DEMO_DIR, "fonts/LiberationSans-Regular.ttf"),
	);

	await renderWeatherCard(fontData);
	await renderRssFeedCards(fontData);
	console.log("\n🎉 Done!");
}

main().catch(console.error);

import { renderToPng } from "./engine.js";
import { WeatherCard } from "./components/WeatherCard.js";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

async function main() {
	console.log("🎨 Rendering WeatherCard widget...");

	// Load font for Satori
	const fontData = readFileSync(
		join(import.meta.dirname ?? ".", "fonts/LiberationSans-Regular.ttf"),
	);

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
			fonts: [
				{
					name: "Liberation Sans",
					data: fontData,
					weight: 400,
					style: "normal",
				},
			],
		},
	);

	const outPath = join(import.meta.dirname ?? ".", "weather-demo.png");
	writeFileSync(outPath, png);
	console.log(`✅ Saved to ${outPath} (${(png.length / 1024).toFixed(1)}KB)`);
}

main().catch(console.error);

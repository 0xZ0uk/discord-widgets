import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { ReactNode } from "react";

export interface RenderOptions {
	width?: number;
	height?: number;
	fonts?: FontConfig[];
}

export interface FontConfig {
	name: string;
	data: ArrayBuffer | Uint8Array;
	style?: "normal" | "italic";
	weight?: number;
}

/**
 * Render a React component to PNG buffer using Satori.
 *
 * Pipeline: React JSX → Satori (SVG) → Resvg (PNG) → Buffer
 */
export async function renderToPng(
	component: ReactNode,
	options: RenderOptions = {},
): Promise<Buffer> {
	const { width = 800, height = 400, fonts = [] } = options;

	// Step 1: React → SVG via Satori
	const svg = await satori(component, {
		width,
		height,
		fonts: fonts.map((f) => ({
			name: f.name,
			data: f.data,
			style: f.style ?? "normal",
			weight: f.weight ?? 400,
		})),
	});

	// Step 2: SVG → PNG via Resvg
	const resvg = new Resvg(svg, {
		fitTo: { mode: "width", value: width },
	});
	const pngData = resvg.render();

	return Buffer.from(pngData.asPng());
}

/**
 * Render a React component to data URL (for Discord embeds).
 */
export async function renderToDataUrl(
	component: ReactNode,
	options: RenderOptions = {},
): Promise<string> {
	const png = await renderToPng(component, options);
	return `data:image/png;base64,${png.toString("base64")}`;
}

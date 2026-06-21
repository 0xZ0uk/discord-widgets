import { render } from "takumi-js";
import type { ReactNode } from "react";
import React from "react";

// Ensure React is globally available for Takumi's JSX processing
// (needed when tsx doesn't properly apply the react-jsx transform)
if (typeof globalThis.React === "undefined") {
	globalThis.React = React;
}

export interface RenderOptions {
	width?: number;
	height?: number;
}

/**
 * Render a React component to PNG buffer using Takumi.
 *
 * Pipeline: React JSX → Takumi (Rust) → PNG → Buffer
 */
export async function renderToPng(
	component: ReactNode,
	options: RenderOptions = {},
): Promise<Buffer> {
	const { width = 800, height = 400 } = options;

	const buffer = await render(component, {
		width,
		height,
	});

	return Buffer.from(buffer);
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

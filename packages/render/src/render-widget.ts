import React from "react";
import { renderToHostedUrl } from "./hosted.js";
import { widgetRegistry } from "./registry.js";

export interface RenderWidgetResult {
	url: string;
	width: number;
	height: number;
}

export async function renderWidgetByName(
	name: string,
	data: Record<string, unknown> = {},
	options: { width?: number; height?: number } = {},
): Promise<RenderWidgetResult> {
	const Component = widgetRegistry[name];
	if (!Component) {
		throw new Error(`Widget "${name}" not found in registry`);
	}

	const width = options.width ?? 800;
	const height = options.height ?? 400;

	const url = await renderToHostedUrl(
		React.createElement(Component, data),
		{ width, height },
	);

	return { url, width, height };
}

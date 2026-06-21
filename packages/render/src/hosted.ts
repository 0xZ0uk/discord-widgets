import type { ReactNode } from "react";
import type { RenderOptions } from "./engine.js";
import { renderToPng } from "./engine.js";
import { uploadToR2 } from "./upload.js";

export async function renderToHostedUrl(
	component: ReactNode,
	options: RenderOptions = {},
): Promise<string> {
	const buffer = await renderToPng(component, options);
	const key = `widget-${Date.now()}.png`;
	return uploadToR2(buffer, key);
}

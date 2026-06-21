import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import type { RenderOptions } from "./engine.js";
import { renderToPng } from "./engine.js";
import { isR2Configured, uploadToR2 } from "./upload.js";

const LOCAL_OUTPUT_DIR = "out";

export async function renderToHostedUrl(
	component: ReactNode,
	options: RenderOptions = {},
): Promise<string> {
	const buffer = await renderToPng(component, options);
	const key = `widget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;

	if (isR2Configured()) {
		return uploadToR2(buffer, key);
	}

	// Fallback: save locally and return file path
	writeFileSync(join(LOCAL_OUTPUT_DIR, key), buffer);
	return `./${LOCAL_OUTPUT_DIR}/${key}`;
}

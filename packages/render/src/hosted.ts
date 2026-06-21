import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import type { RenderOptions } from "./engine.js";
import { renderToPng } from "./engine.js";

const OUT_DIR = "out";

export async function renderToHostedUrl(
	component: ReactNode,
	options: RenderOptions = {},
): Promise<string> {
	const buffer = await renderToPng(component, options);
	const key = `widget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;

	mkdirSync(OUT_DIR, { recursive: true });
	const filePath = join(OUT_DIR, key);
	writeFileSync(filePath, buffer);

	return filePath;
}

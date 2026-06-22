import type { Widget } from "#/types/widget";

export function formatFileSize(bytes: number): string {
	return `${(bytes / 1024).toFixed(1)} KB`;
}

export function formatRenderTime(ms: number): string {
	return `${ms.toFixed(1)} ms`;
}

export function deriveProps(widget: Widget | null): Record<string, unknown> {
	if (!widget?.fields) return {};
	const p: Record<string, unknown> = {};
	for (const f of widget.fields) {
		p[f.name] = f.value;
	}
	return p;
}

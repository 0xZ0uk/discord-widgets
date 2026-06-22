import type { Widget } from "#/types/widget";

export function formatFileSize(bytes: number): string {
	return `${(bytes / 1024).toFixed(1)} KB`;
}

export function formatRenderTime(ms: number): string {
	return `${ms.toFixed(1)} ms`;
}

/** Map Discord button style names to shadcn Button variant names. */
export function styleToVariant(
	style: string | undefined,
): "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" {
	const map: Record<string, "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"> = {
		primary: "default",
		secondary: "secondary",
		link: "link",
		danger: "destructive",
		success: "default",
	};
	return map[style ?? ""] ?? "default";
}

export function deriveProps(widget: Widget | null): Record<string, unknown> {
	if (!widget?.fields) return {};
	const p: Record<string, unknown> = {};
	for (const f of widget.fields) {
		const key = f.prop ?? f.name;
		const parts = key.split(".");
		let obj = p;
		for (let i = 0; i < parts.length - 1; i++) {
			if (typeof obj[parts[i]] !== "object" || obj[parts[i]] === null) {
				obj[parts[i]] = {};
			}
			obj = obj[parts[i]] as Record<string, unknown>;
		}
		obj[parts[parts.length - 1]] = f.value;
	}
	return p;
}

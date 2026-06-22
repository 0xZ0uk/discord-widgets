export function formatFileSize(bytes: number): string {
	return `${(bytes / 1024).toFixed(1)} KB`;
}

export function formatRenderTime(ms: number): string {
	return `${ms.toFixed(1)} ms`;
}

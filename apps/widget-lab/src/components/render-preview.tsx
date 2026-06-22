import { formatFileSize, formatRenderTime } from "#/lib/widget";
import type { RenderMeta } from "#/types/widget";

interface RenderPreviewProps {
	imageUrl: string;
	meta: RenderMeta | null;
	loading: boolean;
	error: string;
}

export function RenderPreview({
	imageUrl,
	meta,
	loading,
	error,
}: RenderPreviewProps) {
	if (error) {
		return <div className="text-red-400 text-sm">{error}</div>;
	}

	if (loading) {
		return (
			<div className="flex flex-col items-center gap-2 text-gray-400 text-sm">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				Rendering...
			</div>
		);
	}

	if (!imageUrl) {
		return (
			<div className="text-muted-foreground text-sm">No widget selected</div>
		);
	}

	return (
		<div className="rounded-xl border border-white/5 bg-[#2b2d31] p-4">
			<img
				src={imageUrl}
				alt="Widget preview"
				className="max-w-full rounded-lg shadow-lg"
			/>
			{meta && (
				<div className="mt-4 space-y-1 border-white/5 border-t pt-3 text-sm">
					<div className="flex justify-between">
						<span className="text-gray-400">Dimensions</span>
						<span className="text-white">
							{meta.width} × {meta.height}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-gray-400">File size</span>
						<span className="text-white">{formatFileSize(meta.fileSize)}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-gray-400">Render time</span>
						<span className="text-white">
							{formatRenderTime(meta.renderTime)}
						</span>
					</div>
				</div>
			)}
		</div>
	);
}

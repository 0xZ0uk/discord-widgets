import { formatFileSize, formatRenderTime } from "#/lib/widget";
import type { RenderMeta } from "#/types/widget";

interface RenderMetaDetailsProps {
	meta: RenderMeta | null;
	loading?: boolean;
}

export function RenderMetaDetails({ meta, loading }: RenderMetaDetailsProps) {
	return (
		<div className="flex w-full flex-col border-b p-4">
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground text-xs">Dimensions</p>
				<p className="text-foreground text-sm">
					{!loading && meta ? `${meta.width} x ${meta.height}` : "-"}
				</p>
			</div>
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground text-xs">File size</p>
				<p className="text-foreground text-sm">
					{!loading && meta ? formatFileSize(meta.fileSize) : "-"}
				</p>
			</div>
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground text-xs">Render time</p>
				<p className="text-foreground text-sm">
					{!loading && meta ? formatRenderTime(meta.renderTime) : "-"}
				</p>
			</div>
		</div>
	);
}

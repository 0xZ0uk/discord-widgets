import type { FunctionComponent } from "react";

export interface RssFeedItem {
	title: string;
	summary: string;
	thumbnail?: string;
	link?: string;
	source?: string;
	date?: string;
}

export interface RssFeedCardProps {
	item: RssFeedItem;
	currentIndex: number;
	totalItems: number;
	color?: string;
}

export const RssFeedCard: FunctionComponent<RssFeedCardProps> = ({
	item,
	currentIndex,
	totalItems,
	color = "#5865f2",
}) => {
	const hasThumbnail = Boolean(item.thumbnail);
	const sourceLine = `${item.source ?? "Feed"}${item.date ? ` • ${item.date}` : ""}`;

	return (
		<div tw="w-[800px] h-[480px] bg-[linear-gradient(135deg,#0f0f23,#1a1a2e,#16213e)] rounded-3xl flex flex-col font-sans text-white overflow-hidden">
			{/* Accent bar */}
			<div tw="h-1" style={{ background: color }} />

			{/* Content area */}
			<div
				tw="flex flex-1 py-10 px-12"
				style={{ gap: hasThumbnail ? "32px" : "0" }}
			>
				{/* Text column */}
				<div tw="flex flex-col flex-1 justify-between min-w-0">
					{/* Source */}
					<div tw="text-[13px] opacity-60 mb-4">{sourceLine}</div>

					{/* Title */}
					<div tw="text-[32px] font-bold leading-[1.25] mb-5">{item.title}</div>

					{/* Summary */}
					<div tw="text-lg leading-[1.6] opacity-75 flex-1">{item.summary}</div>

					{/* Progress dots */}
					<div tw="flex items-center gap-2 mt-6">
						<div
							tw="h-2 rounded"
							style={{
								width: currentIndex === 0 ? "24px" : "8px",
								background:
									currentIndex === 0 ? color : "rgba(255,255,255,0.2)",
							}}
						/>
						<div
							tw="h-2 rounded"
							style={{
								width: currentIndex === 1 ? "24px" : "8px",
								background:
									currentIndex === 1 ? color : "rgba(255,255,255,0.2)",
							}}
						/>
						<div
							tw="h-2 rounded"
							style={{
								width: currentIndex === 2 ? "24px" : "8px",
								background:
									currentIndex === 2 ? color : "rgba(255,255,255,0.2)",
							}}
						/>
						<div tw="text-[13px] opacity-40 ml-2">
							{`${currentIndex + 1} / ${totalItems}`}
						</div>
					</div>
				</div>

				{/* Thumbnail */}
				{hasThumbnail ? (
					<div tw="w-[280px] h-[280px] rounded-2xl overflow-hidden shrink-0 self-center">
						<img src={item.thumbnail} alt="" tw="w-full h-full object-cover" />
					</div>
				) : null}
			</div>

			{/* Navigation bar */}
			<div tw="flex items-center justify-between py-4 px-12 border-t border-white/[0.08] bg-black/20">
				<div
					tw="text-sm font-medium"
					style={{ opacity: currentIndex > 0 ? 0.8 : 0.25 }}
				>
					{"← Previous"}
				</div>
				{item.link ? (
					<div
						tw="text-sm font-medium py-2 px-5 rounded-lg"
						style={{ color, background: `${color}20` }}
					>
						{"🔗 Read Article"}
					</div>
				) : null}
				<div
					tw="text-sm font-medium"
					style={{ opacity: currentIndex < totalItems - 1 ? 0.8 : 0.25 }}
				>
					{"Next →"}
				</div>
			</div>
		</div>
	);
};

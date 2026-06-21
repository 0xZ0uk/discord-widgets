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
		<div
			style={{
				width: "800px",
				height: "480px",
				background:
					"linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
				borderRadius: "24px",
				display: "flex",
				flexDirection: "column",
				fontFamily: "sans-serif",
				color: "white",
				overflow: "hidden",
			}}
		>
			{/* Accent bar — single child, no flex needed */}
			<div
				style={{
					height: "4px",
					background: color,
				}}
			/>

			{/* Content area */}
			<div
				style={{
					display: "flex",
					flex: 1,
					padding: "40px 48px",
					gap: hasThumbnail ? "32px" : "0",
				}}
			>
				{/* Text column */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						flex: 1,
						justifyContent: "space-between",
						minWidth: 0,
					}}
				>
					{/* Source — single text child */}
					<div style={{ fontSize: "13px", opacity: 0.6, marginBottom: "16px" }}>
						{sourceLine}
					</div>

					{/* Title — single text child */}
					<div
						style={{
							fontSize: "32px",
							fontWeight: 700,
							lineHeight: 1.25,
							marginBottom: "20px",
						}}
					>
						{item.title}
					</div>

					{/* Summary — single text child */}
					<div style={{ fontSize: "18px", lineHeight: 1.6, opacity: 0.75, flex: 1 }}>
						{item.summary}
					</div>

					{/* Progress dots */}
					<div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px" }}>
						<div
							style={{
								width: currentIndex === 0 ? "24px" : "8px",
								height: "8px",
								borderRadius: "4px",
								background: currentIndex === 0 ? color : "rgba(255,255,255,0.2)",
							}}
						/>
						<div
							style={{
								width: currentIndex === 1 ? "24px" : "8px",
								height: "8px",
								borderRadius: "4px",
								background: currentIndex === 1 ? color : "rgba(255,255,255,0.2)",
							}}
						/>
						<div
							style={{
								width: currentIndex === 2 ? "24px" : "8px",
								height: "8px",
								borderRadius: "4px",
								background: currentIndex === 2 ? color : "rgba(255,255,255,0.2)",
							}}
						/>
						<div style={{ fontSize: "13px", opacity: 0.4, marginLeft: "8px" }}>
							{`${currentIndex + 1} / ${totalItems}`}
						</div>
					</div>
				</div>

				{/* Thumbnail — single child (img) */}
				{hasThumbnail ? (
					<div
						style={{
							width: "280px",
							height: "280px",
							borderRadius: "16px",
							overflow: "hidden",
							flexShrink: 0,
							alignSelf: "center",
						}}
					>
						<img
							src={item.thumbnail}
							alt=""
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
							}}
						/>
					</div>
				) : null}
			</div>

			{/* Navigation bar */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "16px 48px",
					borderTop: "1px solid rgba(255,255,255,0.08)",
					background: "rgba(0,0,0,0.2)",
				}}
			>
				<div
					style={{
						fontSize: "14px",
						fontWeight: 500,
						opacity: currentIndex > 0 ? 0.8 : 0.25,
					}}
				>
					{`← Previous`}
				</div>
				{item.link ? (
					<div
						style={{
							fontSize: "14px",
							fontWeight: 500,
							color: color,
							background: `${color}20`,
							padding: "8px 20px",
							borderRadius: "8px",
						}}
					>
						{`🔗 Read Article`}
					</div>
				) : null}
				<div
					style={{
						fontSize: "14px",
						fontWeight: 500,
						opacity: currentIndex < totalItems - 1 ? 0.8 : 0.25,
					}}
				>
					{`Next →`}
				</div>
			</div>
		</div>
	);
};

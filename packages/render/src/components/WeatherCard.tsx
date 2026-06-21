import type { FunctionComponent } from "react";

export interface WeatherCardProps {
	location: string;
	temp: string;
	condition: string;
	icon?: string;
	color?: string;
}

export const WeatherCard: FunctionComponent<WeatherCardProps> = ({
	location,
	temp,
	condition,
	icon = "🌤️",
	color = "#3498db",
}) => {
	return (
		<div
			style={{
				width: "800px",
				height: "400px",
				background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
				borderRadius: "24px",
				padding: "48px",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				fontFamily: "sans-serif",
				color: "white",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Accent bar */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: "4px",
					background: color,
				}}
			/>

			{/* Header */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
					}}
				>
					<div style={{ fontSize: "16px", opacity: 0.6, marginBottom: "4px" }}>
						WEATHER
					</div>
					<div style={{ fontSize: "32px", fontWeight: 700 }}>{location}</div>
				</div>
				<div style={{ fontSize: "64px" }}>{icon}</div>
			</div>

			{/* Main content */}
			<div
				style={{
					display: "flex",
					alignItems: "flex-end",
					justifyContent: "space-between",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
					}}
				>
					<div
						style={{
							fontSize: "96px",
							fontWeight: 800,
							lineHeight: 1,
						}}
					>
						{temp}
					</div>
					<div
						style={{
							fontSize: "24px",
							opacity: 0.8,
							marginTop: "8px",
						}}
					>
						{condition}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div
				style={{
					fontSize: "14px",
					opacity: 0.4,
					textAlign: "right",
				}}
			>
				Powered by Discord Widgets
			</div>
		</div>
	);
};

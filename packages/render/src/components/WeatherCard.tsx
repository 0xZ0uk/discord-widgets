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
			tw="w-[800px] h-[400px] bg-[linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)] rounded-3xl p-12 flex flex-col justify-between font-sans text-white relative overflow-hidden"
		>
			{/* Accent bar */}
			<div
				tw="absolute top-0 left-0 right-0 h-1"
				style={{ background: color }}
			/>

			{/* Header */}
			<div tw="flex justify-between items-start">
				<div tw="flex flex-col">
					<div tw="text-sm opacity-60 mb-1">
						WEATHER
					</div>
					<div tw="text-[32px] font-bold">{location}</div>
				</div>
				<div tw="text-6xl">{icon}</div>
			</div>

			{/* Main content */}
			<div tw="flex items-end justify-between">
				<div tw="flex flex-col">
					<div
						tw="text-[96px] font-extrabold leading-none"
					>
						{temp}
					</div>
					<div
						tw="text-2xl opacity-80 mt-2"
					>
						{condition}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div
				tw="text-sm opacity-40 text-right"
			>
				Powered by Discord Widgets
			</div>
		</div>
	);
};

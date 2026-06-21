import type { FunctionComponent } from "react";

export interface CryptoPricesProps {
	// Add your widget props here
	title: string;
	color?: string;
}

export const CryptoPrices: FunctionComponent<CryptoPricesProps> = ({
	title,
	color = "#5865f2",
}) => {
	return (
		<div style={{
			width: "800px",
			height: "480px",
			background: "#0f0f23",
			borderRadius: "24px",
			display: "flex",
			flexDirection: "column",
			fontFamily: "sans-serif",
			color: "white",
			padding: "48px",
		}}>
			{/* Source / label */}
			<div style={{ fontSize: "13px", fontWeight: 600, color: color, marginBottom: "16px", textTransform: "uppercase" }}>
				{title}
			</div>

			{/* Content — add your widget content here */}
			<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
				<div style={{ fontSize: "48px", opacity: 0.3 }}>Widget content goes here</div>
			</div>

			{/* Footer */}
			<div style={{ fontSize: "14px", opacity: 0.4, textAlign: "right" }}>
				{"Powered by Discord Widgets"}
			</div>
		</div>
	);
};

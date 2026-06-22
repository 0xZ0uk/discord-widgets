import type { FunctionComponent } from "react";

export interface CryptoPricesProps {
	coin: string;
	symbol: string;
	price: string;
	change24h: string;
	source?: string;
	color?: string;
}

export const CryptoPrices: FunctionComponent<CryptoPricesProps> = ({
	coin,
	symbol,
	price,
	change24h,
	source = "CoinGecko",
	color = "#f7931a",
}) => {
	const isPositive = change24h.startsWith("+");
	const changeColor = isPositive ? "#00d97e" : "#e63946";

	return (
		<div tw="w-[800px] h-[400px] bg-zinc-900 rounded-3xl p-12 flex flex-col justify-between font-sans text-white relative overflow-hidden">
			{/* Accent bar */}
			<div
				tw="absolute top-0 left-0 right-0 h-1"
				style={{ background: color }}
			/>

			{/* Header */}
			<div tw="flex justify-between items-start">
				<div tw="flex flex-col">
					<div tw="text-sm opacity-60 mb-1 uppercase">Price Tracker</div>
					<div tw="text-[32px] font-bold">
						{coin}
						<span tw="text-lg opacity-50 ml-3">({symbol})</span>
					</div>
				</div>
			</div>

			{/* Main content */}
			<div tw="flex items-end justify-between">
				<div tw="flex flex-col">
					<div tw="text-[96px] font-extrabold leading-none">{price}</div>
					<div tw="text-2xl font-semibold mt-2" style={{ color: changeColor }}>
						{change24h}
					</div>
					<div tw="text-sm opacity-60 mt-1">24h change</div>
				</div>
			</div>

			{/* Footer */}
			<div tw="flex justify-between items-center text-sm opacity-40">
				<div>Source: {source}</div>
			</div>
		</div>
	);
};

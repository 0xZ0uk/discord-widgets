import { useState } from "react";
import type { Widget } from "#/types/widget";
import { styleToVariant } from "#/lib/widget";
import { Button } from "./ui/button";

interface InteractionSimulatorProps {
	widget: Widget | null;
	onStateChange?: (state: Record<string, unknown>) => void;
}

interface InteractionEntry {
	button: NonNullable<Widget["buttons"]>[number];
	timestamp: number;
	payload: Record<string, unknown>;
}

export function InteractionSimulator({
	widget,
	onStateChange,
}: InteractionSimulatorProps) {
	const [history, setHistory] = useState<InteractionEntry[]>([]);

	const handleClick = (button: NonNullable<Widget["buttons"]>[number]) => {
		const payload: Record<string, unknown> = {
			type: 3,
			custom_id: button.action?.handler ?? button.label.toLowerCase(),
			component_type: 2,
			message: {
				id: "mock_msg_001",
				channel_id: "mock_channel_001",
				author: { id: "mock_user_001", username: "PreviewUser" },
				timestamp: new Date().toISOString(),
			},
		};

		setHistory((prev) => [...prev, { button, timestamp: Date.now(), payload }]);

		if (button.action?.handler) {
			onStateChange?.({
				lastHandler: button.action.handler,
				lastLabel: button.label,
			});
		}
	};

	const clearLog = () => setHistory([]);

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-center gap-2">
				{(widget?.buttons ?? []).length === 0 && (
					<span className="text-gray-500 text-sm">
						No buttons on this widget
					</span>
				)}
				{(widget?.buttons ?? []).map((button) => (
					<Button
						key={button.label}
						type="button"
						variant={styleToVariant(button.style)}
						onClick={() => handleClick(button)}
						className={"cursor-pointer font-medium text-sm transition-colors"}
					>
						{button.label}
						{button.style === "link" && button.action?.url && (
							<span className="ml-2 text-xs opacity-70">↗</span>
						)}
					</Button>
				))}
				{history.length > 0 && (
					<Button
						type="button"
						onClick={clearLog}
						variant="destructive"
						className="ml-auto cursor-pointer"
						size="sm"
					>
						Clear Log
					</Button>
				)}
			</div>

			{history.length > 0 && (
				<div className="space-y-2">
					<div className="text-muted-foreground text-xs uppercase tracking-wide">
						Interaction Log ({history.length})
					</div>

					<div className="max-h-48 space-y-1 overflow-y-auto">
						{[...history].reverse().map((entry, i) => (
							<div
								key={entry.timestamp}
								className="flex items-center justify-between rounded-lg bg-[#1e1f22] px-3 py-2 text-sm"
							>
								<div className="flex items-center gap-2">
									<span className="text-gray-400 text-xs">
										#{history.length - i}
									</span>
									<span className="font-medium">{entry.button.label}</span>
									<span className="rounded bg-white/5 px-1.5 py-0.5 text-gray-400 text-xs">
										{entry.button.style ?? "secondary"}
									</span>
									{entry.button.action?.type && (
										<span className="rounded bg-white/5 px-1.5 py-0.5 text-gray-400 text-xs">
											{entry.button.action.type}
										</span>
									)}
								</div>
								<div className="text-gray-500 text-xs">
									{entry.button.action?.handler
										? `custom_id: ${entry.button.action.handler}`
										: `custom_id: ${entry.button.label.toLowerCase()}`}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

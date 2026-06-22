import { useState } from "react";
import type { Widget } from "#/types/widget";

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
	onStateChange: _onStateChange,
}: InteractionSimulatorProps) {
	const [history, setHistory] = useState<InteractionEntry[]>([]);

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-center gap-2">
				{(widget?.buttons ?? []).length === 0 && (
					<span className="text-gray-500 text-sm">
						No buttons on this widget
					</span>
				)}
			</div>
		</div>
	);
}

import { useCallback, useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import type { RenderMeta } from "#/types/widget";

interface ExportPanelProps {
	imageUrl: string;
	meta: RenderMeta | null;
	embedDirective: string;
	apiPayload: string;
}

export function ExportPanel({
	imageUrl,
	meta,
	embedDirective,
	apiPayload,
}: ExportPanelProps) {
	const [feedback, setFeedback] = useState<string | null>(null);

	useEffect(() => {
		if (!feedback) return;
		const id = setTimeout(() => setFeedback(null), 2000);
		return () => clearTimeout(id);
	}, [feedback]);

	const copy = useCallback(async (label: string, text: string) => {
		await navigator.clipboard.writeText(text);
		setFeedback(label);
	}, []);

	const download = useCallback(() => {
		const a = document.createElement("a");
		a.href = imageUrl;
		a.download = meta
			? `widget-${meta.width}x${meta.height}.png`
			: "widget.png";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}, [imageUrl, meta]);

	return (
		<div>
			<div className="space-y-2">
				<Button
					type="button"
					onClick={() => copy("Copied!", imageUrl)}
					disabled={!imageUrl}
					className="w-full cursor-pointer rounded-md font-medium disabled:opacity-50"
				>
					Copy PNG URL
				</Button>
				<Button
					type="button"
					onClick={download}
					disabled={!imageUrl}
					className="w-full cursor-pointer rounded-md font-medium disabled:opacity-50"
				>
					Download PNG
				</Button>
				<Button
					type="button"
					onClick={() => copy("Copied!", embedDirective)}
					disabled={!embedDirective}
					className="w-full cursor-pointer rounded-md font-medium"
				>
					Copy Embed Directive
				</Button>
				<Button
					type="button"
					onClick={() => copy("Copied!", apiPayload)}
					disabled={!apiPayload}
					className="w-full cursor-pointer rounded-md font-medium"
				>
					Copy API Payload
				</Button>
			</div>
			{feedback && (
				<div className="mt-2 text-center text-green-400 text-xs">
					{feedback}
				</div>
			)}
		</div>
	);
}

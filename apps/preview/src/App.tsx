import { useCallback, useEffect, useMemo, useState } from "react";
import { CatalogSidebar } from "./components/CatalogSidebar";
import { EmbedTester } from "./components/EmbedTester";
import { ExportPanel } from "./components/ExportPanel";
import { InteractionSimulator } from "./components/InteractionSimulator";
import { PropsEditor } from "./components/PropsEditor";
import { RenderPreview } from "./components/RenderPreview";
import type { RenderMeta, Widget } from "./types";

type Tab = "interaction" | "embed" | "export";

function deriveProps(widget: Widget | null): Record<string, unknown> {
	if (!widget?.fields) return {};
	const p: Record<string, unknown> = {};
	for (const f of widget.fields) {
		p[f.name] = f.value;
	}
	return p;
}

export function App() {
	const [widgets, setWidgets] = useState<Widget[]>([]);
	const [selected, setSelected] = useState("");
	const [props, setProps] = useState<Record<string, unknown>>({});
	const [imageUrl, setImageUrl] = useState("");
	const [meta, setMeta] = useState<RenderMeta | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [embedDirective, setEmbedDirective] = useState("");
	const [apiPayload, setApiPayload] = useState("");
	const [tab, setTab] = useState<Tab>("interaction");

	// Fetch widget list on mount
	useEffect(() => {
		fetch("/api/widgets")
			.then((r) => r.json())
			.then((data: unknown) => {
				const w = data as Widget[];
				setWidgets(w);
				if (w.length > 0) setSelected(w[0]?.name ?? "");
			})
			.catch((err) => setError(`Failed to load widgets: ${err.message}`));
	}, []);

	const currentWidget = useMemo(
		() => widgets.find((w) => w.name === selected) ?? null,
		[widgets, selected],
	);

	// Reset props when selection changes
	useEffect(() => {
		setProps(deriveProps(currentWidget));
	}, [currentWidget]);

	const fetchRender = useCallback(
		async (customProps?: Record<string, unknown>) => {
			const name = selected;
			if (!name) return;

			setLoading(true);
			setError("");

			try {
				const url = `/api/render/${name}`;
				const options: RequestInit = customProps
					? {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ props: customProps }),
						}
					: {};

				const res = await fetch(url, options);
				if (!res.ok) {
					const body = (await res.json()) as { error?: string };
					throw new Error(body.error ?? `HTTP ${res.status}`);
				}
				const result = (await res.json()) as RenderMeta;
				setImageUrl(result.url);
				setMeta(result);
			} catch (err) {
				setError(
					`Render failed: ${err instanceof Error ? err.message : String(err)}`,
				);
				setImageUrl("");
				setMeta(null);
			} finally {
				setLoading(false);
			}
		},
		[selected],
	);

	// Auto-render when selected changes
	useEffect(() => {
		fetchRender();
	}, [fetchRender]);

	const handleSelect = useCallback((name: string) => {
		setSelected(name);
		setImageUrl("");
		setMeta(null);
		setEmbedDirective("");
		setApiPayload("");
	}, []);

	const handleEmbedChange = useCallback(
		(directive: string, payload: string) => {
			setEmbedDirective(directive);
			setApiPayload(payload);
		},
		[],
	);

	const tabs: { key: Tab; label: string }[] = [
		{ key: "interaction", label: "Interaction" },
		{ key: "embed", label: "Embed Tester" },
		{ key: "export", label: "Export" },
	];

	return (
		<div className="flex h-screen bg-background font-sans text-foreground">
			{/* Left: Catalog Sidebar */}
			<CatalogSidebar
				widgets={widgets}
				selected={selected}
				onSelect={handleSelect}
			/>

			{/* Main content area */}
			<div className="flex flex-1 flex-col">
				{/* Header */}
				<header className="border-b bg-card px-6 py-3 text-card-foreground">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="font-bold text-lg">Discord Widgets Preview</h1>
							<p className="text-gray-400 text-sm">
								Render widget previews as PNG images
							</p>
						</div>
					</div>
				</header>

				{/* 3-panel layout */}
				<div className="flex flex-1 gap-4 overflow-hidden p-4">
					{/* Center: Render Preview */}
					<div className="flex flex-1 flex-col gap-4 overflow-y-auto">
						<RenderPreview
							imageUrl={imageUrl}
							meta={meta}
							loading={loading}
							error={error}
						/>

						{/* Bottom tabs */}
						<div className="rounded-xl border border-white/5 bg-[#2b2d31] p-4">
							<div className="mb-3 flex gap-4 border-white/10 border-b">
								{tabs.map((t) => (
									<button
										key={t.key}
										type="button"
										onClick={() => setTab(t.key)}
										className={`cursor-pointer border-b-2 pb-2 font-medium text-sm transition-colors ${
											tab === t.key
												? "border-[#5865f2] text-white"
												: "border-transparent text-gray-400 hover:text-white"
										}`}
									>
										{t.label}
									</button>
								))}
							</div>

							{tab === "interaction" && (
								<InteractionSimulator widget={currentWidget} />
							)}
							{tab === "embed" && (
								<EmbedTester
									widget={currentWidget}
									imageUrl={imageUrl}
									onEmbedDirectiveChange={handleEmbedChange}
								/>
							)}
							{tab === "export" && (
								<ExportPanel
									imageUrl={imageUrl}
									meta={meta}
									embedDirective={embedDirective}
									apiPayload={apiPayload}
								/>
							)}
						</div>
					</div>

					{/* Right: Props Editor */}
					<div className="w-72 shrink-0">
						<PropsEditor
							widget={currentWidget}
							props={props}
							onPropsChange={setProps}
							onRender={() => fetchRender(props)}
							loading={loading}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

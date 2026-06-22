import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo } from "react";
import { EmbedTester } from "#/components/embed-tester";
import { ExportPanel } from "#/components/export-panel";
import { InteractionSimulator } from "#/components/interaction-simulator";
import { PropsEditor } from "#/components/props-editor";
import { RenderMetaDetails } from "#/components/render-meta-details";
import { RenderPreview } from "#/components/render-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { type Tab, useWidgetStore } from "#/hooks/use-widget-store";
import { deriveProps } from "#/lib/widget";
import type { RenderMeta, Widget } from "#/types/widget";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const {
		widgets,
		selected,
		tab,
		imageUrl,
		meta,
		loading,
		error,
		props,
		embedDirective,
		apiPayload,
		setTab,
		setWidgets,
		setSelected,
		setError,
		setProps,
		setLoading,
		setImageUrl,
		setMeta,
		setEmbedDirective,
		setApiPayload,
	} = useWidgetStore();

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
	}, [setError, setSelected, setWidgets]);

	const currentWidget = useMemo(
		() => widgets.find((w) => w.name === selected) ?? null,
		[widgets, selected],
	);

	// Reset props when selection changes
	useEffect(() => {
		setProps(deriveProps(currentWidget));
	}, [currentWidget, setProps]);

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
		[selected, setError, setImageUrl, setLoading, setMeta],
	);

	// Auto-render when selected changes
	useEffect(() => {
		fetchRender();
	}, [fetchRender]);

	const handleSelect = useCallback(
		(name: string) => {
			setSelected(name);
			setImageUrl("");
			setMeta(null);
			setEmbedDirective("");
			setApiPayload("");
		},
		[setApiPayload, setEmbedDirective, setImageUrl, setMeta, setSelected],
	);

	const handleEmbedChange = useCallback(
		(directive: string, payload: string) => {
			setEmbedDirective(directive);
			setApiPayload(payload);
		},
		[setEmbedDirective, setApiPayload],
	);

	const tabs: { key: Tab; label: string }[] = [
		{ key: "interaction", label: "Interaction Simulator" },
		{ key: "embed", label: "Embed Tester" },
		{ key: "export", label: "Export" },
	];

	return (
		<div className="flex h-[calc(100vh-3rem)] w-full flex-col">
			<div className="flex min-h-0 w-full flex-2 items-center justify-center border-border border-b">
				<div className="flex h-full basis-3/4 items-center justify-center">
					<RenderPreview imageUrl={imageUrl} loading={loading} error={error} />
				</div>
				<div className="h-full basis-1/4 border-border border-l bg-card">
					<RenderMetaDetails meta={meta} loading={loading} />
					<PropsEditor
						widget={currentWidget}
						props={props}
						onPropsChange={setProps}
						onRender={() => fetchRender(props)}
						loading={loading}
					/>
				</div>
			</div>
			<div className="min-h-0 flex-1 bg-card p-4">
				<Tabs
					value={tab}
					onValueChange={(v) => setTab(v as Tab)}
					className="w-full"
				>
					<TabsList>
						{tabs.map((t) => (
							<TabsTrigger value={t.key} key={t.key}>
								{t.label}
							</TabsTrigger>
						))}
					</TabsList>
					<TabsContent value="interaction">
						<InteractionSimulator widget={currentWidget} />
					</TabsContent>
					<TabsContent value="embed">
						<EmbedTester
							widget={currentWidget}
							imageUrl={imageUrl}
							onEmbedDirectiveChange={handleEmbedChange}
						/>
					</TabsContent>
					<TabsContent value="export">
						<ExportPanel
							imageUrl={imageUrl}
							meta={meta}
							embedDirective={embedDirective}
							apiPayload={apiPayload}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

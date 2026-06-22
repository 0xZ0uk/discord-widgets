import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RenderPreview } from "#/components/render-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import type { RenderMeta, Widget } from "#/types/widget";

type Tab = "interaction" | "embed" | "export";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
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

	return (
		<div className="flex h-[calc(100vh-3rem)] w-full flex-col">
			<div className="flex min-h-0 w-full flex-2 items-center justify-center border-border border-b">
				<div className="flex h-full basis-3/4 items-center justify-center">
					<RenderPreview />
				</div>
				<div className="h-full basis-1/4 border-border border-l bg-card">
					<div className="flex w-full flex-col border-b p-4">
						<div className="flex items-center justify-between">
							<p className="text-muted-foreground text-xs">Dimensions</p>
							<p className="text-foreground text-sm">800 × 400</p>
						</div>
						<div className="flex items-center justify-between">
							<p className="text-muted-foreground text-xs">File size</p>
							<p className="text-foreground text-sm">21.3 KB</p>
						</div>
						<div className="flex items-center justify-between">
							<p className="text-muted-foreground text-xs">Render time</p>
							<p className="text-foreground text-sm">28.2 ms</p>
						</div>
					</div>
					<div className="flex w-full flex-col p-4">
						<p className="font-medium text-muted-foreground text-xs uppercase">
							Properties
						</p>
					</div>
				</div>
			</div>
			<div className="min-h-0 flex-1 bg-card p-4">
				<Tabs defaultValue="account" className="w-full">
					<TabsList>
						<TabsTrigger value="interaction">Interaction Simulator</TabsTrigger>
						<TabsTrigger value="embed">Embed Tester</TabsTrigger>
						<TabsTrigger value="export">Export</TabsTrigger>
					</TabsList>
					<TabsContent value="interaction">
						Make changes to your account here.
					</TabsContent>
					<TabsContent value="embed">Change your password here.</TabsContent>
					<TabsContent value="export">Change your password here.</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

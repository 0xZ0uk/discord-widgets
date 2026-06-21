import { useCallback, useEffect, useState } from "react";

interface Widget {
	name: string;
	description: string;
	category?: string;
	component?: string;
	color?: string;
	fields?: Array<{ name: string; value: string; inline?: boolean }>;
	buttons?: Array<{
		label: string;
		style?: string;
		action?: { type: string; url?: string; handler?: string };
	}>;
}

export function App() {
	const [widgets, setWidgets] = useState<Widget[]>([]);
	const [selected, setSelected] = useState<string>("");
	const [imageUrl, setImageUrl] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");

	// Fetch widget list
	useEffect(() => {
		fetch("/api/widgets")
			.then((r) => r.json())
			.then((data: unknown) => {
				const widgets = data as Widget[];
				setWidgets(widgets);
				if (widgets.length > 0 && !selected) {
					setSelected(widgets[0]?.name ?? "");
				}
			})
			.catch((err) => setError(`Failed to load widgets: ${err.message}`));
	}, []);

	// Fetch rendered image when selection changes
	const fetchRender = useCallback(async (name: string) => {
		if (!name) return;

		setLoading(true);
		setError("");

		try {
			const res = await fetch(`/api/render/${name}`);
			if (!res.ok) {
				const body = (await res.json()) as { error?: string };
				throw new Error(body.error ?? `HTTP ${res.status}`);
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);

			// Revoke previous URL
			setImageUrl((prev) => {
				if (prev) URL.revokeObjectURL(prev);
				return url;
			});
		} catch (err) {
			setError(
				`Render failed: ${err instanceof Error ? err.message : String(err)}`,
			);
			setImageUrl("");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchRender(selected);
	}, [selected, fetchRender]);

	const currentIndex = widgets.findIndex((w) => w.name === selected);
	const currentWidget = widgets[currentIndex];
	const isFirst = currentIndex <= 0;
	const isLast = currentIndex >= widgets.length - 1;

	const goPrev = () => {
		if (!isFirst && currentIndex > 0) {
			setSelected(widgets[currentIndex - 1]?.name ?? "");
		}
	};

	const goNext = () => {
		if (!isLast && currentIndex < widgets.length - 1) {
			setSelected(widgets[currentIndex + 1]?.name ?? "");
		}
	};

	return (
		<div className="min-h-screen bg-[#313338] font-sans text-white">
			{/* Header */}
			<header className="border-white/10 border-b bg-[#2b2d31] px-6 py-4">
				<div className="mx-auto flex max-w-4xl items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="text-2xl">🎨</div>
						<div>
							<h1 className="font-bold text-lg">Discord Widgets Preview</h1>
							<p className="text-gray-400 text-sm">
								Render widget previews as PNG images
							</p>
						</div>
					</div>

					{/* Widget selector */}
					<div className="flex items-center gap-3">
						<label className="text-gray-400 text-sm" htmlFor="widget-select">
							Widget:
						</label>
						<select
							id="widget-select"
							value={selected}
							onChange={(e) =>
								setSelected((e.target as HTMLSelectElement).value)
							}
							className="cursor-pointer rounded-md border border-white/10 bg-[#1e1f22] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
						>
							{widgets.map((w) => (
								<option key={w.name} value={w.name}>
									{w.name} — {w.description}
								</option>
							))}
						</select>
						<button
							type="button"
							onClick={() => fetchRender(selected)}
							disabled={loading}
							className="cursor-pointer rounded-md bg-[#5865f2] px-3 py-2 font-medium text-sm text-white transition-colors hover:bg-[#4752c4] disabled:opacity-50"
						>
							{loading ? "..." : "↻ Refresh"}
						</button>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="mx-auto max-w-4xl px-6 py-8">
				{/* Widget info */}
				{currentWidget && (
					<div className="mb-6 rounded-xl border border-white/5 bg-[#2b2d31] p-4">
						<div className="mb-2 flex items-center gap-3">
							{currentWidget.color && (
								<div
									className="h-3 w-3 rounded-full"
									style={{ backgroundColor: currentWidget.color }}
								/>
							)}
							<h2 className="font-semibold text-lg capitalize">
								{currentWidget.name.replace("-", " ")}
							</h2>
							{currentWidget.category && (
								<span className="rounded-full bg-[#5865f2]/20 px-2 py-0.5 text-[#949cf7] text-xs">
									{currentWidget.category}
								</span>
							)}
						</div>
						<p className="text-gray-400 text-sm">{currentWidget.description}</p>
						{currentWidget.fields && currentWidget.fields.length > 0 && (
							<div className="mt-3 flex flex-wrap gap-3">
								{currentWidget.fields.map((f) => (
									<div key={f.name} className="text-gray-500 text-xs">
										<span className="text-gray-300">{f.name}:</span> {f.value}
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Rendered preview */}
				<div className="rounded-xl border border-white/5 bg-[#2b2d31] p-4">
					{error && (
						<div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-400 text-sm">
							{error}
						</div>
					)}

					<div className="flex min-h-[300px] items-center justify-center">
						{loading && (
							<div className="flex flex-col items-center gap-2 text-gray-400 text-sm">
								<div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
								Rendering...
							</div>
						)}
						{!loading && imageUrl && (
							<img
								src={imageUrl}
								alt={`${selected} widget preview`}
								className="max-w-full rounded-lg shadow-lg"
							/>
						)}
						{!loading && !imageUrl && !error && (
							<div className="text-gray-400 text-sm">No widget selected</div>
						)}
					</div>
				</div>

				{/* Discord embed buttons */}
				{currentWidget &&
					currentWidget.buttons &&
					currentWidget.buttons.length > 0 && (
						<div className="mt-4 rounded-xl border border-white/5 bg-[#2b2d31] p-4">
							<div className="mb-3 text-gray-500 text-xs uppercase tracking-wide">
								Embed Buttons
							</div>
							<div className="flex items-center gap-3">
								{/* Previous button */}
								<button
									type="button"
									onClick={goPrev}
									disabled={isFirst}
									className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 font-medium text-sm transition-colors ${
										isFirst
											? "cursor-not-allowed border-white/5 bg-white/5 text-gray-500 opacity-40"
											: "border-white/10 bg-[#4e5058]/50 text-white hover:border-white/20 hover:bg-[#4e5058]"
									}`}
								>
									← Previous
								</button>

								{/* Primary action buttons from widget definition */}
								{currentWidget.buttons
									.filter((b) => b.style === "primary")
									.map((btn) => (
										<button
											key={btn.label}
											type="button"
											className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-4 py-2 font-medium text-sm transition-colors"
											style={{
												backgroundColor: currentWidget.color ?? "#5865f2",
												color: "white",
											}}
										>
											{btn.label}
										</button>
									))}

								{/* Secondary buttons from widget definition */}
								{currentWidget.buttons
									.filter(
										(b) =>
											b.style === "secondary" &&
											b.label !== "Previous" &&
											b.label !== "Next",
									)
									.map((btn) => (
										<button
											key={btn.label}
											type="button"
											className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#4e5058]/50 px-4 py-2 font-medium text-sm text-white transition-colors hover:border-white/20 hover:bg-[#4e5058]"
										>
											{btn.label}
										</button>
									))}

								{/* Next button */}
								<button
									type="button"
									onClick={goNext}
									disabled={isLast}
									className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 font-medium text-sm transition-colors ${
										isLast
											? "cursor-not-allowed border-white/5 bg-white/5 text-gray-500 opacity-40"
											: "border-white/10 bg-[#4e5058]/50 text-white hover:border-white/20 hover:bg-[#4e5058]"
									}`}
								>
									Next →
								</button>
							</div>
						</div>
					)}

				{/* Widget count footer */}
				<div className="mt-6 text-center text-gray-500 text-xs">
					{widgets.length} widget{widgets.length !== 1 ? "s" : ""} in catalog ·
					Widget {currentIndex + 1} of {widgets.length}
				</div>
			</main>
		</div>
	);
}

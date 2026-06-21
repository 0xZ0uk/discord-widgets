import { useState, useEffect, useCallback } from "react";

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
			.then((data: Widget[]) => {
				setWidgets(data);
				if (data.length > 0 && !selected) {
					setSelected(data[0].name);
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
				const body = await res.json();
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
			setError(`Render failed: ${err instanceof Error ? err.message : String(err)}`);
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
			setSelected(widgets[currentIndex - 1].name);
		}
	};

	const goNext = () => {
		if (!isLast && currentIndex < widgets.length - 1) {
			setSelected(widgets[currentIndex + 1].name);
		}
	};

	return (
		<div className="min-h-screen bg-[#313338] text-white font-sans">
			{/* Header */}
			<header className="border-b border-white/10 bg-[#2b2d31] px-6 py-4">
				<div className="max-w-4xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="text-2xl">🎨</div>
						<div>
							<h1 className="text-lg font-bold">Discord Widgets Preview</h1>
							<p className="text-sm text-gray-400">
								Render widget previews as PNG images
							</p>
						</div>
					</div>

					{/* Widget selector */}
					<div className="flex items-center gap-3">
						<label className="text-sm text-gray-400" htmlFor="widget-select">
							Widget:
						</label>
						<select
							id="widget-select"
							value={selected}
							onChange={(e) => setSelected(e.target.value)}
							className="bg-[#1e1f22] text-white border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5865f2] cursor-pointer"
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
							className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm font-medium px-3 py-2 rounded-md transition-colors cursor-pointer"
						>
							{loading ? "..." : "↻ Refresh"}
						</button>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="max-w-4xl mx-auto py-8 px-6">
				{/* Widget info */}
				{currentWidget && (
					<div className="mb-6 p-4 bg-[#2b2d31] rounded-xl border border-white/5">
						<div className="flex items-center gap-3 mb-2">
							{currentWidget.color && (
								<div
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: currentWidget.color }}
								/>
							)}
							<h2 className="text-lg font-semibold capitalize">
								{currentWidget.name.replace("-", " ")}
							</h2>
							{currentWidget.category && (
								<span className="text-xs bg-[#5865f2]/20 text-[#949cf7] px-2 py-0.5 rounded-full">
									{currentWidget.category}
								</span>
							)}
						</div>
						<p className="text-sm text-gray-400">{currentWidget.description}</p>
						{currentWidget.fields && currentWidget.fields.length > 0 && (
							<div className="mt-3 flex flex-wrap gap-3">
								{currentWidget.fields.map((f) => (
									<div
										key={f.name}
										className="text-xs text-gray-500"
									>
										<span className="text-gray-300">{f.name}:</span>{" "}
										{f.value}
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Rendered preview */}
				<div className="bg-[#2b2d31] rounded-xl border border-white/5 p-4">
					{error && (
						<div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
							{error}
						</div>
					)}

					<div className="flex items-center justify-center min-h-[300px]">
						{loading && (
							<div className="text-gray-400 text-sm flex flex-col items-center gap-2">
								<div className="w-8 h-8 border-2 border-[#5865f2] border-t-transparent rounded-full animate-spin" />
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
				{currentWidget && currentWidget.buttons && currentWidget.buttons.length > 0 && (
					<div className="mt-4 bg-[#2b2d31] rounded-xl border border-white/5 p-4">
						<div className="text-xs text-gray-500 mb-3 uppercase tracking-wide">
							Embed Buttons
						</div>
						<div className="flex items-center gap-3">
							{/* Previous button */}
							<button
								type="button"
								onClick={goPrev}
								disabled={isFirst}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
									isFirst
										? "text-gray-500 border-white/5 bg-white/5 opacity-40 cursor-not-allowed"
										: "text-white border-white/10 bg-[#4e5058]/50 hover:bg-[#4e5058] hover:border-white/20"
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
										className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-transparent transition-colors cursor-pointer"
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
								.filter((b) => b.style === "secondary" && b.label !== "Previous" && b.label !== "Next")
								.map((btn) => (
									<button
										key={btn.label}
										type="button"
										className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white border border-white/10 bg-[#4e5058]/50 hover:bg-[#4e5058] hover:border-white/20 transition-colors cursor-pointer"
									>
										{btn.label}
									</button>
								))}

							{/* Next button */}
							<button
								type="button"
								onClick={goNext}
								disabled={isLast}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
									isLast
										? "text-gray-500 border-white/5 bg-white/5 opacity-40 cursor-not-allowed"
										: "text-white border-white/10 bg-[#4e5058]/50 hover:bg-[#4e5058] hover:border-white/20"
								}`}
							>
								Next →
							</button>
						</div>
					</div>
				)}

				{/* Widget count footer */}
				<div className="mt-6 text-center text-xs text-gray-500">
					{widgets.length} widget{widgets.length !== 1 ? "s" : ""} in catalog
					· Widget {currentIndex + 1} of {widgets.length}
				</div>
			</main>
		</div>
	);
}

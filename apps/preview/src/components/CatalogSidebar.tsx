import { useState } from "react";
import type { Widget } from "../types";

interface CatalogSidebarProps {
	widgets: Widget[];
	selected: string;
	onSelect: (name: string) => void;
}

export function CatalogSidebar({
	widgets,
	selected,
	onSelect,
}: CatalogSidebarProps) {
	const [query, setQuery] = useState("");

	const filtered = query
		? widgets.filter(
				(w) =>
					w.name.toLowerCase().includes(query.toLowerCase()) ||
					w.description.toLowerCase().includes(query.toLowerCase()),
			)
		: widgets;

	return (
		<aside className="flex w-72 flex-col bg-sidebar text-sidebar-foreground">
			<div className="border-white/10 border-b p-3">
				<input
					type="text"
					placeholder="Search widgets..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="w-full rounded-md bg-input px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>

			<nav className="flex-1 overflow-y-auto">
				{filtered.length === 0 && (
					<div className="px-4 py-8 text-center text-muted-foreground text-sm">
						No widgets match your search.
					</div>
				)}

				{filtered.map((widget) => {
					const isSelected = widget.name === selected;
					return (
						<button
							key={widget.name}
							type="button"
							onClick={() => onSelect(widget.name)}
							className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors ${
								isSelected
									? "border-primary border-l-2 bg-primary/20"
									: "border-transparent border-l-2 hover:bg-primary/5"
							}`}
						>
							<div
								className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
								style={{ backgroundColor: widget.color ?? "#5865f2" }}
							/>

							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<span className="truncate font-medium text-sm capitalize">
										{widget.name.replaceAll("-", " ")}
									</span>
									{widget.category && (
										<span className="shrink-0 rounded-full bg-[#5865f2]/20 px-2 py-0.5 text-[#949cf7] text-xs">
											{widget.category}
										</span>
									)}
								</div>
								<p className="truncate text-gray-400 text-xs">
									{widget.description}
								</p>
							</div>
						</button>
					);
				})}
			</nav>
		</aside>
	);
}

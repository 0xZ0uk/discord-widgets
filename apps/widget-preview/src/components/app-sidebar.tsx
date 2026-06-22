import { useState } from "react";
import { Input } from "#/components/ui/input";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "#/components/ui/sidebar";
import { useWidgetStore } from "#/hooks/use-widget-store";
import { cn } from "#/lib/utils";
import { ModeToggle } from "./mode-toggle";

export function AppSidebar() {
	const [query, setQuery] = useState("");

	const { widgets, selected, setSelected } = useWidgetStore();

	const filtered = query
		? widgets.filter(
				(w) =>
					w.name.toLowerCase().includes(query.toLowerCase()) ||
					w.description.toLowerCase().includes(query.toLowerCase()),
			)
		: widgets;

	return (
		<Sidebar>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<Input
							type="text"
							placeholder="Search Widgets"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
						/>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{filtered.length === 0 && (
								<div className="px-4 py-8 text-center text-muted-foreground text-sm">
									No widgets match your search.
								</div>
							)}

							{filtered.map((widget) => {
								const isSelected = widget.name === selected;

								return (
									<SidebarMenuItem key={widget.name}>
										<SidebarMenuButton
											className={cn(
												isSelected ? "bg-primary/20" : "hover:bg-primary/5",
											)}
											onClick={() => setSelected(widget.name)}
										>
											<div className="flex items-center gap-2">
												<div
													className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
													style={{ backgroundColor: widget.color ?? "#5865f2" }}
												/>
												<span className="truncate font-medium text-sm capitalize">
													{widget.name.replaceAll("-", " ")}
												</span>
											</div>
											<p className="truncate text-gray-400 text-xs">
												{widget.description}
											</p>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup />
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<ModeToggle />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}

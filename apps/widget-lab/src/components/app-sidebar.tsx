import { DollarSignIcon } from "lucide-react";
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
import { ModeToggle } from "./mode-toggle";

const widgets = [
	{
		id: 1,
		name: "Crypto Prices",
		type: "finance",
		description: "Cryptocurrency price tracker showing real-time market data",
		icon: DollarSignIcon,
		url: "",
	},
];

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<Input placeholder="Search Widgets" />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Utilities</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{widgets.map((widget) => (
								<SidebarMenuItem key={widget.id}>
									<SidebarMenuButton asChild>
										<a href={widget.url}>
											{widget.icon && <widget.icon />}
											<span>{widget.name}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
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

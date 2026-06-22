import { SidebarTrigger } from "#/components/ui/sidebar";
import { Button } from "./ui/button";

export function Header() {
	return (
		<header className="flex h-12 w-full items-center justify-start border-border border-b bg-card px-4">
			<div className="w-full basis-1/12">
				<SidebarTrigger />
			</div>
			<div className="flex w-full basis-10/12 items-center justify-center">
				<p className="text-primary text-sm">No Selected Widget</p>
			</div>
			<div className="flex w-full basis-1/12 justify-end">
				<Button variant="outline" size="sm">
					Action
				</Button>
			</div>
		</header>
	);
}

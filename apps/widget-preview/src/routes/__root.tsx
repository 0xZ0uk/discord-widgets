import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AppSidebar } from "#/components/app-sidebar";
import { Header } from "#/components/header";
import { ThemeProvider } from "#/components/theme-provider";
import { SidebarProvider } from "#/components/ui/sidebar";
import { Toaster } from "#/components/ui/sonner";
import { TooltipProvider } from "#/components/ui/tooltip";
import appCss from "../styles.css?url";

const { TanStackDevtools, TanStackRouterDevtoolsPanel } = import.meta.hot
	? await import("@tanstack/react-devtools")
	: { TanStackDevtools: null, TanStackRouterDevtoolsPanel: null };

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Discord Widgets — Widget Lab",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
					<TooltipProvider>
						<SidebarProvider>
							<AppSidebar />
							<main className="w-full">
								<Header />
								{children}
							</main>
							<Toaster />
						</SidebarProvider>
					</TooltipProvider>
				</ThemeProvider>
				{TanStackDevtools && (
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				)}
				<Scripts />
			</body>
		</html>
	);
}

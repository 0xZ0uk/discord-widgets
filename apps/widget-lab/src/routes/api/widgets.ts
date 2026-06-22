import { createFileRoute } from "@tanstack/react-router";
import { getWidgets } from "#/lib/widgets.server";

export const Route = createFileRoute("/api/widgets")({
	server: {
		handlers: {
			GET: async () => {
				const widgets = getWidgets();
				return Response.json(widgets);
			},
		},
	},
});

import { createServer } from "node:http";
import { getWidget, loadWidgets } from "@discord-widgets/catalog";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Hono } from "hono";

const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);

const app = new Hono();

app.get("/health", (c) => {
	return c.json({ status: "ok" });
});

const server = new Server(
	{
		name: "discord-widgets",
		version: "0.1.0",
	},
	{
		capabilities: {
			tools: {},
		},
	},
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: "list",
				description:
					"List all available widgets in the catalog, optionally filtered by category",
				inputSchema: {
					type: "object",
					properties: {
						category: {
							type: "string",
							description: "Filter widgets by category",
						},
					},
					required: [],
				},
			},
			{
				name: "get",
				description:
					"Get the full template definition for a specific widget by name, including component reference, fields, buttons, and example data",
				inputSchema: {
					type: "object",
					properties: {
						name: {
							type: "string",
							description: "The name of the widget to retrieve",
						},
					},
					required: ["name"],
				},
			},
			{
				name: "search",
				description:
					"Search widgets by query string with fuzzy matching across name, description, and category fields",
				inputSchema: {
					type: "object",
					properties: {
						query: {
							type: "string",
							description:
								"Search query to match against widget name, description, and category",
						},
						limit: {
							type: "number",
							description: "Maximum number of results to return",
						},
					},
					required: ["query"],
				},
			},
		],
	};
});

function scoreMatch(field: string, query: string): number {
	const lowerField = field.toLowerCase();
	const lowerQuery = query.toLowerCase();

	if (lowerField === lowerQuery) return 100;
	if (lowerField.startsWith(lowerQuery)) return 80;
	if (lowerField.includes(lowerQuery)) return 60;

	// Partial match: check if all characters in query appear in order in field
	let queryIdx = 0;
	for (
		let fieldIdx = 0;
		fieldIdx < lowerField.length && queryIdx < lowerQuery.length;
		fieldIdx++
	) {
		if (lowerField[fieldIdx] === lowerQuery[queryIdx]) {
			queryIdx++;
		}
	}
	if (queryIdx === lowerQuery.length) return 40;

	return 0;
}

function searchWidgets(query: string, limit?: number) {
	const widgets = loadWidgets();
	const results = widgets.map((widget) => {
		const nameScore = scoreMatch(widget.name, query);
		const descriptionScore = widget.description
			? scoreMatch(widget.description, query)
			: 0;
		const categoryScore = widget.category
			? scoreMatch(widget.category, query)
			: 0;
		const score = Math.max(nameScore, descriptionScore, categoryScore);
		return {
			name: widget.name,
			description: widget.description,
			score,
		};
	});

	const filtered = results.filter((r) => r.score > 0);
	filtered.sort((a, b) => b.score - a.score);

	if (limit !== undefined) {
		return filtered.slice(0, limit);
	}
	return filtered;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;

	if (name === "list") {
		let widgets = loadWidgets();

		// Filter by category if provided
		const category = args?.category as string | undefined;
		if (category) {
			widgets = widgets.filter((w) => w.category === category);
		}

		// Map to include only the required fields
		const result = widgets.map((w) => ({
			name: w.name,
			description: w.description,
			category: w.category,
			color: w.color,
			fields: w.fields,
			buttons: w.buttons,
		}));

		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	}

	if (name === "get") {
		const widgetName = args?.name as string | undefined;
		if (!widgetName) {
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({ error: "Missing required parameter: name" }),
					},
				],
			};
		}

		const widget = getWidget(widgetName);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(widget ?? null, null, 2),
				},
			],
		};
	}

	if (name === "search") {
		const query = args?.query as string | undefined;
		const limit = args?.limit as number | undefined;
		if (!query) {
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({
							error: "Missing required parameter: query",
						}),
					},
				],
			};
		}

		const results = searchWidgets(query, limit);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(results, null, 2),
				},
			],
		};
	}

	throw new Error(`Unknown tool: ${name}`);
});

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);

	console.error("MCP server running on stdio");

	// Start HTTP server for health checks
	const httpServer = createServer(async (req, res) => {
		const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
		const request = new Request(url.toString(), {
			method: req.method,
			headers: Object.fromEntries(
				Object.entries(req.headers).filter(([, v]) => v !== undefined) as [
					string,
					string,
				][],
			),
		});

		const response = await app.fetch(request);
		res.writeHead(response.status, Object.fromEntries(response.headers));
		const body = await response.text();
		res.end(body);
	});

	httpServer.listen(PORT, () => {
		console.log(`Health check available at http://localhost:${PORT}/health`);
	});
}

main().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});

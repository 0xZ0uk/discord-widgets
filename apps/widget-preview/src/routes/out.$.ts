import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createFileRoute } from "@tanstack/react-router";

const OUT_DIR = join(import.meta.dirname, "..", "..", "out");

export const Route = createFileRoute("/out/$")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const _splat = params._splat as string;
				const filePath = join(OUT_DIR, _splat);

				if (!existsSync(filePath)) {
					return new Response("Not found", { status: 404 });
				}

				const buffer = readFileSync(filePath);
				return new Response(buffer, {
					headers: {
						"Content-Type": "image/png",
						"Cache-Control": "public, max-age=3600",
					},
				});
			},
		},
	},
});

import { existsSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { createFileRoute } from "@tanstack/react-router";

const OUT_DIR = resolve(join(import.meta.dirname, "..", "..", "out"));

const MIME: Record<string, string> = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".gif": "image/gif",
	".svg": "image/svg+xml",
};

export const Route = createFileRoute("/out/$")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const _splat = params._splat as string;
				const filePath = resolve(join(OUT_DIR, _splat));

				// Prevent path traversal
				if (!filePath.startsWith(OUT_DIR)) {
					return new Response("Forbidden", { status: 403 });
				}

				if (!existsSync(filePath)) {
					return new Response("Not found", { status: 404 });
				}

				const ext = extname(filePath).toLowerCase();
				const contentType = MIME[ext] ?? "application/octet-stream";

				const buffer = readFileSync(filePath);
				return new Response(buffer, {
					headers: {
						"Content-Type": contentType,
						"Cache-Control": "public, max-age=3600",
					},
				});
			},
		},
	},
});

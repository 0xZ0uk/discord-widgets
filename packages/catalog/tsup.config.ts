import { defineConfig } from "tsup";
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Copy widgets YAML files to dist/widgets
function copyWidgets() {
	return {
		name: "copy-widgets",
		async buildEnd() {
			const srcDir = join(process.cwd(), "src", "widgets");
			const outDir = join(process.cwd(), "dist", "widgets");
			mkdirSync(outDir, { recursive: true });
			for (const file of readdirSync(srcDir)) {
				if (file.endsWith(".yaml") || file.endsWith(".yml")) {
					copyFileSync(join(srcDir, file), join(outDir, file));
				}
			}
		},
	};
}

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	splitting: false,
	bundle: true,
	treeshake: true,
	plugins: [copyWidgets()],
});

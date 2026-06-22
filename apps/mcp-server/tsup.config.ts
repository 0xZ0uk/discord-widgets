import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	splitting: false,
	bundle: true,
	treeshake: true,
	banner: {
		js: "#!/usr/bin/env node",
	},
});

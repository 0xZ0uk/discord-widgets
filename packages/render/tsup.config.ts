import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		cli: "src/cli.ts",
	},
	format: ["esm"],
	dts: true,
	splitting: false,
	bundle: true,
	external: ["react", "react-dom"],
	treeshake: true,
});

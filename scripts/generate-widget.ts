#!/usr/bin/env node

/**
 * Widget Codegen — scaffolds a new widget component + catalog entry.
 *
 * Usage:  pnpm generate <widget-name>
 * Example: pnpm generate crypto-prices
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname ?? ".", "..");
const COMPONENTS_DIR = join(ROOT, "packages/render/src/components");
const WIDGETS_DIR = join(ROOT, "packages/catalog/src/widgets");
const INDEX_PATH = join(ROOT, "packages/render/src/index.ts");

function toPascalCase(kebab: string): string {
	return kebab
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join("");
}

function isValidName(name: string): boolean {
	return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name);
}

function componentTemplate(name: string): string {
	return [
		'import type { FunctionComponent } from "react";',
		"",
		"export interface " + name + "Props {",
		"\t// Add your widget props here",
		"\ttitle: string;",
		"\tcolor?: string;",
		"}",
		"",
		"export const " + name + ": FunctionComponent<" + name + "Props> = ({",
		"\ttitle,",
		'\tcolor = "#5865f2",',
		"}) => {",
		"\treturn (",
		"\t\t<div style={{",
		'\t\t\twidth: "800px",',
		'\t\t\theight: "480px",',
		'\t\t\tbackground: "#0f0f23",',
		'\t\t\tborderRadius: "24px",',
		'\t\t\tdisplay: "flex",',
		'\t\t\tflexDirection: "column",',
		'\t\t\tfontFamily: "sans-serif",',
		'\t\t\tcolor: "white",',
		'\t\t\tpadding: "48px",',
		"\t\t}}>",
		"\t\t\t{/* Source / label */}",
		'\t\t\t<div style={{ fontSize: "13px", fontWeight: 600, color: color, marginBottom: "16px", textTransform: "uppercase" }}>',
		"\t\t\t\t{title}",
		"\t\t\t</div>",
		"",
		"\t\t\t{/* Content — add your widget content here */}",
		'\t\t\t<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>',
		'\t\t\t\t<div style={{ fontSize: "48px", opacity: 0.3 }}>Widget content goes here</div>',
		"\t\t\t</div>",
		"",
		"\t\t\t{/* Footer */}",
		'\t\t\t<div style={{ fontSize: "14px", opacity: 0.4, textAlign: "right" }}>',
		'\t\t\t\t{"Powered by Discord Widgets"}',
		"\t\t\t</div>",
		"\t\t</div>",
		"\t);",
		"};",
		"",
	].join("\n");
}

function catalogTemplate(kebab: string, pascal: string): string {
	return [
		"name: " + kebab,
		'description: "' + pascal + ' widget"',
		"component: " + pascal,
		"category: custom",
		'color: "#5865f2"',
		"fields:",
		"  - name: title",
		"    type: string",
		"    required: true",
		"buttons: []",
		"",
	].join("\n");
}

function main() {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
		console.log(
			[
				"",
				"Discord Widgets — Widget Codegen",
				"",
				"Usage:",
				"  pnpm generate <widget-name>",
				"  pnpm gen <widget-name>",
				"",
				"Examples:",
				"  pnpm generate rss-feed",
				"  pnpm generate crypto-prices",
				"",
			].join("\n"),
		);
		process.exit(0);
	}

	const kebab = args[0];
	if (!isValidName(kebab)) {
		console.error('Invalid widget name: "' + kebab + '". Must be kebab-case.');
		process.exit(1);
	}

	const pascal = toPascalCase(kebab);
	const componentPath = join(COMPONENTS_DIR, pascal + ".tsx");
	const catalogPath = join(WIDGETS_DIR, kebab + ".yaml");

	if (existsSync(componentPath)) {
		console.error("Component already exists: " + componentPath);
		process.exit(1);
	}
	if (existsSync(catalogPath)) {
		console.error("Catalog entry already exists: " + catalogPath);
		process.exit(1);
	}

	mkdirSync(COMPONENTS_DIR, { recursive: true });
	mkdirSync(WIDGETS_DIR, { recursive: true });

	writeFileSync(componentPath, componentTemplate(pascal));
	console.log("Created: packages/render/src/components/" + pascal + ".tsx");

	writeFileSync(catalogPath, catalogTemplate(kebab, pascal));
	console.log("Created: packages/catalog/src/widgets/" + kebab + ".yaml");

	// Update index.ts
	const index = readFileSync(INDEX_PATH, "utf-8");
	const exp =
		"export { " + pascal + ' } from "./components/' + pascal + '.js";';
	const typ =
		"export type { " +
		pascal +
		'Props } from "./components/' +
		pascal +
		'.js";';

	if (!index.includes(exp)) {
		writeFileSync(INDEX_PATH, index.trimEnd() + "\n" + exp + "\n" + typ + "\n");
		console.log("Updated: packages/render/src/index.ts");
	}

	console.log(
		[
			"",
			'Done! Widget "' + kebab + '" scaffolded.',
			"",
			"Next:",
			"  1. Edit packages/render/src/components/" + pascal + ".tsx",
			"  2. Edit packages/catalog/src/widgets/" + kebab + ".yaml",
			"  3. pnpm -F @discord-widgets/render demo",
			"",
		].join("\n"),
	);
}

main();

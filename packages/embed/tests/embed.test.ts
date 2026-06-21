import { describe, it, expect } from "vitest";
import { parseEmbedDirectives, hasEmbedDirectives } from "../src/parser.js";
import { buildDiscordEmbed, buildWidgetMessage } from "../src/builder.js";
import { processResponse } from "../src/hook.js";

describe("parseEmbedDirectives", () => {
	it("parses a basic embed with image", () => {
		const input = `Here's the weather:

[[embed title="Weather" color="#3498db"]]
MEDIA:/out/widget-123.png
[[/embed]]`;

		const result = parseEmbedDirectives(input);

		expect(result.embeds).toHaveLength(1);
		const embed = result.embeds[0]!;
		expect(embed.title).toBe("Weather");
		expect(embed.color).toBe("#3498db");
		expect(embed.imagePath).toBe("/out/widget-123.png");
		expect(embed.buttons).toHaveLength(0);
		expect(result.cleanContent).toBe("Here's the weather:");
	});

	it("parses embed with buttons", () => {
		const input = `[[embed title="News" color="#5865f2"]]
MEDIA:/out/rss.png
[[buttons]]
[Read Article](https://example.com)
[Previous](https://example.com/prev)
[[/embed]]`;

		const result = parseEmbedDirectives(input);

		expect(result.embeds).toHaveLength(1);
		const embed = result.embeds[0]!;
		expect(embed.buttons).toHaveLength(2);
		expect(embed.buttons[0]!.label).toBe("Read Article");
		expect(embed.buttons[0]!.style).toBe("link");
		expect(embed.buttons[0]!.url).toBe("https://example.com");
	});

	it("parses styled buttons", () => {
		const input = `[[embed title="Test"]]
[[buttons]]
[Style:primary Go](https://example.com)
[Style:secondary custom_id:next_next Next →]
[[/embed]]`;

		const result = parseEmbedDirectives(input);

		const embed = result.embeds[0]!;
		expect(embed.buttons).toHaveLength(2);
		expect(embed.buttons[0]!.style).toBe("link"); // URL buttons are always link style
		expect(embed.buttons[0]!.url).toBe("https://example.com");
		expect(embed.buttons[1]!.style).toBe("secondary");
		expect(embed.buttons[1]!.custom_id).toBe("next_next");
	});

	it("returns clean content when no embeds", () => {
		const input = "Just a normal message with no embeds.";
		const result = parseEmbedDirectives(input);

		expect(result.embeds).toHaveLength(0);
		expect(result.cleanContent).toBe(input);
	});

	it("handles malformed embed (no closing tag)", () => {
		const input = `[[embed title="Bad"]]
MEDIA:/out/widget.png`;
		const result = parseEmbedDirectives(input);

		expect(result.embeds).toHaveLength(0);
		expect(result.cleanContent).toContain("[[embed");
	});
});

describe("hasEmbedDirectives", () => {
	it("detects embed directives", () => {
		expect(hasEmbedDirectives('[[embed title="test"]]')).toBe(true);
		expect(hasEmbedDirectives("no embeds here")).toBe(false);
	});
});

describe("buildDiscordEmbed", () => {
	it("builds a basic embed payload", () => {
		const embed = buildDiscordEmbed({
			title: "Weather",
			color: "#3498db",
			imagePath: "/out/widget.png",
			buttons: [],
		});

		expect(embed.title).toBe("Weather");
		expect(embed.color).toBe(0x3498db);
		expect(embed.image?.url).toBe("attachment://widget.png");
		expect(embed.components).toBeUndefined();
	});

	it("builds embed with buttons", () => {
		const embed = buildDiscordEmbed({
			title: "News",
			imagePath: "/out/rss.png",
			buttons: [
				{ label: "Read", style: "link", url: "https://example.com" },
				{ label: "Next", style: "secondary", custom_id: "next" },
			],
		});

		expect(embed.components).toHaveLength(1);
		const row = embed.components![0]!;
		expect(row.type).toBe(1); // Action Row
		expect(row.components).toHaveLength(2);
		expect(row.components[0]!.type).toBe(2); // Button
		expect(row.components[0]!.style).toBe(5); // Link
		expect(row.components[1]!.style).toBe(2); // Secondary
	});

	it("uses URL override for hosted images", () => {
		const embed = buildDiscordEmbed(
			{ title: "Test", imagePath: "/local/widget.png", buttons: [] },
			"https://r2.example.com/widget.png",
		);

		expect(embed.image?.url).toBe("https://r2.example.com/widget.png");
	});
});

describe("buildWidgetMessage", () => {
	it("builds a complete message payload", () => {
		const payload = buildWidgetMessage(
			{
				title: "Weather",
				color: "#3498db",
				imagePath: "widget.png",
				buttons: [{ label: "Go", style: "link", url: "https://x.com" }],
			},
			"/out/widget.png",
		);

		expect(payload.embeds).toHaveLength(1);
		expect(payload.files).toEqual({ "widget.png": "/out/widget.png" });
	});
});

describe("processResponse", () => {
	it("passes through non-embed responses", () => {
		const result = processResponse("Hello world!");
		expect(result.hasEmbeds).toBe(false);
		expect(result.textContent).toBe("Hello world!");
	});

	it("processes embed responses", () => {
		const input = `Here's the weather:

[[embed title="Weather" color="#3498db"]]
MEDIA:/out/widget.png
[[buttons]]
[Detailed Forecast](https://weather.com)
[[/embed]]`;

		const result = processResponse(input);
		expect(result.hasEmbeds).toBe(true);
		expect(result.textContent).toBe("Here's the weather:");
		const payload = result.payload!;
		expect(payload.embeds).toHaveLength(1);
		expect(payload.embeds[0]!.title).toBe("Weather");
	});
});

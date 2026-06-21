/**
 * Embed Directive Parser
 *
 * Parses [[embed]] directives from Hermes agent response text.
 * These directives tell the gateway to send the response as a Discord
 * embed with interactive buttons instead of a plain text message.
 *
 * Syntax:
 *   [[embed title="Weather" color="#3498db" description="Current conditions"]]
 *   MEDIA:/path/to/widget.png
 *   [[buttons]]
 *   [Label](https://example.com)
 *   [Style:primary Label](https://example.com)
 *   [Style:secondary custom_id:weather_next Next →](https://example.com)
 *   [[/embed]]
 *
 * The text outside [[embed]] blocks is sent as a normal message.
 */

export interface ParsedButton {
	label: string;
	style: "primary" | "secondary" | "link" | "danger" | "success";
	url?: string;
	custom_id?: string;
}

export interface ParsedEmbed {
	title?: string;
	description?: string;
	color?: string;
	imagePath?: string;
	buttons: ParsedButton[];
}

const EMBED_OPEN = /\[\[embed(?:\s+([^\]]*))?\]\]/;
const EMBED_CLOSE = /\[\[\/embed\]\]/;

/**
 * Parse embed directives from agent response text.
 * Returns parsed embeds and the cleaned content (directives removed).
 */
export function parseEmbedDirectives(content: string): {
	embeds: ParsedEmbed[];
	cleanContent: string;
} {
	const embeds: ParsedEmbed[] = [];
	let remaining = content;

	while (true) {
		const openMatch = remaining.match(EMBED_OPEN);
		if (!openMatch) break;

		const openIndex = openMatch.index ?? 0;
		const openCapture = openMatch[1] ?? "";
		const afterOpen = remaining.slice(openIndex + openMatch[0].length);

		// Find the closing [[/embed]]
		const closeMatch = afterOpen.match(EMBED_CLOSE);
		if (!closeMatch) break; // malformed — skip

		const closeIndex = closeMatch.index ?? 0;
		const blockContent = afterOpen.slice(0, closeIndex);
		const attrs = parseAttributes(openCapture);

		// Extract MEDIA: path from the block
		const mediaMatch = blockContent.match(/MEDIA:\s*(\S+)/);
		const imagePath = mediaMatch?.[1];

		// Extract buttons section
		const buttonsMatch = blockContent.match(
			/\[\[buttons\]\]([\s\S]*?)(?=\[\[\/embed\]\]|$)/,
		);
		const buttons = buttonsMatch ? parseButtons(buttonsMatch[1] ?? "") : [];

		embeds.push({
			title: attrs.title,
			description: attrs.description,
			color: attrs.color,
			imagePath,
			buttons,
		});

		// Remove the block from remaining content
		remaining =
			remaining.slice(0, openIndex) +
			remaining.slice(openIndex + openMatch[0].length + closeIndex + closeMatch[0].length);
	}

	return {
		embeds,
		cleanContent: remaining.trim(),
	};
}

/**
 * Parse key="value" or key=value attributes from the [[embed]] tag.
 */
function parseAttributes(raw: string): Record<string, string> {
	const attrs: Record<string, string> = {};
	if (!raw) return attrs;

	const pattern = /(\w+)=(?:"([^"]*)"|([\w#.-]+))/g;
	let match;
	while ((match = pattern.exec(raw))) {
		const value = match[2] ?? match[3];
		if (value !== undefined) {
			attrs[match[1]!] = value;
		}
	}
	return attrs;
}

/**
 * Parse button definitions from the [[buttons]] block.
 *
 * Supported formats:
 *   [Label](url)                          → link button
 *   [Style:primary Label](url)            → styled link button
 *   [Style:secondary custom_id:foo Label] → interaction button (no url)
 */
function parseButtons(raw: string): ParsedButton[] {
	const buttons: ParsedButton[] = [];
	const buttonPattern = /\[([^\]]*)\](?:\(([^)]*)\))?/g;
	let match;

	while ((match = buttonPattern.exec(raw))) {
		const inner = match[1]?.trim() ?? "";
		const url = match[2]?.trim();

		let style: ParsedButton["style"] = "secondary";
		let customId: string | undefined;
		let label = inner;

		// Check for Style: prefix
		const styleMatch = label.match(/^Style:(\w+)\s+/);
		if (styleMatch) {
			style = (styleMatch[1] ?? "secondary") as ParsedButton["style"];
			label = label.slice(styleMatch[0].length);
		}

		// Check for custom_id: prefix
		const cidMatch = label.match(/^custom_id:(\S+)\s+/);
		if (cidMatch) {
			customId = cidMatch[1];
			label = label.slice(cidMatch[0].length);
		}

		if (!label) continue;

		buttons.push({
			label,
			style: url ? "link" : style,
			url: url || undefined,
			custom_id: customId,
		});
	}

	return buttons;
}

/**
 * Check if content contains any embed directives.
 */
export function hasEmbedDirectives(content: string): boolean {
	return EMBED_OPEN.test(content);
}

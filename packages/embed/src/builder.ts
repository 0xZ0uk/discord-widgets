/**
 * Discord Embed Builder
 *
 * Converts parsed embed directives into Discord API payloads.
 * Platform-agnostic — produces plain objects that can be sent via
 * Discord.js, discord.py, or raw REST API.
 */

import type { ParsedButton, ParsedEmbed } from "./parser.js";

// Discord API color integer (hex string → int)
function hexToInt(hex: string): number {
	return Number.parseInt(hex.replace("#", ""), 16);
}

// Discord button style mapping
const BUTTON_STYLES: Record<string, number> = {
	primary: 1,
	secondary: 2,
	success: 3,
	danger: 4,
	link: 5,
};

export interface DiscordEmbedPayload {
	title?: string;
	description?: string;
	color?: number;
	image?: { url: string };
	components?: DiscordComponentPayload[];
}

export interface DiscordComponentPayload {
	type: 1; // Action Row
	components: DiscordButtonPayload[];
}

export interface DiscordButtonPayload {
	type: 2; // Button
	style: number;
	label: string;
	url?: string;
	custom_id?: string;
}

export interface WidgetMessagePayload {
	content?: string;
	embeds: DiscordEmbedPayload[];
	/** Files to attach (key = filename, value = local path) */
	files?: Record<string, string>;
}

/**
 * Convert a parsed embed into a Discord API embed payload.
 */
export function buildDiscordEmbed(
	parsed: ParsedEmbed,
	/** Optional: a public URL to use instead of local file path */
	imageUrlOverride?: string,
): DiscordEmbedPayload {
	const embed: DiscordEmbedPayload = {};

	if (parsed.title) embed.title = parsed.title;
	if (parsed.description) embed.description = parsed.description;
	if (parsed.color) embed.color = hexToInt(parsed.color) ?? 0;

	// Image: use override URL or construct attachment reference
	if (parsed.imagePath) {
		if (imageUrlOverride) {
			embed.image = { url: imageUrlOverride };
		} else {
			// Local file — use attachment:// protocol
			const filename = parsed.imagePath.split("/").pop() ?? "widget.png";
			embed.image = { url: `attachment://${filename}` };
		}
	}

	// Buttons
	if (parsed.buttons.length > 0) {
		// Discord allows max 5 buttons per action row
		const validButtons = parsed.buttons.slice(0, 5);
		embed.components = [
			{
				type: 1,
				components: validButtons.map((btn) =>
					buildButton(btn),
				),
			},
		];
	}

	return embed;
}

/**
 * Convert a parsed button into a Discord API button payload.
 */
export function buildButton(btn: ParsedButton): DiscordButtonPayload {
	const style = BUTTON_STYLES[btn.style] ?? 2; // default to secondary

	const payload: DiscordButtonPayload = {
		type: 2,
		style,
		label: btn.label,
	};

	if (btn.url) payload.url = btn.url;
	if (btn.custom_id) payload.custom_id = btn.custom_id;

	return payload;
}

/**
 * Build a complete Discord message payload from a parsed embed.
 *
 * Usage:
 *   const payload = buildWidgetMessage(parsed, "/path/to/widget.png");
 *   // payload.embeds → send as embeds
 *   // payload.files → attach as files
 */
export function buildWidgetMessage(
	parsed: ParsedEmbed,
	localImagePath?: string,
): WidgetMessagePayload {
	const embed = buildDiscordEmbed(parsed);

	const payload: WidgetMessagePayload = {
		embeds: [embed],
	};

	// If we have a local image, attach it
	if (localImagePath && parsed.imagePath) {
		const filename = parsed.imagePath.split("/").pop() ?? "widget.png";
		payload.files = { [filename]: localImagePath };
	}

	return payload;
}

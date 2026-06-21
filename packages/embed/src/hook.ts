/**
 * Gateway Integration Hook
 *
 * Shows how embed directives integrate into the Hermes gateway dispatch.
 * This is a reference implementation — actual integration requires
 * patching the gateway's _dispatch_response method.
 *
 * Flow:
 *   1. Agent produces response with [[embed]] directives
 *   2. Gateway calls processResponse() before send
 *   3. If embeds detected → send as embed message (not plain text)
 *   4. If no embeds → fall through to normal text delivery
 */

import { hasEmbedDirectives, parseEmbedDirectives } from "./parser.js";
import { buildWidgetMessage } from "./builder.js";
import type { WidgetMessagePayload } from "./builder.js";

export interface ProcessedResponse {
	/** Whether the response contains embed directives */
	hasEmbeds: boolean;
	/** Cleaned text content (directives removed) */
	textContent: string;
	/** Built message payload ready for Discord */
	payload?: WidgetMessagePayload;
}

/**
 * Process an agent response, extracting embed directives if present.
 *
 * Call this in the gateway BEFORE the normal send path:
 *
 *   const processed = processResponse(agentResponse);
 *   if (processed.hasEmbeds) {
 *     // Send as embed message
 *     await channel.send({
 *       content: processed.textContent || undefined,
 *       embeds: processed.payload.embeds,
 *       files: processed.payload.files ? Object.entries(processed.payload.files).map(
 *         ([name, path]) => new Discord.File(path, name)
 *       ) : [],
 *     });
 *   } else {
 *     // Normal text delivery
 *     await channel.send(content);
 *   }
 */
export function processResponse(response: string): ProcessedResponse {
	if (!hasEmbedDirectives(response)) {
		return {
			hasEmbeds: false,
			textContent: response,
		};
	}

	const { embeds, cleanContent } = parseEmbedDirectives(response);

	if (embeds.length === 0) {
		return {
			hasEmbeds: false,
			textContent: response,
		};
	}

	// For now, handle single embed (most common case)
	const firstEmbed = embeds[0]!;
	const payload = buildWidgetMessage(firstEmbed, firstEmbed.imagePath);

	return {
		hasEmbeds: true,
		textContent: cleanContent,
		payload,
	};
}

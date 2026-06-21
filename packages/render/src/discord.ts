export interface WidgetEmbedOptions {
	imageUrl: string;
	title: string;
	description?: string;
	color?: string;
	buttons?: WidgetButton[];
}

export interface WidgetButton {
	label: string;
	style: "primary" | "secondary" | "link";
	url?: string;
	customId?: string;
}

const BUTTON_STYLE_MAP = {
	primary: 1,
	secondary: 2,
	link: 5,
} as const;

const MAX_BUTTONS = 5;

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;

function hexToInteger(hex: string): number {
	const clean = hex.replace("#", "");
	return Number.parseInt(clean, 16);
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeWithRetry<T>(
	fn: () => Promise<T>,
	retries = MAX_RETRIES,
): Promise<T> {
	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			if (error instanceof DiscordRateLimitError) {
				const delay = error.retryAfter * 1000;
				await sleep(delay);
				continue;
			}

			if (attempt < retries) {
				const delay = BASE_RETRY_DELAY_MS * 2 ** attempt;
				await sleep(delay);
				continue;
			}

			break;
		}
	}

	throw lastError;
}

class DiscordRateLimitError extends Error {
	retryAfter: number;

	constructor(retryAfter: number) {
		super(`Rate limited. Retry after ${retryAfter}s`);
		this.name = "DiscordRateLimitError";
		this.retryAfter = retryAfter;
	}
}

async function postWebhook(
	webhookUrl: string,
	payload: Record<string, unknown>,
): Promise<void> {
	const response = await fetch(webhookUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (response.status === 429) {
		const body = (await response.json()) as { retry_after?: number };
		const retryAfter = body.retry_after ?? 1;
		throw new DiscordRateLimitError(retryAfter);
	}

	if (!response.ok) {
		const body = await response.text().catch(() => "");
		throw new Error(
			`Discord webhook request failed: ${response.status} ${response.statusText} - ${body}`,
		);
	}
}

export async function sendWidgetEmbed(
	webhookUrl: string,
	options: WidgetEmbedOptions,
): Promise<void> {
	const { imageUrl, title, description, color, buttons } = options;

	if (!webhookUrl) {
		throw new Error("Webhook URL is required");
	}

	let url: URL;
	try {
		url = new URL(webhookUrl);
	} catch {
		throw new Error("Invalid webhook URL format");
	}

	if (
		!url.hostname.endsWith("discord.com") &&
		!url.hostname.endsWith("discordapp.com")
	) {
		throw new Error("Webhook URL must be a Discord webhook URL");
	}

	const embed: Record<string, unknown> = {
		title,
		image: { url: imageUrl },
	};

	if (description) {
		embed.description = description;
	}

	if (color) {
		embed.color = hexToInteger(color);
	}

	if (buttons && buttons.length > 0) {
		const validButtons = buttons.slice(0, MAX_BUTTONS);
		embed.components = [
			{
				type: 1,
				components: validButtons.map((btn) => ({
					type: 3,
					style: BUTTON_STYLE_MAP[btn.style],
					label: btn.label,
					...(btn.url ? { url: btn.url } : {}),
					...(btn.customId ? { custom_id: btn.customId } : {}),
				})),
			},
		];
	}

	const payload = {
		username: "Widget Bot",
		embeds: [embed],
	};

	await executeWithRetry(() => postWebhook(webhookUrl, payload));
}

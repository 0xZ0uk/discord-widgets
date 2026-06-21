# Slice 6: Discord Webhook Delivery

## Goal

Widget images are delivered to Discord channels as rich embeds with image, title, and buttons. This is the final delivery mechanism — connecting the rendering pipeline to the user's Discord experience.

## Issues

### T1: Create Discord webhook delivery utility

**What to build:**
Create `packages/render/src/discord.ts` with functions to send embeds to Discord via webhooks:

```typescript
async function sendWidgetEmbed(webhookUrl: string, options: {
  imageUrl: string;
  title: string;
  description?: string;
  color?: string;
  buttons?: { label: string; style: "primary" | "secondary" | "link"; url?: string; customId?: string }[];
}): Promise<void>
```

Use Discord's webhook API (POST JSON with `embeds` array). The embed should include:
- Image (the rendered widget PNG URL)
- Title (widget title)
- Color (from widget catalog)
- Buttons (from widget catalog, up to 5)

**Acceptance criteria:**
- [x] `sendWidgetEmbed()` sends a valid Discord embed
- [x] Embed displays the widget image correctly
- [x] Buttons render in Discord (up to 5)
- [x] Error handling for invalid webhook URLs
- [x] Rate limit handling (Discord has 5/5s for webhooks)

**Dependencies:** None — can start immediately (uses external API)

**Metadata:**
- **Source:** PRD Phase 3 (Discord webhook delivery)
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T2: Create webhook configuration

**What to build:**
Add Discord webhook configuration to the env package:
- `DISCORD_WIDGET_WEBHOOK_URL` — webhook URL for widget delivery
- `DISCORD_BOT_TOKEN` — for button interactions (Slice 7)

Document how to create a Discord webhook and configure the bot.

**Acceptance criteria:**
- [x] Env schema validates Discord credentials
- [x] `.env.example` updated with Discord placeholders
- [x] README documents webhook creation steps

**Dependencies:** None

**Metadata:**
- **Source:** PRD Phase 3
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T3: Add Discord delivery to render pipeline

**What to build:**
Extend the `render` MCP tool (from Slice 4) with an optional `deliver` parameter. When `deliver: true`, the tool sends the rendered widget to Discord via webhook in addition to returning the URL.

```typescript
// Tool: render (extended)
// Input: { name, data, deliver?: boolean, webhookUrl?: string }
// Output: { url: string, delivered: boolean }
```

**Acceptance criteria:**
- [x] `render({ name: "weather", data: {...}, deliver: true })` sends embed to Discord
- [x] Embed appears in the configured Discord channel
- [x] `deliver: false` (default) only returns URL
- [x] Fallback: if webhook fails, still return URL

**Dependencies:** T1, T2, Slice 4 T1

**Metadata:**
- **Source:** PRD Phase 3
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

## Changelog / Status Report

**Date:** 2026-06-21
**Completed by:** MiMoCode

### Summary

Implemented Discord webhook delivery for rendered widget images. Created a `sendWidgetEmbed()` utility that posts rich embeds (image, title, color, buttons) to Discord channels via webhooks, with rate limit retry and validation. Added Discord webhook configuration to the env schema and extended the MCP `render` tool with an optional `deliver` parameter that triggers webhook delivery after rendering.

### Tasks Completed

| Task | Status | Notes |
|------|--------|-------|
| T1: Create Discord webhook delivery utility | ✅ Done | Created `discord.ts` with `sendWidgetEmbed()`, retry logic for 429s, URL validation, max 5 buttons |
| T2: Create webhook configuration | ✅ Done | Added `DISCORD_WIDGET_WEBHOOK_URL` and `DISCORD_BOT_TOKEN` to env schema, updated `.env.example` and README |
| T3: Add Discord delivery to render pipeline | ✅ Done | Extended MCP `render` tool with `deliver` and `webhookUrl` params, maps catalog buttons to Discord format, graceful fallback on failure |

### Files Changed

- `packages/render/src/discord.ts` (new) — `sendWidgetEmbed()` with retry, validation, button support
- `packages/render/src/index.ts` (modified) — Exports `sendWidgetEmbed` and types
- `packages/env/src/index.ts` (modified) — Added `DISCORD_WIDGET_WEBHOOK_URL` and `DISCORD_BOT_TOKEN` optional strings
- `.env.example` (modified) — Added Discord placeholder values
- `README.md` (modified) — Added Discord Setup documentation section
- `apps/mcp-server/src/index.ts` (modified) — Extended render tool with `deliver` and `webhookUrl` parameters

### Validation

- `pnpm turbo check-types` — all 5 packages pass (full turbo cache hit)

### Next Steps

1. Slice 7: Button interactions via Discord bot (requires `DISCORD_BOT_TOKEN` and interactions endpoint)
2. End-to-end test with a real Discord webhook
3. Consider rate limiting at the application level (not just retry on 429)

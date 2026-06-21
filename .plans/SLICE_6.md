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
- [ ] `sendWidgetEmbed()` sends a valid Discord embed
- [ ] Embed displays the widget image correctly
- [ ] Buttons render in Discord (up to 5)
- [ ] Error handling for invalid webhook URLs
- [ ] Rate limit handling (Discord has 5/5s for webhooks)

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
- [ ] Env schema validates Discord credentials
- [ ] `.env.example` updated with Discord placeholders
- [ ] README documents webhook creation steps

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
- [ ] `render({ name: "weather", data: {...}, deliver: true })` sends embed to Discord
- [ ] Embed appears in the configured Discord channel
- [ ] `deliver: false` (default) only returns URL
- [ ] Fallback: if webhook fails, still return URL

**Dependencies:** T1, T2, Slice 4 T1

**Metadata:**
- **Source:** PRD Phase 3
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

# Slice 4 — Discord Webhook Delivery

> **Status:** ✅ DONE  
> **Package:** `packages/render/src/discord.ts`

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-21 | Rewritten to reflect actual implementation. Webhook delivery with retry + 429 handling. R2 removed. |

---

## Goal

Deliver rendered widget images to Discord channels via webhook, with retry logic and rate-limit safety.

## What Was Built

### `sendWidgetEmbed()` (`packages/render/src/discord.ts`)
- Sends Discord webhook message with embed payload + PNG image attachment
- Construct multipart form: JSON embed + file buffer

### Retry Logic
- Automatic retry on transient failures
- Exponential backoff for retries

### 429 Rate-Limit Handling
- Parses `Retry-After` header from Discord 429 responses
- Waits the specified duration before retrying
- Commits 5, 6: "fix: discord.ts button type, 429 safety, imageUrl validation"

### `imageUrl` Validation
- Validates image URLs before embedding
- Rejects empty/invalid URLs

## Acceptance Criteria

- [x] Webhook delivers PNG image to Discord channel
- [x] Embed payload includes title, description, image, buttons
- [x] Retry on transient failures
- [x] 429 rate-limit respects `Retry-After` header
- [x] `imageUrl` validation prevents broken embeds

## Dependencies

- `DISCORD_WIDGET_WEBHOOK_URL` env var
- `node-fetch` or built-in fetch

## Delivery Path

This implements **Path 3: WEBHOOK** delivery:
```
Cron/external trigger → sendWidgetEmbed() → Discord webhook URL → Discord channel
```

## Known Limitations

- Webhook URL is a single channel (no multi-channel routing)
- No delivery confirmation/logging
- No retry budget (infinite retries possible)
- PNG must be pre-rendered before webhook call

---
name: discord-widgets
description: "Render visual widget cards (weather, crypto, RSS) as PNG images and deliver them in Discord conversations."
version: 2.0.0
author: Hermes Agent
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [widgets, discord, rendering, visual, cards, crypto, weather, rss]
---

# Discord Widgets — Render & Deliver Visual Cards

## Purpose

Discord Widgets render structured data (weather, crypto prices, news) as styled PNG images using Takumi (Rust-powered JSX renderer). The agent fetches real data, renders a widget, and delivers the image via `MEDIA:` tag.

**Pipeline:** Fetch data → Write render script → Execute with `tsx` → Deliver image via `MEDIA:`

## When to Use Widgets

Use a widget when the query benefits from **structured visual data**. Use plain text when the query is conversational, simple, or has no visual value.

### Widget Triggers

| Query Pattern | Widget | Example |
|---------------|--------|---------|
| Weather requests | `weather` | "What's the weather in Porto?" |
| Crypto prices / market data | `crypto-prices` | "What's ETH's price?" |
| News / articles / RSS | `rss-feed` | "Show me the latest tech news" |
| Price comparisons | `crypto-prices` | "Compare BTC and ETH" |

### Plain Text Responses

Use plain text for: greetings, simple facts, code help, conversational queries, or when no widget matches.

## How to Render

### Prerequisites

- Working directory must be `/root/discord-widgets`
- `tsx` is available (installed in the project)

### Step 1: Fetch Real Data

Always fetch live data before rendering. Use `curl` or available APIs:

```bash
# Crypto prices (CoinGecko)
curl -s "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true"

# Weather (wttr.in)
curl -s "wttr.in/Porto?format=j1"
```

### Step 2: Write a Render Script

Create a temporary `.tsx` file at the project root:

```tsx
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { CryptoPrices } from "./packages/render/src/components/CryptoPrices";
import { renderToPng } from "./packages/render/src/engine";

const png = await renderToPng(
  <CryptoPrices
    coin="Ethereum"
    symbol="ETH"
    price="$1,761.26"
    change24h="+2.53%"
    source="CoinGecko"
    color="#627eea"
  />,
  { width: 800, height: 400 },
);

const outPath = join(process.cwd(), "out", "widget.png");
writeFileSync(outPath, png);
console.log(`Done: ${outPath}`);
```

### Step 3: Execute

```bash
cd /root/discord-widgets && tsx render-script.tsx
```

The PNG is written to `/root/discord-widgets/out/`.

### Step 4: Deliver

Include the image in your response using the `MEDIA:` tag:

```
MEDIA:/root/discord-widgets/out/widget.png
```

**Keep text minimal.** The widget IS the response. No extra commentary needed.

### Step 5: Clean Up

Delete the temporary `.tsx` script after rendering:

```bash
rm /root/discord-widgets/render-script.tsx
```

## Widget Reference

### weather

**Component:** `WeatherCard` from `./packages/render/src/components/WeatherCard`
**Size:** 800×400
**Accent color:** `#3498db` (default)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `location` | string | ✅ | City/region name |
| `temp` | string | ✅ | Temperature display |
| `condition` | string | ✅ | Weather condition text |
| `icon` | string | ❌ | Weather emoji (default: 🌤️) |
| `color` | string | ❌ | Accent hex color |

### crypto-prices

**Component:** `CryptoPrices` from `./packages/render/src/components/CryptoPrices`
**Size:** 800×400

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `coin` | string | ✅ | Coin name |
| `symbol` | string | ✅ | Coin ticker |
| `price` | string | ✅ | Current price |
| `change24h` | string | ✅ | 24h change (e.g. "+2.3%") |
| `source` | string | ❌ | Data source (default: CoinGecko) |
| `color` | string | ❌ | Accent hex color |

**Known colors:** Bitcoin `#f7931a`, Ethereum `#627eea`, Solana `#9945ff`

### rss-feed

**Component:** `RssFeedCard` from `./packages/render/src/components/RssFeedCard`
**Size:** 800×480
**Accent color:** `#5865f2` (default)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `item` | object | ✅ | Feed item (see below) |
| `currentIndex` | number | ✅ | Current item index (0-based) |
| `totalItems` | number | ✅ | Total items in feed |
| `color` | string | ❌ | Accent hex color |

**item object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `item.title` | string | ✅ | Article title |
| `item.summary` | string | ✅ | Article summary |
| `item.source` | string | ❌ | Source name |
| `item.date` | string | ❌ | Publication date |
| `item.link` | string | ❌ | Article URL |
| `item.thumbnail` | string | ❌ | Thumbnail image URL |

## Import Paths

Always use these exact import paths from the project root:

```tsx
// Components
import { WeatherCard } from "./packages/render/src/components/WeatherCard";
import { CryptoPrices } from "./packages/render/src/components/CryptoPrices";
import { RssFeedCard } from "./packages/render/src/components/RssFeedCard";

// Render engine
import { renderToPng } from "./packages/render/src/engine";
```

## Examples

### Example: Crypto Price

**User:** "What's the price of Solana?"

**Steps:**
1. Fetch: `curl -s "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true"`
2. Write script with `CryptoPrices` component
3. Execute: `tsx sol-render.tsx`
4. Deliver: `MEDIA:/root/discord-widgets/out/widget.png`
5. Clean up: `rm sol-render.tsx`

### Example: Weather

**User:** "What's the weather in Tokyo?"

**Steps:**
1. Fetch: `curl -s "wttr.in/Tokyo?format=j1"`
2. Write script with `WeatherCard` component
3. Execute: `tsx weather-render.tsx`
4. Deliver: `MEDIA:/root/discord-widgets/out/widget.png`
5. Clean up: `rm weather-render.tsx`

## Fallback Behavior

- **No widget matches** → Plain text response
- **Render fails** → Plain text with the data
- **Data fetch fails** → Use placeholder data, note the source failed
- **tsx not available** → Fall back to plain text

## Status

**Embeds & interactive buttons:** Deferred. The `[[embed]]` directive system and WidgetView button interactions are in the backlog — don't use them. Deliver images only via `MEDIA:` tag.

## Pitfalls

- **Always `cd /root/discord-widgets` first** — imports are relative to project root
- **Always clean up temp scripts** — don't leave `.tsx` files lying around
- **Deliver images ONLY.** User explicitly said: "I said just the image, don't need the extra message." When you render a widget, respond with `MEDIA:/path/to/file.png` and nothing else. No caption, no summary, no "Here's the widget." The widget IS the response.
- **Don't use `vision_analyze` on your own output.** The goal is to deliver the image to the user, not describe it to yourself. If you vision-analyze the rendered PNG, you're wasting a turn and the user sees nothing.
- **CoinGecko rate limits** — if blocked, wait 60s or use cached data
- **Weather emoji** — Takumi supports full emoji rendering, use them
- **Color hex** — must include `#` prefix (e.g. `#627eea`, not `627eea`)

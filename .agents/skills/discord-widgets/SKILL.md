---
name: discord-widgets
description: "Detect when a query benefits from a widget response and use MCP tools to render visual cards instead of plain text."
version: 1.1.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [widgets, discord, rendering, mcp, visual, cards]
---

# Discord Widgets — Widget Matching Skill

## When to Use Widgets

Use a widget response when the query would benefit from structured visual data. Use plain text when the query is conversational, factual without visual value, or when no widget matches.

### Widget Triggers

| Query Pattern | Widget Name | Example |
|---------------|-------------|---------|
| Weather requests | `weather` | "What's the weather in Porto?" |
| News / articles / RSS feeds | `rss-feed` | "Show me the latest tech news" |
| Crypto prices / market data | `crypto-prices` | "What's Bitcoin's price?" |
| Stock prices | `crypto-prices` (reused) | "How's Apple doing?" |
| Structured visual data | Any matching widget | "Compare these metrics" |

### Plain Text Responses

Use plain text when:
- Greeting or conversational ("Hello", "How are you?")
- Simple factual question with no visual value ("What is 2+2?")
- Code or technical help ("Write me a Python function")
- No widget matches the query intent

## Workflow

When a query matches a widget trigger, follow this exact sequence:

### Step 1: Search for matching widget

Use the MCP `search` tool with a relevant query:

```
search(query: "weather")
search(query: "news")
search(query: "crypto")
```

### Step 2: Get widget details

Use the MCP `get` tool with the **exact catalog name** (kebab-case) returned by search:

```
get(name: "weather")
get(name: "rss-feed")
get(name: "crypto-prices")
```

> ⚠️ Widget names are kebab-case (e.g. `crypto-prices`), NOT PascalCase (`CryptoPrices`).

### Step 3: Fetch the data

Fetch real data for the widget using web search, APIs, or available data sources:
- Weather: search for current weather data
- RSS: search for latest news articles
- Crypto: search for current price data

### Step 4: Render the widget

Use the MCP `render` tool with the fetched data:

```
render(name: "weather", data: { location: "Porto", temp: "22°", condition: "Partly Cloudy", icon: "⛅", color: "#3498db" })
```

### Step 5: Respond with the image

Return the hosted image URL in your response. Do not include plain text alongside the widget unless it adds context.

## Fallback Behavior

- **No widget matches** → Respond with plain text
- **Render fails** → Respond with plain text and note: "Widget rendering failed, here's the information as text:"
- **Data fetch fails** → Use placeholder data or fall back to plain text

## Widget Reference

### weather

**Component:** `weather`
**Size:** 800×400
**Required fields:**
- `location` (string) — City/region name
- `temp` (string) — Temperature display
- `condition` (string) — Weather condition text

**Optional fields:**
- `icon` (string) — Weather emoji (default: 🌤️)
- `color` (string) — Accent color hex (default: #3498db)

### rss-feed

**Component:** `rss-feed`
**Size:** 800×480
**Required fields:**
- `item` (object) — Feed item with:
  - `title` (string) — Article title
  - `summary` (string) — Article summary
- `currentIndex` (number) — Current item index (0-based)
- `totalItems` (number) — Total items in feed

**Optional fields:**
- `item.source` (string) — Source name
- `item.date` (string) — Publication date
- `item.link` (string) — Article URL
- `item.thumbnail` (string) — Thumbnail image URL
- `color` (string) — Accent color hex (default: #5865f2)

### crypto-prices

**Component:** `crypto-prices`
**Size:** 800×400
**Required fields:**
- `coin` (string) — Coin name
- `symbol` (string) — Coin symbol
- `price` (string) — Current price
- `change24h` (string) — 24h change (e.g., "+2.3%")

**Optional fields:**
- `source` (string) — Data source (default: CoinGecko)
- `color` (string) — Accent color hex (default: #f7931a)

## Examples

### Example 1: Weather Query

**User:** "What's the weather in Porto?"

**Tool calls:**
```
1. search(query: "weather")
   → [{ name: "weather", description: "Weather widget showing current conditions for a location", score: 100 }]

2. get(name: "weather")
   → { name: "weather", fields: ["location", "temp", "condition", "icon", "color"] }

3. render(name: "weather", data: {
     location: "Porto, Portugal",
     temp: "22°",
     condition: "Partly Cloudy",
     icon: "⛅",
     color: "#3498db"
   })
   → { url: "https://r2.example.com/widgets/weather-abc123.png" }
```

**Response:** [image: https://r2.example.com/widgets/weather-abc123.png]

---

### Example 2: News Query

**User:** "Show me the latest tech news"

**Tool calls:**
```
1. search(query: "news")
   → [{ name: "rss-feed", description: "RSS feed widget displaying article cards with navigation", score: 100 }]

2. get(name: "rss-feed")
   → { name: "rss-feed", fields: ["item", "currentIndex", "totalItems"] }

3. render(name: "rss-feed", data: {
     item: {
       title: "Takumi: Rust-Powered JSX-to-Image Renderer",
       summary: "Takumi is a Rust-based rendering engine...",
       source: "TechCrunch",
       date: "Jun 21, 2026",
       link: "https://example.com/article"
     },
     currentIndex: 0,
     totalItems: 3,
     color: "#5865f2"
   })
   → { url: "https://r2.example.com/widgets/rss-abc123.png" }
```

**Response:** [image: https://r2.example.com/widgets/rss-abc123.png]

---

### Example 3: Crypto Price Query

**User:** "What's Bitcoin's price?"

**Tool calls:**
```
1. search(query: "crypto")
   → [{ name: "crypto-prices", description: "Cryptocurrency price tracker showing real-time market data", score: 80 }]

2. get(name: "crypto-prices")
   → { name: "crypto-prices", fields: ["coin", "symbol", "price", "change24h"] }

3. render(name: "crypto-prices", data: {
     coin: "Bitcoin",
     symbol: "BTC",
     price: "$67,500",
     change24h: "+2.3%",
     source: "CoinGecko",
     color: "#f7931a"
   })
   → { url: "https://r2.example.com/widgets/crypto-abc123.png" }
```

**Response:** [image: https://r2.example.com/widgets/crypto-abc123.png]

---

### Example 4: Plain Text Fallback

**User:** "Hello, how are you?"

**Tool calls:**
```
1. search(query: "greeting")
   → [] (no matches)
```

**Response:** I'm doing well, thanks for asking! How can I help you today?

---

### Example 5: Render Failure Fallback

**User:** "What's the weather in Tokyo?"

**Tool calls:**
```
1. search(query: "weather")
   → [{ name: "weather", ... }]

2. get(name: "weather")
   → { ... }

3. render(name: "weather", data: { ... })
   → { error: "R2 not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL" }
```

**Response:** Widget rendering failed, here's the information as text: Tokyo is currently 28°C with clear skies.

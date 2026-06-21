# Discord Widgets — Product Requirements Document (PRD)

> **Last updated:** 2026-06-21 · **Status:** In Progress (slices 1–6 done)

## Summary

Discord Widgets is a Hermes Agent subsystem that renders live, interactive data widgets (weather cards, crypto tickers, RSS feeds) as PNG images and delivers them to Discord channels through three delivery paths: **embed directives** (agent-authored `[[embed]]` blocks parsed by the Gateway adapter), **MEDIA: attachments** (file-based fallback), and **webhooks** (autonomous cron/external pushes). The rendering pipeline uses Takumi JSX→PNG, and the system integrates with Hermes Agent via an MCP server for tool-based catalog access and a preview web app for development-time visualization. The goal is to make rich Discord embeds a first-class output type for any Hermes agent run.

---

## Architectural Layers

The system is organized into four layers:

| Layer | Packages | Purpose |
|-------|----------|---------|
| **Render** | `packages/render` | Takumi JSX→PNG engine, widget components (WeatherCard, CryptoPrices, RssFeedCard), registry, Discord delivery |
| **Catalog** | `packages/catalog` | YAML widget definitions, Zod validation schemas, metadata |
| **Embed** | `packages/embed` | `[[embed]]` directive parser (TS + Python), Discord API payload builder, Gateway integration hook |
| **Apps** | `apps/mcp-server`, `apps/preview` | MCP server (list/get/search/render tools), React preview web app |
| **Env** | `packages/env` | Zod-validated environment variables (`DISCORD_WIDGET_WEBHOOK_URL`, `DISCORD_BOT_TOKEN`) |

### Rendering Engine

- **Engine:** `packages/render/src/engine.ts` — Takumi JSX→PNG (replaced Satori)
- **Registry:** `packages/render/src/registry.ts` — name→component mapping
- **Hosting:** `packages/render/src/hosted.ts` — local file write to `out/` (R2 removed)
- **Discord:** `packages/render/src/discord.ts` — webhook delivery with retry + 429 handling

### Embed System

- **Parser (TS):** `packages/embed/src/parser.ts` — parses `[[embed]]` directives from agent responses
- **Builder (TS):** `packages/embed/src/builder.ts` — builds Discord API embed payloads
- **Parser (Python):** `packages/embed/python/embed_parser.py` — 1:1 Python port
- **Adapter Patch:** `packages/embed/python/adapter_patch.py` — 3 manual patch snippets for Hermes Discord adapter
- **Tests:** 19 unit tests + 6 integration tests (Python only)

---

## Delivery Model (3 Paths)

Delivery paths are ordered by priority. The system tries Path 1 first, falls back to Path 2, and Path 3 is for autonomous/cron use.

### Path 1: EMBED DIRECTIVES (Primary)

```
Agent response → [[embed widget="weather" ...]] → Gateway adapter parses → Discord embed with image attachment + interactive buttons
```

- Agent embeds `[[embed]]` directives in its response text
- Gateway adapter intercepts, parses via `embed_parser.py`, renders widget via Takumi, attaches PNG, builds Discord embed payload
- Buttons are pre-defined in the widget's YAML catalog entry
- **Status:** ✅ Live-tested with REST API delivery

### Path 2: MEDIA: ATTACHMENT (Fallback)

```
Agent response contains MEDIA:/path/to/widget.png → Gateway extracts → discord.File() attachment
```

- Agent renders widget to local file, references via `MEDIA:` syntax
- Gateway adapter extracts file path and sends as Discord attachment
- **Status:** ✅ Implemented in gateway adapter patches

### Path 3: WEBHOOK (Autonomous)

```
Cron/external trigger → sendWidgetEmbed() → Discord webhook URL → Discord channel
```

- Standalone delivery path for scheduled/autonomous widget updates
- Uses `packages/render/src/discord.ts` webhook delivery
- **Status:** ✅ Implemented with retry + rate-limit safety

---

## Widget Catalog

| Widget | Status | Description |
|--------|--------|-------------|
| `weather` | ✅ Done | Weather card with conditions, temperature, forecast |
| `crypto-prices` | ✅ Done | Cryptocurrency price ticker (BTC, ETH, etc.) |
| `rss-feed` | ✅ Done | RSS/Atom feed card with latest items |
| `poll` | ⬜ Not started | Interactive poll with vote buttons |
| `chart` | ⬜ Not started | Data visualization / chart widget |
| `dashboard` | ⬜ Not started | Multi-metric dashboard composite |

### Widget Definition Format

Each widget is defined in `packages/catalog` as a YAML file with Zod schema validation:

```yaml
name: weather
version: "1.0"
description: "Weather conditions card"
render:
  component: WeatherCard
  width: 800
  height: 400
buttons:
  - id: refresh
    label: "Refresh"
    style: secondary
  - id: details
    label: "Details"
    style: link
```

---

## Remaining Work

### Slice 7 — Embed Interaction Handler (⬜ Not Started)

**Reworked scope:** Handle Discord button interactions (custom_id → Hermes callback → agent re-renders widget with updated state). Originally planned as pagination/state management; now focuses on the interaction pipeline from Discord button click back to widget re-render.

- Listen for `INTERACTION_CREATE` events on the Gateway
- Route `custom_id` to appropriate handler (refresh, paginate, toggle)
- Trigger Hermes agent callback to re-render widget with updated params
- Update Discord message with new embed + attachment
- **State management:** In-memory state store keyed by interaction token

### Slice 8 — Widget Preview Polish (⬜ Not Started)

**Reworked scope:** Polish `apps/preview` React app with full catalog browsing, live render preview, and interaction simulation.

### Slice 9 — Gateway Plugin (⬜ Not Started, NEW)

**New slice:** Build a Hermes Gateway plugin that auto-applies the Discord adapter patches instead of requiring manual copy-paste from `adapter_patch.py`.

- Package the adapter patches as a proper Hermes plugin
- Auto-register on Gateway startup
- Support config for webhook URL, channel mapping, widget defaults
- Hot-reload support for widget catalog changes

### Slice 10 — Additional Widget Types (⬜ Not Started, NEW)

- `poll` widget: Interactive poll with vote buttons, tally display
- `chart` widget: Bar/line/pie charts from data arrays
- `dashboard` widget: Composite multi-metric layout
- Each new widget requires: component in `render`, YAML in `catalog`, MCP tool support

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_WIDGET_WEBHOOK_URL` | Yes | Discord webhook URL for autonomous delivery |
| `DISCORD_BOT_TOKEN` | Yes | Bot token for Gateway interactions |

---

## MCP Server Tools

The `apps/mcp-server` (Hono) exposes 4 tools:

| Tool | Description |
|------|-------------|
| `list` | List all available widgets in catalog |
| `get` | Get widget definition by name |
| `search` | Search widgets by keyword |
| `render` | Render a widget to PNG (returns file path) |

---

## Key Decisions

1. **R2 removed** — Local file hosting in `out/` directory. No cloud CDN dependency.
2. **Satori → Takumi** — Rendering engine swap for better JSX support.
3. **Embed directives are primary** — Not webhooks, not attachments. The `[[embed]]` pattern is the canonical delivery path.
4. **Python tests are authoritative** — TypeScript has no automated tests yet. Python test suite (19 unit + 6 integration) is the source of truth for the embed parser.
5. **Adapter patches are manual** — Until Slice 9, gateway integration requires manual copy-paste from `adapter_patch.py`.

---

## File Tree (Current)

```
discord-widgets/
├── packages/
│   ├── render/
│   │   └── src/
│   │       ├── engine.ts          # Takumi rendering engine
│   │       ├── registry.ts        # name → component map
│   │       ├── hosted.ts          # local file write to out/
│   │       ├── discord.ts         # webhook delivery
│   │       ├── WeatherCard.tsx
│   │       ├── CryptoPrices.tsx
│   │       └── RssFeedCard.tsx
│   ├── catalog/                   # YAML definitions + Zod schemas
│   ├── embed/
│   │   ├── src/
│   │   │   ├── parser.ts          # TS embed directive parser
│   │   │   ├── builder.ts         # Discord API payload builder
│   │   │   └── hook.ts            # Gateway integration ref
│   │   └── python/
│   │       ├── embed_parser.py    # Python port (1:1)
│   │       ├── adapter_patch.py   # 3 patch snippets
│   │       ├── test_embed_parser.py  # 19 unit tests
│   │       └── test_integration.py   # 6 e2e tests
│   ├── env/                       # Zod env schema
│   ├── ui/                        # empty placeholder
│   └── config/                    # tsconfig.base.json only
├── apps/
│   ├── mcp-server/                # Hono MCP server (4 tools)
│   └── preview/                   # React preview web app
├── scripts/
│   └── generate-widget.ts         # codegen
├── out/                           # rendered PNGs (gitignored)
└── .agents/skills/
    ├── discord-widgets/SKILL.md   # 285-line skill doc
    └── takumi/SKILL.md            # Takumi rendering skill
```

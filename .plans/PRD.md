# PRD: Discord Widgets

## Problem Statement

Hermes (AI agent) currently responds to Discord messages with plain text. Many queries — weather, news, RSS feeds, crypto prices — would benefit from structured, visual responses. Discord embeds via bots are limited to static JSON. There's no system to dynamically generate rich widget images from React components and serve them as visual responses in daily conversations.

The vision: **Hermes renders styled widget cards as PNG images and delivers them as attachments in conversations.** When you ask "what's the weather in Porto?" — you get a polished weather card, not a wall of text.

## Solution

A monorepo system with four layers:

1. **Rendering Engine** — React components rendered to PNG via Takumi (Rust, no browser). Components use Tailwind CSS via the `tw` prop.
2. **Widget Catalog** — YAML-defined widget metadata (name, description, component, category, color, fields, buttons). Zod schemas for validation.
3. **MCP Server** — Tools for Hermes to discover and render widgets: `list`, `search`, `get`, `render`.
4. **Hermes Integration** — Skill that teaches Hermes when to use widgets and how to deliver them (image attachments via `MEDIA:` syntax).

### Delivery Model

**Primary (conversations):** Hermes renders a widget → gets a file path/URL → includes it as `MEDIA:/path/to/widget.png` in the response. No webhook needed. This is how widgets work in daily conversations.

**Secondary (autonomous pushes):** For scheduled/cron tasks that post to channels without a triggering message, a Discord webhook sends the widget as an embed. This is optional and not part of the core flow.

## Current State (what exists)

### Completed
- Takumi rendering engine (`packages/render/src/engine.ts`)
- WeatherCard component (Tailwind, 800×400)
- RssFeedCard component (Tailwind, 800×480, pagination dots, nav bar)
- CryptoPrices component (Tailwind, 800×400)
- Widget codegen script (`pnpm generate <name>`)
- Widget catalog with YAML definitions (`packages/catalog/src/widgets/`)
- Widget registry mapping names → components (`packages/render/src/registry.ts`)
- Widget preview web app (`apps/preview/` — Hono + React + Vite + Tailwind)
- Takumi skill (`.agents/skills/takumi/`)
- Discord Widgets skill (`.agents/skills/discord-widgets/`) — v1.2.0 with MEDIA: delivery
- Demo script rendering all widgets as PNG
- Image upload to R2 (optional, falls back to local files)
- MCP server with 4 tools: list, search, get, render
- Discord webhook delivery (optional, for autonomous pushes)

### Not Started
- Button interaction handler (Previous/Next pagination via bot)
- Preview app polish (category filtering, metadata display, render comparison)
- Community template system

## User Stories

1. As a Hermes user, I want to ask "what's the weather in Porto?" and receive a visual weather widget card instead of plain text, so that the information is more scannable and pleasant.
2. As a Hermes user, I want to ask "show me the latest RSS articles" and receive a paginated widget with Previous/Next navigation, so that I can browse content without leaving Discord.
3. As a Hermes user, I want widget responses to include interactive buttons (Read Article, Previous, Next), so that I can take actions directly from the embed.
4. As a Hermes user, I want widgets to load fast (< 2s), so that the experience feels responsive.
5. As a developer, I want to create new widgets with `pnpm generate <name>`, so that adding widgets is a 2-minute task.
6. As a developer, I want to preview widgets in a web app with hot reload, so that I can iterate on designs quickly.
7. As a developer, I want widget templates defined in YAML, so that non-developers can edit metadata without touching code.
8. As a Hermes operator, I want the MCP server to let Hermes discover available widgets, so that it can choose the right widget for a query.
9. As a Hermes operator, I want Hermes to match user queries to widgets automatically, so that widget responses happen without manual configuration.
10. As a Hermes operator, I want rendered widget images delivered as attachments in conversations, so that Discord displays them natively without external hosting.
11. As a Hermes operator, I want button clicks on widget embeds to trigger actions (navigate pages, open links), so that widgets are interactive.
12. As a developer, I want widget components to use Tailwind CSS, so that styling is fast and consistent.
13. As a Hermes user, I want widget images to include the source/article link, so that I can click through to full content.
14. As a Hermes operator, I want the system to handle multiple widget types (weather, news, crypto, polls, etc.), so that Hermes can respond to diverse queries visually.

## Implementation Decisions

### Rendering
- **Takumi over Satori** — Takumi supports Tailwind CSS, CSS Grid, backdrop-filter, emoji, and animations. Satori only supports inline styles. Decision made after evaluating both.
- **`tw` prop for Tailwind** — Components use `<div tw="flex p-12 bg-gray-900">` instead of `style={{}}`. Takumi resolves Tailwind at render time.
- **No browser required** — Takumi is a Rust binary (napi-rs for Node.js, WASM for edge). No Playwright/Puppeteer overhead.

### Widget Architecture
- **Component + Catalog split** — React components in `packages/render/src/components/`, metadata in `packages/catalog/src/widgets/*.yaml`. Separation of visual logic from catalog data.
- **Registry pattern** — `packages/render/src/registry.ts` maps widget names to components. MCP server uses this to dynamically load and render widgets.
- **Codegen** — `pnpm generate <name>` creates component + catalog entry + updates exports. Prevents boilerplate mistakes.

### Preview App
- **Server-side rendering** — Widget components are rendered as PNG on the server (via Takumi), not in the browser. The preview shows the actual rendered image.
- **Mock Discord buttons** — Below the rendered image, HTML/CSS buttons mock how Discord would display the embed's interactive elements.

### Image Hosting
- **Local-first, R2 optional** — Widgets render to local files by default. When R2 is configured, they upload to CDN for persistent URLs. The local fallback means the system works without any cloud credentials.

### MCP Server
- **Hono + MCP SDK** — Lightweight API server exposing tools for widget discovery and rendering.
- **Four tools**: `list` (browse catalog), `search` (fuzzy match), `get` (template lookup), `render` (generate PNG and return path/URL).

### Hermes Integration
- **Skill-based matching** — A Hermes skill that teaches the agent when to use widgets and how to select the right one.
- **MEDIA: delivery** — Widget images are delivered as attachments in Hermes responses using `MEDIA:/path/to/file.png`. No webhook needed for conversation responses.
- **Webhook delivery (secondary)** — Optional webhook for autonomous/scheduled pushes to channels. Not part of the core flow.
- **Button interactions** — Bot handles button clicks ( Previous/Next pagination, link opens). Requires Discord bot with message component interactions. Only relevant for webhook-sent embeds (conversation attachments don't support interactive buttons).

## Testing Decisions

- **Widget rendering** — Each component should render without errors. Test via `pnpm -F @discord-widgets/render demo`.
- **Catalog parsing** — YAML files should parse to valid Widget schemas. Test via `loadWidgets()` function.
- **MCP tools** — Each tool should return expected structure. Test with mock data.
- **Integration** — End-to-end: query → widget match → render → image attachment. Test manually in Discord.
- **Visual regression** — Screenshot comparison for widget renders (future).

## Out of Scope

- Full dashboard/admin UI (only a simple preview app)
- Widget template editor (preview polish only, no editing)
- Widget analytics (views, clicks)
- Multi-language widget support
- Widget versioning/rollbacks
- Custom widget creation by end-users (developer-only for now)
- Real-time streaming widgets (static images only)

## Further Notes

- The project follows the Agora Feed monorepo conventions (Turborepo, Biome, pnpm, workspace refs).
- Widget components must follow Takumi constraints: explicit `display: flex` on multi-child containers, `tw` prop for Tailwind, no system fonts.
- The preview app (`apps/preview/`) is the primary development tool for widget design.
- Discord embed buttons are limited to 5 per message. Widget nav should stay within this limit.

# Slice 3: MCP Server — Catalog Tools

## Goal

The MCP server exposes tools that let Hermes discover available widgets. This is the foundation for Hermes to autonomously choose and render widgets.

## Issues

### T1: Set up MCP server with Hono + MCP SDK

**What to build:**
Initialize `apps/mcp-server/` with a working Hono server and MCP SDK integration. The server should:
- Start on a configurable port
- Register MCP tools via the SDK
- Serve health check endpoint
- Use stdio transport (for Hermes integration)

**Acceptance criteria:**
- [x] Server starts without errors
- [x] MCP tools are registered and discoverable
- [x] Health check returns 200
- [x] Server can be started via `pnpm dev:mcp`

**Dependencies:** None — can start immediately

**Metadata:**
- **Source:** PRD Phase 2 (MCP Server)
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T2: Implement `list` tool

**What to build:**
Create an MCP tool `list` that returns all available widgets from the catalog. Accepts optional `category` filter. Returns widget metadata (name, description, category, color, fields, buttons).

```typescript
// Tool: list
// Input: { category?: string }
// Output: WidgetMeta[]
```

Use the `loadWidgets()` function from `packages/catalog/`.

**Acceptance criteria:**
- [x] `list` tool returns all widgets when no filter
- [x] `list` with `category` filter returns matching widgets
- [x] Output includes name, description, category, color, fields, buttons
- [x] Empty catalog returns empty array (not error)

**Dependencies:** T1

**Metadata:**
- **Source:** PRD Phase 2 (list tool)
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T3: Implement `search` tool

**What to build:**
Create an MCP tool `search` that fuzzy-matches widgets by query string. Search across name, description, and category fields. Return ranked results with score.

```typescript
// Tool: search
// Input: { query: string, limit?: number }
// Output: { name, description, score }[]
```

Use simple fuzzy matching (Levenshtein or includes + scoring). No external dependency needed for v1.

**Acceptance criteria:**
- [x] `search("weather")` returns WeatherCard
- [x] `search("rss")` returns RssFeedCard
- [x] `search("crypto")` returns CryptoPrices
- [x] `search("xyz")` returns empty array
- [x] Results are ranked by relevance score
- [x] `limit` parameter works

**Dependencies:** T1

**Metadata:**
- **Source:** PRD Phase 2 (search tool)
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T4: Implement `get` tool

**What to build:**
Create an MCP tool `get` that returns the full template definition for a specific widget by name. Includes the component code reference, catalog metadata, and available data fields.

```typescript
// Tool: get
// Input: { name: string }
// Output: WidgetFull | null
```

**Acceptance criteria:**
- [x] `get("weather")` returns full WeatherCard template
- [x] `get("nonexistent")` returns null (not error)
- [x] Output includes component reference, fields, buttons, example data

**Dependencies:** T1

**Metadata:**
- **Source:** PRD Phase 2 (get tool)
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

## Changelog / Status Report

**Date:** 2026-06-21
**Completed by:** MiMoCode Agent

### Summary
Implemented the MCP server with Hono and MCP SDK integration, providing three catalog tools (`list`, `search`, `get`) that enable Hermes to discover and retrieve widget definitions. The server uses stdio transport for Hermes integration and includes a health check endpoint.

### Tasks Completed

| Task | Status | Notes |
|------|--------|-------|
| T1: Set up MCP server with Hono + MCP SDK | ✅ Done | Server starts on configurable port, registers MCP tools, health check returns 200, starts via `pnpm dev:mcp` |
| T2: Implement `list` tool | ✅ Done | Returns all widgets with optional category filter, includes required metadata fields |
| T3: Implement `search` tool | ✅ Done | Fuzzy matching with scoring across name, description, category fields, supports limit parameter |
| T4: Implement `get` tool | ✅ Done | Returns full widget template by name, null for nonexistent widgets |

### Files Changed
- `apps/mcp-server/package.json` (modified - added @modelcontextprotocol/sdk dependency)
- `apps/mcp-server/src/index.ts` (modified - implemented MCP server with all tools)

### Validation
- `pnpm check-types` passes for entire monorepo
- `pnpm dev:mcp` starts server successfully
- Health check endpoint returns 200
- All acceptance criteria verified

### Next Steps
1. Integrate MCP server with Hermes for widget discovery

### Code Review Findings (Fixed)

1. **🔴 `notifications/initialized` returned error:** MCP protocol sends this notification after handshake, but the server had no handler and returned `-32601 Method not found`. Fixed by adding `server.setNotificationHandler(NotificationsInitializedSchema, async () => {})` to silently acknowledge it.

2. **🟡 Raw OpenSSL error on render failure:** The render tool's catch block passed through raw Node.js SSL errors (e.g. `EPROTO ssl3_read_bytes`). Fixed by adding friendly error messages that detect "not found in registry" and "R2 not configured" patterns and return actionable text.

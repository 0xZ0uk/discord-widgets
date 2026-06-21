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
- [ ] Server starts without errors
- [ ] MCP tools are registered and discoverable
- [ ] Health check returns 200
- [ ] Server can be started via `pnpm dev:mcp`

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
- [ ] `list` tool returns all widgets when no filter
- [ ] `list` with `category` filter returns matching widgets
- [ ] Output includes name, description, category, color, fields, buttons
- [ ] Empty catalog returns empty array (not error)

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
- [ ] `search("weather")` returns WeatherCard
- [ ] `search("rss")` returns RssFeedCard
- [ ] `search("crypto")` returns CryptoPrices
- [ ] `search("xyz")` returns empty array
- [ ] Results are ranked by relevance score
- [ ] `limit` parameter works

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
- [ ] `get("weather")` returns full WeatherCard template
- [ ] `get("nonexistent")` returns null (not error)
- [ ] Output includes component reference, fields, buttons, example data

**Dependencies:** T1

**Metadata:**
- **Source:** PRD Phase 2 (get tool)
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

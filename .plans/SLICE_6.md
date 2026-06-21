# Slice 6 — MCP Server & Preview App

> **Status:** ✅ DONE  
> **Package:** `apps/mcp-server`, `apps/preview`

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-21 | Rewritten to reflect actual implementation. MCP server has 4 tools. Preview is React app. Both functional. |

---

## Goal

Build an MCP server for programmatic widget access and a React web app for visual widget preview.

## What Was Built

### MCP Server (`apps/mcp-server`)
- Hono-based HTTP server
- 4 tools exposed via MCP protocol:

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `list` | List all widgets | — | Widget names + metadata |
| `get` | Get widget definition | `name: string` | Full YAML definition |
| `search` | Search widgets | `query: string` | Matching widgets |
| `render` | Render widget to PNG | `name: string, props: object` | File path to PNG |

### Preview App (`apps/preview`)
- React web app for visual widget preview
- Renders widgets using the Takumi engine
- Displays rendered PNG output
- Uses hosted file URL for image display

### Integration
- MCP server queries `packages/catalog` for widget definitions
- Render tool invokes `packages/render` engine
- Preview app displays output from render pipeline

## Acceptance Criteria

- [x] MCP server starts and responds to requests
- [x] `list` tool returns all 3 widgets
- [x] `get` tool returns widget definition by name
- [x] `search` tool finds widgets by keyword
- [x] `render` tool produces PNG file and returns path
- [x] Preview app renders widgets visually
- [x] Preview app uses hosted URL for image display

## Dependencies

- `hono` (HTTP framework)
- `packages/render` (rendering engine)
- `packages/catalog` (widget definitions)

## API Endpoints (MCP Server)

```
POST /mcp/tools/list       → { widgets: WidgetMeta[] }
POST /mcp/tools/get        → { widget: WidgetDef }
POST /mcp/tools/search     → { widgets: WidgetMeta[] }
POST /mcp/tools/render     → { path: string, url: string }
```

## Known Limitations

- No authentication on MCP server
- Preview app is basic — no interaction simulation
- No hot-reload for widget catalog changes
- Only 1 PNG rendered at a time
- Preview doesn't support testing `[[embed]]` directives

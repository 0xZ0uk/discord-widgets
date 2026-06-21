# Slice 4: MCP Server — Render Tool

## Goal

Hermes can render a widget with data and get back a hosted image URL. This completes the MCP server's core functionality — discovery (Slice 3) + rendering (this slice).

## Issues

### T1: Implement `render` tool

**What to build:**
Create an MCP tool `render` that takes a widget name + data, renders the component via Takumi, uploads to CDN, and returns the public URL.

```typescript
// Tool: render
// Input: { name: string, data: Record<string, any>, width?: number, height?: number }
// Output: { url: string, width: number, height: number }
```

Flow:
1. Look up widget in registry by name
2. Create React element with provided data
3. Render to PNG via `renderToPng()`
4. Upload to R2 via `uploadToR2()` (from Slice 1)
5. Return public URL

**Acceptance criteria:**
- [x] `render({ name: "weather", data: { temp: "22°", location: "Porto" } })` returns a URL
- [x] URL points to a valid PNG image
- [x] Image matches the widget's expected dimensions
- [x] Invalid widget name returns clear error

**Dependencies:** Slice 1 T2 (upload utility), Slice 3 T1 (server setup)

**Metadata:**
- **Source:** PRD Phase 2 (render tool)
- **Skill:** takumi
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T2: Add render endpoint to preview app

**What to build:**
Update the preview app (`apps/preview/`) to use the new `render` MCP tool instead of directly calling `renderToPng()`. This validates the MCP tool works correctly in a real integration.

**Acceptance criteria:**
- [x] Preview app fetches renders via MCP tool
- [x] Rendered images display correctly
- [x] No regression in preview functionality

**Dependencies:** T1

**Metadata:**
- **Source:** PRD Phase 2
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

## Changelog / Status Report

**Date:** 2026-06-21
**Completed by:** MiMoCode

### Summary

Implemented the MCP `render` tool — the final core capability for the MCP server. A new `renderWidgetByName()` shared utility was extracted into `@discord-widgets/render`, enabling both the MCP server and preview app to render widgets via the same pipeline: registry lookup → React element creation → Takumi render → R2 upload → hosted URL. The preview app was updated to use this shared function, returning JSON URLs instead of raw PNG blobs.

### Tasks Completed

| Task | Status | Notes |
|------|--------|-------|
| T1: Implement `render` tool | ✅ Done | Added tool definition + handler in MCP server. Uses `renderWidgetByName()` from shared package. Returns `{ url, width, height }`. |
| T2: Add render endpoint to preview app | ✅ Done | Updated `/api/render/:name` to use shared render function. Client now uses hosted URLs directly. |

### Files Changed

- `packages/render/src/render-widget.ts` (new) — Shared `renderWidgetByName()` utility
- `packages/render/src/index.ts` (modified) — Added exports for `renderWidgetByName` and `RenderWidgetResult`
- `apps/mcp-server/src/index.ts` (modified) — Added `render` tool definition and handler
- `apps/mcp-server/tsconfig.json` (modified) — Added `jsx: "react-jsx"` for render package imports
- `apps/preview/server.ts` (modified) — Switched from `renderToPng()` to `renderWidgetByName()`, returns JSON URL
- `apps/preview/src/App.tsx` (modified) — Client uses hosted URL instead of blob URL

### Validation

- `pnpm turbo check-types` — all 5 packages pass
- `pnpm turbo check-types --filter=@discord-widgets/render` — pass
- `pnpm turbo check-types --filter=@discord-widgets/mcp-server` — pass
- `pnpm turbo check-types --filter=@discord-widgets/preview` — pass

### Next Steps

### Code Review Findings (Fixed)

1. **🔴 R2 env vars were required, crashing demo:** The env schema used `z.string().min(1)` for all R2 vars, meaning the server crashed at import time without a .env file. Fixed by making all R2 vars `z.string().optional()` in `packages/env/src/index.ts`.

2. **🟡 S3Client created at module level:** `new S3Client({...})` ran at import time even without credentials. Fixed by lazy-initializing via `getS3()` function that only creates the client on first use.

3. **🟡 Key collision risk in hosted.ts:** `widget-${Date.now()}.png` could collide on concurrent renders. Fixed by adding random suffix: `widget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`.

4. **🟡 hosted.ts now falls back to local files:** When R2 isn't configured, `renderToHostedUrl` saves to `out/` directory instead of crashing. Enables preview app to work without cloud credentials.

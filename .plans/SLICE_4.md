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
- [ ] `render({ name: "weather", data: { temp: "22°", location: "Porto" } })` returns a URL
- [ ] URL points to a valid PNG image
- [ ] Image matches the widget's expected dimensions
- [ ] Invalid widget name returns clear error

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
- [ ] Preview app fetches renders via MCP tool
- [ ] Rendered images display correctly
- [ ] No regression in preview functionality

**Dependencies:** T1

**Metadata:**
- **Source:** PRD Phase 2
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

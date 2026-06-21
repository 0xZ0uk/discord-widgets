# Slice 8 — Widget Preview Polish

> **Status:** ⬜ NOT STARTED  
> **Package:** `apps/preview`

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-21 | **REWORKED.** Original scope was basic preview. New scope: full catalog browsing, live render preview, interaction simulation, embed directive testing. |

---

## Goal

Polish the `apps/preview` React app into a complete widget development and testing environment with catalog browsing, live rendering, and interaction simulation.

## Scope

### Features

1. **Catalog Browser**
   - Sidebar listing all widgets from catalog
   - Search/filter by name or description
   - Click to preview widget with default props

2. **Live Render Preview**
   - Edit props in a form panel
   - Real-time re-render as props change
   - Display rendered PNG at full size
   - Show render metadata (dimensions, file size, render time)

3. **Interaction Simulation**
   - Simulate Discord button clicks
   - Test `custom_id` routing
   - Preview state changes
   - Mock interaction payloads

4. **Embed Directive Testing**
   - Text editor for `[[embed]]` directives
   - Parse and preview embed payload
   - Show Discord embed mock-up
   - Validate directive syntax

5. **Export & Share**
   - Copy rendered PNG URL
   - Download PNG file
   - Copy `[[embed]]` directive text
   - Copy Discord API payload JSON

### UI Layout

```
┌─────────────┬──────────────────────┬──────────────┐
│  Catalog    │  Render Preview      │  Props       │
│  Sidebar    │  (PNG display)       │  Editor      │
│             │                      │              │
│  weather    │  ┌──────────────┐    │  location:   │
│  crypto     │  │              │    │    [NYC   ]  │
│  rss-feed   │  │  Widget PNG  │    │  temp:       │
│             │  │              │    │    [72    ]  │
│  search...  │  └──────────────┘    │  condition:  │
│             │                      │    [Sunny ]  │
│             │  Metadata: 800×400   │              │
│             │  Render: 234ms       │  [Render]    │
└─────────────┴──────────────────────┴──────────────┘
```

## Acceptance Criteria

- [ ] Catalog sidebar lists all 3 widgets
- [ ] Search/filter works across widget names and descriptions
- [ ] Selecting a widget loads its YAML definition + default props
- [ ] Props editor allows editing all widget parameters
- [ ] Re-render button produces updated PNG
- [ ] Rendered PNG displays at full size
- [ ] Metadata panel shows dimensions, file size, render time
- [ ] Embed directive text editor with syntax highlighting
- [ ] Directive parser validates and previews embed payload
- [ ] Discord embed mock-up shows final appearance
- [ ] Copy-to-clipboard for PNG URL, directive text, API payload

## Dependencies

- `apps/preview` (existing React app)
- `packages/render` (rendering engine)
- `packages/catalog` (widget definitions)
- `packages/embed` (parser for directive testing)

## Tech Stack

- React (existing)
- Tailwind CSS (styling)
- Monaco Editor or CodeMirror (text editing)
- `packages/render` engine (client-side or server-side rendering)

## Open Questions

1. Should rendering happen client-side (WASM Takumi) or server-side (MCP render tool)?
2. Should we support multiple widget preview in a grid layout?
3. Do we need undo/redo in the props editor?
4. Should we persist preview state to localStorage?

## Risks

- Client-side rendering may be slow for complex widgets
- Monaco Editor bundle size impact on preview app
- State synchronization between props editor and preview

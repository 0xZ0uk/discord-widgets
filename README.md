# Discord Widgets

React-rendered images for Discord embeds. Think Farcaster Frames, but for Discord.

## What Is This?

Discord Widgets renders React components to PNG images, then serves them as rich Discord embeds. Instead of plain text, Hermes sends structured, visual widget cards.

**The pipeline:**

```
User query → Hermes matches widget → Fetches data → Renders React component → Sends Discord embed
```

## Architecture

```
discord-widgets/
├── apps/
│   └── mcp-server/          # MCP server (list, search, get, render tools)
├── packages/
│   ├── render/               # Core: React → Takumi (Rust) → PNG
│   │   └── src/
│   │       ├── engine.ts     # Rendering pipeline
│   │       ├── components/   # React widget components (Tailwind CSS)
│   │       └── demo.tsx      # Test rendering
│   ├── catalog/              # Widget schemas (Zod) + template definitions
│   ├── config/               # Shared tsconfig.base.json
│   ├── env/                  # Environment variable schemas
│   └── ui/                   # Shared React components
├── .agents/skills/           # Hermes skill (discord-widgets)
├── biome.json                # Lint + format (tabs, double quotes)
├── turbo.json                # Build orchestration
└── pnpm-workspace.yaml       # Workspace + dependency catalog
```

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Rendering** | [Takumi](https://takumi.kane.tw/) | React JSX → PNG (Rust, Tailwind CSS) |
| **Server** | [Hono](https://hono.dev/) + MCP SDK | Lightweight API + tool serving |
| **Schema** | [Zod](https://zod.dev/) | Widget template validation |
| **Monorepo** | [Turborepo](https://turbo.build/) + pnpm | Build orchestration |
| **Lint** | [Biome](https://biomejs.dev/) | Format + lint |
| **Agent** | [Hermes](https://hermes-agent.nousresearch.com/) | Widget matching + orchestration |

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+

### Install

```bash
git clone git@github.com:0xZ0uk/discord-widgets.git
cd discord-widgets
pnpm install
```

### Run the Demo

Render sample widget cards:

```bash
pnpm -F @discord-widgets/render demo
```

This creates `packages/render/src/weather-demo.png` and `rss-demo-*.png` — images rendered entirely from React components via Takumi.

### Development

```bash
# Start all packages in watch mode
pnpm dev

# Start just the MCP server
pnpm dev:mcp

# Type check everything
pnpm check-types

# Lint + format
pnpm check
```

## Creating a Widget

### 1. Define the Component

Create a React component in `packages/render/src/components/` using Tailwind CSS via the `tw` prop:

```tsx
import type { FunctionComponent } from "react";

export interface MyWidgetProps {
  title: string;
  value: string;
  color?: string;
}

export const MyWidget: FunctionComponent<MyWidgetProps> = ({
  title,
  value,
  color = "#5865f2",
}) => (
  <div
    tw="w-[800px] h-[400px] bg-[#1a1a2e] rounded-3xl p-12 text-white font-sans"
  >
    <div tw="text-sm opacity-60">{title}</div>
    <div tw="text-[72px] font-extrabold mt-4">
      {value}
    </div>
  </div>
);
```

### 2. Register the Widget

Add your component to `packages/render/src/index.ts`:

```typescript
export { MyWidget } from "./components/MyWidget.js";
export type { MyWidgetProps } from "./components/MyWidget.js";
```

### 3. Create the Catalog Entry

Create `packages/catalog/src/widgets/my-widget.yaml`:

```yaml
name: my-widget
description: "A custom widget for displaying data"
component: MyWidget
category: custom
color: "#5865f2"
fields:
  - name: title
    type: string
    required: true
  - name: value
    type: string
    required: true
buttons: []
```

### 4. Render It

```typescript
import { renderToPng } from "@discord-widgets/render";
import { MyWidget } from "@discord-widgets/render/components/MyWidget";

const png = await renderToPng(
  <MyWidget title="Status" value="Online" />,
  { width: 800, height: 400 }
);
```

## Tailwind CSS (via `tw` prop)

Takumi supports full Tailwind CSS via the `tw` prop on any JSX element. Use it instead of inline `style` objects:

```tsx
// ✅ Use tw prop
<div tw="flex items-center justify-between p-4 bg-gray-900 rounded-xl">

// ❌ Avoid inline styles
<div style={{ display: "flex", alignItems: "center", padding: "16px" }}>
```

For dynamic values that can't be expressed as Tailwind classes (e.g., user-provided colors), combine `tw` with `style`:

```tsx
<div tw="absolute top-0 left-0 right-0 h-1" style={{ background: dynamicColor }}>
```

### Supported CSS Features

| ✅ Supported | Examples |
|-------------|---------|
| Flexbox | `flex`, `flex-col`, `items-center`, `justify-between` |
| Grid | `grid`, `grid-cols-3`, `gap-4` |
| Gradients | `bg-gradient-to-r from-blue-500 to-purple-500` |
| Backdrop filter | `backdrop-blur-lg`, `backdrop-brightness-50` |
| Mix blend mode | `mix-blend-multiply` |
| Clip path | `clip-path-[polygon(...)]` |
| Animations | `animate-spin`, `@keyframes` |
| Emoji | Native emoji rendering |
| Custom fonts | Via `fonts` option in `render()` |

## Roadmap

- [ ] **Phase 1: Rendering Pipeline** ← You are here
  - [x] Takumi engine setup
  - [x] WeatherCard sample component
  - [x] RssFeedCard component
  - [x] Demo script + render verification
  - [ ] Image upload (R2/S3)
  - [ ] 3+ widget components
- [ ] **Phase 2: MCP Server**
  - [ ] `list` tool (catalog browse)
  - [ ] `search` tool (fuzzy match)
  - [ ] `get` tool (template lookup)
  - [ ] `render` tool (generate + send)
- [ ] **Phase 3: Hermes Integration**
  - [ ] Widget matching skill
  - [ ] Discord webhook delivery
  - [ ] Button interaction handler
- [ ] **Phase 4: Polish**
  - [ ] Widget preview UI (web app with Tailwind + shadcn)
  - [ ] Template editor
  - [ ] Community templates

## Project Conventions

- **Indentation:** Tabs (enforced by Biome)
- **Quotes:** Double quotes in TypeScript
- **Modules:** ESM (`"type": "module"`)
- **Internal deps:** `workspace:*`
- **Shared versions:** `catalog:` in pnpm-workspace.yaml
- **Package naming:** `@discord-widgets/*`

## License

MIT

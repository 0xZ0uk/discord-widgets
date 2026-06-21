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
│   ├── render/               # Core: React → Satori (SVG) → Resvg (PNG)
│   │   └── src/
│   │       ├── engine.ts     # Rendering pipeline
│   │       ├── components/   # React widget components
│   │       ├── fonts/        # Custom fonts for Satori
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
| **Rendering** | [Satori](https://github.com/vercel/satori) | React JSX → SVG (no browser) |
| **Image** | [@resvg/resvg-js](https://github.com/nicolo-ribaudo/resvg-js) | SVG → PNG (fast, native) |
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

Render a sample WeatherCard widget:

```bash
pnpm -F @discord-widgets/render demo
```

This creates `packages/render/src/weather-demo.png` — an 800×400 PNG rendered entirely from React components via Satori.

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

Create a React component in `packages/render/src/components/`:

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
    style={{
      width: "800px",
      height: "400px",
      background: "#1a1a2e",
      borderRadius: "24px",
      padding: "48px",
      color: "white",
      fontFamily: "sans-serif",
    }}
  >
    <div style={{ fontSize: "16px", opacity: 0.6 }}>{title}</div>
    <div style={{ fontSize: "72px", fontWeight: 800, marginTop: "16px" }}>
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

## Fonts

Satori requires fonts to be loaded explicitly — it has no access to the DOM or CSS. There are two approaches:

### Option A: Local Fonts

Place `.ttf`/`.otf` files in `packages/render/src/fonts/`:

```typescript
import { readFileSync } from "node:fs";

const fontData = readFileSync("./src/fonts/Inter-Bold.ttf");

const svg = await satori(component, {
  fonts: [{
    name: "Inter",
    data: fontData,
    weight: 700,
  }],
});
```

### Option B: Google Fonts (Recommended)

Fetch fonts at runtime via the Google Fonts API:

```typescript
async function loadGoogleFont(
  family: string,
  weight: number = 400,
): Promise<FontConfig> {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`;
  const css = await fetch(url).then((r) => r.text());

  // Extract the font URL from CSS
  const match = css.match(/url\((https:\/\/[^)]+)\)/);
  if (!match) throw new Error(`Font not found: ${family}`);

  const data = await fetch(match[1]).then((r) => r.arrayBuffer());

  return { name: family, data, weight };
}

const interBold = await loadGoogleFont("Inter", 700);
```

**Important:** Satori does not support CSS classes, `@import`, or `<link>` tags. All fonts must be loaded as `ArrayBuffer` data and passed explicitly via the `fonts` option.

## Satori Constraints

Satori doesn't support full CSS. Key limitations:

| ✅ Supported | ❌ Not Supported |
|-------------|-----------------|
| `display: flex` | `display: grid` |
| `position: absolute/relative` | `position: fixed/sticky` |
| `background` (solid + gradients) | `backdrop-filter` |
| `border-radius` | `box-shadow` (partial) |
| `linear-gradient` | `radial-gradient` (partial) |
| `transform` | `clip-path` |
| `opacity` | `mix-blend-mode` |
| Inline styles only | CSS classes / Tailwind |

**Rule of thumb:** Use inline styles. Stick to flexbox. Test early, test often.

## Roadmap

- [ ] **Phase 1: Rendering Pipeline** ← You are here
  - [x] Satori engine setup
  - [x] WeatherCard sample component
  - [x] Demo script + render verification
  - [ ] Font loading system (Google Fonts)
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

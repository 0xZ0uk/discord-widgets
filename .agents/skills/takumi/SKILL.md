---
name: takumi
description: "Render JSX to images with full CSS + Tailwind support. Rust-based, no browser. Used in discord-widgets for widget rendering."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [jsx, images, og-images, tailwind, rendering, takumi]
---

# Takumi — JSX to Image Renderer

## What Is It?

Takumi is a Rust rendering engine that converts JSX/HTML to images (PNG, JPEG, WebP, GIF, APNG). No headless browser required. Supports full CSS + Tailwind v4 out of the box.

**Website:** https://takumi.kane.tw
**Docs:** https://takumi.kane.tw/docs
**GitHub:** https://github.com/kane50613/takumi
**NPM:** `takumi-js`

## Install

```bash
pnpm add takumi-js
```

For Next.js, also add to `next.config.ts`:
```ts
serverExternalPackages: ["@takumi-rs/core"],
```

For pnpm with native bindings, add to `.npmrc`:
```
public-hoist-pattern[]=@takumi-rs/core-*
```

## Basic Usage

### Simple render (returns Buffer)

```tsx
import { render } from "takumi-js";

const png = await render(
  <div tw="flex h-full w-full flex-col bg-gray-900 p-12 text-white">
    <h1 tw="text-7xl font-bold">Hello World</h1>
    <p tw="text-2xl opacity-75">Rendered with Takumi</p>
  </div>,
  { width: 1200, height: 630 }
);
// png is a Buffer
```

### ImageResponse (Next.js / route handlers)

```tsx
import { ImageResponse } from "takumi-js/response";

export function GET() {
  return new ImageResponse(
    <div tw="flex h-full w-full items-center justify-center bg-blue-600 text-white text-7xl font-bold">
      OG Image
    </div>,
    { width: 1200, height: 630 }
  );
}
```

## Tailwind CSS

Use the `tw` prop for Tailwind classes. Tailwind v4 is supported out of the box.

```tsx
<div tw="flex flex-col p-12 bg-[#0f0f23] rounded-3xl text-white">
  <h1 tw="text-3xl font-bold">Title</h1>
  <p tw="text-lg opacity-75">Subtitle</p>
</div>
```

**Style priority:** `style` (inline) > `tw` (Tailwind) > preset (HTML defaults)

## CSS Features Supported

| Feature | Status |
|---------|--------|
| Flexbox | ✅ |
| CSS Grid | ✅ |
| Float | ✅ |
| `display: block/inline-block/inline` | ✅ |
| `position: absolute/relative/fixed` | ✅ |
| `calc()` | ✅ |
| `z-index` | ✅ |
| `box-shadow` | ✅ |
| `filter` | ✅ |
| `backdrop-filter` | ✅ |
| `mix-blend-mode` | ✅ |
| `clip-path` | ✅ |
| `mask` | ✅ |
| `background-clip: text` | ✅ |
| `@keyframes` + animations | ✅ |
| Tailwind `animate-*` | ✅ |
| Linear/radial gradients | ✅ |
| CSS variables | ✅ |
| Selectors: `:is()`, `:where()`, `::before`, `::after` | ✅ |
| Emoji (twemoji or from-font) | ✅ |
| RTL text | ✅ |
| WOFF/WOFF2 fonts | ✅ |
| SVG (inline or external) | ✅ |

## Fonts

All fonts must be explicitly loaded. No system fonts available.

```tsx
import { render } from "takumi-js";

const png = await render(
  <div tw="text-4xl font-bold">Custom Font</div>,
  {
    width: 800,
    height: 400,
    fonts: [
      {
        name: "Inter",
        data: () =>
          fetch("https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.woff2")
            .then((r) => r.arrayBuffer()),
      },
    ],
  }
);
```

**Embedded fonts (Node.js):** Geist and Geist Mono are included by default.
**Performance:** TTF > WOFF2 (WOFF2 requires decompression). Use WOFF2 only when file size matters more than speed.

## Emoji

### Dynamic fetching (twemoji)
```tsx
new ImageResponse(<div>Hello 👋😁</div>, { emoji: "twemoji" });
```

### From font
```tsx
new ImageResponse(<div>Hello 😀</div>, {
  emoji: "from-font",
  fonts: [{ name: "Noto Color Emoji", data: emojiFontData }],
});
```

## Images

External images in `src` attributes and CSS `background-image` are auto-fetched.

### Persistent images (preload)
```tsx
new ImageResponse(<img src="logo" />, {
  persistentImages: [
    { src: "logo", data: () => fetch("/logo.png").then(r => r.arrayBuffer()) },
  ],
});
```

### Image caching
```tsx
const cache = new Map<string, ArrayBuffer>();
await render(element, { resourcesOptions: { cache } });
```

## Animations

### Simple animated output
```tsx
import { Renderer } from "takumi-js/node";
import { fromJsx } from "takumi-js/helpers/jsx";

const renderer = new Renderer();
const { node, stylesheets } = await fromJsx(
  <div tw="w-full h-full items-center justify-center">
    <style>{`@keyframes move { from { transform: translateX(0); } to { transform: translateX(60px); } }`}</style>
    <div tw="w-10 h-10 bg-red-500 animate-[move_1s_ease-in-out_infinite_alternate]" />
  </div>
);

const output = await renderer.renderAnimation({
  width: 100, height: 100,
  fps: 30, format: "webp",
  stylesheets,
  scenes: [{ durationMs: 1000, node }],
});
```

### Single frame at time
```tsx
const frame = await render(<Scene />, {
  width: 100, height: 100,
  format: "png",
  keyframes: { move: { from: { transform: "translateX(0)" }, to: { transform: "translateX(60px)" } } },
  timeMs: 500,
});
```

### Tailwind animation utilities
- Presets: `animate-spin`, `animate-ping`, `animate-pulse`, `animate-bounce`
- Arbitrary: `animate-[move_1s_ease-in-out_infinite_alternate]` (`_` → space)

## Measure API

Get layout dimensions without rendering:

```tsx
import { Renderer } from "takumi-js/node";
import { fromJsx } from "takumi-js/helpers/jsx";

const renderer = new Renderer();
const { node, stylesheets } = await fromJsx(<span tw="text-xl">Text</span>);
const { width, height } = await renderer.measure(node, { stylesheets });
```

## Performance Tips

1. **Reuse the Renderer instance** — don't create a new one per render
2. **Preload frequently used images** — use `persistentImages`
3. **Prefer TTF over WOFF2** — TTF is raw, WOFF2 needs decompression
4. **Stack filters in a single node** — avoid composition layers with same size as viewport
5. **Use `@takumi-rs/core` over WASM** — native N-API with Rayon multithreading

## Debugging

Use `drawDebugBorder: true` to visualize layout:

```tsx
new ImageResponse(<div />, { width: 100, height: 100, drawDebugBorder: true });
```

## v1 Breaking Changes

- `display` defaults to `inline` (was `flex`). Always add `flex` explicitly.
- Import from `takumi-js/response` not `@takumi-rs/image-response`
- Format strings are lowercase: `"webp"` not `"WebP"`
- `putPersistentImage` takes `ImageSource` object, not raw Buffer

## Common Patterns

### Widget card (Discord embed style)
```tsx
<div tw="flex w-[800px] h-[480px] flex-col rounded-3xl bg-[#0f0f23] p-12 text-white font-sans">
  <div tw="text-sm font-semibold text-[#5865f2] uppercase mb-4">Source</div>
  <h1 tw="text-4xl font-bold leading-tight mb-5">Title</h1>
  <p tw="text-xl opacity-75 flex-1">Summary text here</p>
  <div tw="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-sm opacity-50">
    <div>← Previous</div>
    <div>1 / 3</div>
    <div>Next →</div>
  </div>
</div>
```

### OG image
```tsx
<div tw="flex h-full w-full flex-col justify-between bg-[#16130f] p-14 text-white">
  <div tw="flex items-center justify-between">
    <span tw="text-2xl text-[#a8a29a]">site.com</span>
  </div>
  <h1 tw="text-7xl font-bold leading-tight">Page Title</h1>
  <div tw="text-2xl text-[#a8a29a]">Description</div>
</div>
```

## Pitfalls

- **No system fonts** — must load all fonts explicitly
- **`display` default is `inline` in v1** — always add `flex`/`grid` when needed
- **No `fetch` in some runtimes** — Node.js undici can be unstable; Bun is more reliable
- **pnpm hoisting** — add `public-hoist-pattern[]=@takumi-rs/core-*` to `.npmrc`
- **CSS custom properties for animation** — `animate-(--custom)` not supported yet
- **No `display: grid` on root** — grid works but test with `drawDebugBorder` first

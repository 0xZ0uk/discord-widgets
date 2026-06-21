# Slice 1 — Render Engine & First Widget

> **Status:** ✅ DONE  
> **Package:** `packages/render`

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-21 | Rewritten to reflect actual implementation. R2 removed, Takumi replaces Satori. Local file hosting only. |

---

## Goal

Set up the Takumi-based rendering engine and deliver the first widget (WeatherCard) as a PNG image.

## What Was Built

### Engine (`packages/render/src/engine.ts`)
- Takumi JSX→PNG rendering pipeline
- Accepts a React component + props, returns PNG buffer
- Replaced Satori (commit 16: "feat: swap Satori for Takumi")

### Registry (`packages/render/src/registry.ts`)
- Maps widget names to components: `{ WeatherCard, CryptoPrices, RssFeedCard }`
- Registry pattern allows dynamic widget lookup

### Hosted (`packages/render/src/hosted.ts`)
- Local file write to `out/` directory
- R2/CDN hosting was removed (commit 3: "refactor: remove R2/CDN dependency, local-first pipeline")
- Generates deterministic filenames for dedup

### Discord Delivery (`packages/render/src/discord.ts`)
- `sendWidgetEmbed()` function for webhook delivery
- Discord API payload construction with embed + image attachment
- Retry logic with 429 rate-limit backoff
- `imageUrl` validation

### WeatherCard Component
- First widget implemented: weather conditions, temperature, forecast display
- JSX component rendered via Takumi engine

### Codegen Script (`scripts/generate-widget.ts`)
- Scaffolds new widget component from template

## Acceptance Criteria

- [x] Takumi engine renders JSX to PNG
- [x] WeatherCard produces valid PNG output
- [x] Widget registry maps name → component
- [x] Local file write to `out/` works
- [x] Discord webhook delivery with retry

## Dependencies

- `@anthropic-ai/sdk` (Takumi runtime)
- `react` / `react-dom` (JSX rendering)

## Known Limitations

- Only 1 PNG currently in `out/` directory
- No TypeScript tests (only Python tests for embed parser)
- `packages/ui` is empty placeholder
- `packages/config` has only `tsconfig.base.json`

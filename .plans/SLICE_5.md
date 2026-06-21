# Slice 5 — Additional Widgets (CryptoPrices, RssFeedCard)

> **Status:** ✅ DONE  
> **Package:** `packages/render`, `packages/catalog`

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-21 | Rewritten to reflect actual implementation. 2 additional widgets added. Catalog expanded. |

---

## Goal

Expand the widget catalog beyond WeatherCard with two new widgets: CryptoPrices and RssFeedCard.

## What Was Built

### CryptoPrices Widget
- Component: `packages/render/src/CryptoPrices.tsx`
- Displays cryptocurrency prices (BTC, ETH, etc.)
- YAML definition in `packages/catalog`
- Registered in widget registry

### RssFeedCard Widget
- Component: `packages/render/src/RssFeedCard.tsx`
- Displays RSS/Atom feed items with title, link, date
- YAML definition in `packages/catalog`
- Registered in widget registry

### Registry Update
- `packages/render/src/registry.ts` updated with 3 components:
  - `WeatherCard` (Slice 1)
  - `CryptoPrices` (this slice)
  - `RssFeedCard` (this slice)

### Catalog Update
- 3 YAML definitions now in `packages/catalog`

## Acceptance Criteria

- [x] CryptoPrices renders valid PNG
- [x] RssFeedCard renders valid PNG
- [x] Both widgets registered in registry
- [x] Both widgets have YAML catalog entries
- [x] MCP server can list/search/get all 3 widgets

## Dependencies

- WeatherCard (Slice 1) for registry pattern
- Catalog (Slice 2) for YAML definitions

## Widget Comparison

| Widget | Props | Data Source |
|--------|-------|-------------|
| WeatherCard | `{ location, temp, condition }` | Agent-provided |
| CryptoPrices | `{ coins: [{ symbol, price, change }] }` | Agent-provided |
| RssFeedCard | `{ title, items: [{ title, link, date }] }` | Agent-provided |

## Known Limitations

- All data is agent-provided (no live API fetching in widgets)
- No dynamic data refresh within widget lifecycle
- Each widget is static once rendered

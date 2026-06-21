# Slice 2: Third Widget Component

## Goal

Add a third widget component to demonstrate catalog variety and validate the codegen + preview workflow end-to-end. This proves the system is extensible, not just a two-widget demo.

## Issues

### T1: Create CryptoPrices widget component

**What to build:**
Create `packages/render/src/components/CryptoPrices.tsx` — a widget that displays cryptocurrency prices with:
- Coin name and symbol (e.g., "Bitcoin BTC")
- Current price (large, bold)
- 24h change percentage (green/red)
- Small sparkline or market cap
- Source and timestamp footer

Use Tailwind via `tw` prop. Target 800×400 dimensions.

**Acceptance criteria:**
- [ ] Component renders without errors via `renderToPng()`
- [ ] Uses Tailwind `tw` prop for all styling
- [ ] Accepts props: `coin`, `symbol`, `price`, `change24h`, `source`, `color`
- [ ] Visual hierarchy: price is focal point, change is color-coded

**Dependencies:** None — can start immediately

**Metadata:**
- **Source:** PRD User Story 12, Phase 1 (3+ widgets)
- **Skill:** takumi
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T2: Create catalog entry for CryptoPrices

**What to build:**
Create `packages/catalog/src/widgets/crypto-prices.yaml` with widget metadata matching the component props. Register in the widget registry (`packages/render/src/registry.ts`).

**Acceptance criteria:**
- [ ] YAML file created with correct schema
- [ ] Registry updated with `crypto-prices` → `CryptoPrices` mapping
- [ ] `loadWidgets()` returns the new widget
- [ ] Preview app shows the widget in dropdown

**Dependencies:** T1 (component must exist)

**Metadata:**
- **Source:** PRD User Story 12
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T3: Add CryptoPrices to demo script

**What to build:**
Update `packages/render/src/demo.tsx` to render a sample CryptoPrices widget (e.g., "Bitcoin $67,500 +2.3%"). Verify the rendered PNG looks correct.

**Acceptance criteria:**
- [ ] Demo renders CryptoPrices PNG
- [ ] PNG file is valid and visually correct
- [ ] Demo output shows file size

**Dependencies:** T1, T2

**Metadata:**
- **Source:** PRD Phase 1 (3+ widgets)
- **Skill:** takumi
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

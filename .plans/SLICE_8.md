# Slice 8: Widget Preview Polish

## Goal

Polish the widget preview app (`apps/preview/`) into a proper development tool. No template editor — just a better previewer for iterating on widget designs.

## Issues

### T1: Add widget category filtering to preview

**What to build:**
Add a category filter to the preview app. Show all categories as pills/chips, clicking one filters the widget dropdown. Show widget count per category.

Use the catalog's `category` field from YAML definitions.

**Acceptance criteria:**
- [ ] Category pills displayed above widget dropdown
- [ ] Clicking a category filters the dropdown
- [ ] "All" option shows every widget
- [ ] Widget count shown per category

**Dependencies:** Slice 2 (third widget needed for filtering to be useful)

**Metadata:**
- **Source:** PRD Phase 4 (Polish)
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T2: Show widget metadata in preview

**What to build:**
Display widget metadata below the Discord buttons: name, description, category, available fields, and the YAML source. Help developers understand what data the widget expects.

**Acceptance criteria:**
- [ ] Widget name and description shown
- [ ] Available fields listed with types
- [ ] Buttons from catalog shown (label, style, action type)
- [ ] Collapsible YAML source view

**Dependencies:** None

**Metadata:**
- **Source:** PRD Phase 4
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T3: Improve codegen with interactive prompts

**What to build:**
Update `scripts/generate-widget.ts` to be interactive:
- Prompt for name (with kebab-case validation)
- Prompt for category (suggest existing: weather, content, finance, social, utility)
- Prompt for primary color (default: #5865f2)
- Show summary before creating

Use readline — no new dependencies. Add `--yes` flag to skip prompts for CI.

**Acceptance criteria:**
- [ ] `pnpm generate` prompts for name, category, color
- [ ] Invalid input re-prompts with clear error
- [ ] Summary shown before file creation
- [ ] `--yes` flag skips all prompts

**Dependencies:** None

**Metadata:**
- **Source:** PRD Phase 4
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T4: Add widget render comparison view

**What to build:**
Show the same widget rendered at different sizes (800×400, 800×480, 1200×630) side-by-side. Helps developers verify their widget looks good at common Discord embed dimensions.

**Acceptance criteria:**
- [ ] Three render sizes shown side-by-side
- [ ] Each size renders independently
- [ ] Layout adjusts responsively
- [ ] Click a size to set it as the primary preview

**Dependencies:** None

**Metadata:**
- **Source:** PRD Phase 4
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

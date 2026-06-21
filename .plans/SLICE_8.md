# Slice 8: Template Editor + Polish

## Goal

A web-based template editor for creating and editing widget templates visually, plus polish for the overall developer experience. This is the "make it easy" slice — lowering the barrier to creating new widgets.

## Issues

### T1: Add template editor to preview app

**What to build:**
Extend the preview app (`apps/preview/`) with a template editor:
- Form to edit widget YAML fields (name, description, category, color)
- Live preview that updates as fields change
- Save button that writes back to the YAML file
- Basic form validation (required fields, color picker)

Use existing Tailwind + React setup. Keep it simple — no rich text editor, just form fields.

**Acceptance criteria:**
- [ ] Editor shows current widget metadata in a form
- [ ] Editing fields updates the preview in real-time
- [ ] Save writes changes to the YAML file
- [ ] Validation prevents saving invalid data
- [ ] Editor is accessible from the preview app UI

**Dependencies:** Slice 2 (third widget to have something to edit)

**Metadata:**
- **Source:** PRD Phase 4 (Template editor)
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T2: Improve codegen script with interactive prompts

**What to build:**
Update `scripts/generate-widget.ts` to be interactive:
- Prompt for widget name (with validation)
- Prompt for category (with suggestions)
- Prompt for primary color (with default)
- Show summary before creating

Use readline for simple terminal prompts. Keep it lightweight — no inquirer dependency.

**Acceptance criteria:**
- [ ] `pnpm generate` prompts for name, category, color
- [ ] Invalid input shows clear error and re-prompts
- [ ] Summary shown before file creation
- [ ] `--yes` flag skips prompts (for CI/automation)

**Dependencies:** None

**Metadata:**
- **Source:** PRD Phase 4
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T3: Add widget categories and filtering

**What to build:**
Enhance the catalog and preview app with proper category support:
- Define categories: `weather`, `content`, `finance`, `social`, `utility`
- Preview app filters widgets by category
- MCP `list` tool supports category filtering
- Codegen suggests categories during creation

**Acceptance criteria:**
- [ ] Categories defined in a shared constant
- [ ] Preview app has category dropdown/filter
- [ ] MCP `list` tool filters by category
- [ ] Codegen suggests existing categories

**Dependencies:** Slice 2 (multiple widgets needed to make filtering useful)

**Metadata:**
- **Source:** PRD Phase 4
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T4: Update README with complete documentation

**What to build:**
Update README.md to reflect the complete system:
- Architecture diagram (updated with all components)
- Quick start guide (install, run preview, create widget)
- Widget development guide (codegen, preview, register)
- MCP server guide (start, test tools)
- Deployment guide (R2 setup, Discord bot setup)
- Contributing guide

**Acceptance criteria:**
- [ ] README covers all components
- [ ] Quick start works end-to-end
- [ ] All commands are documented
- [ ] Troubleshooting section included

**Dependencies:** All previous slices

**Metadata:**
- **Source:** PRD Phase 4
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

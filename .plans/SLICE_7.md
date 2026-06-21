# Slice 7: Button Interaction Handler

## Goal

Discord embed buttons (Previous/Next/Link) are interactive when widgets are delivered via **webhooks** (the secondary delivery flow). Clicking them triggers actions like pagination or opening URLs. This is only relevant for webhook-sent embeds — conversation attachments (`MEDIA:`) don't support interactive buttons.

For the primary conversation flow, Hermes handles pagination manually: it renders the next/previous item and sends a new `MEDIA:` attachment when the user asks.

## Issues

### T1: Set up Discord bot with message components

**What to build:**
Create a Discord bot (or extend existing) that listens for message component interactions (button clicks). Use Discord.js or raw Discord API.

The bot should:
- Connect to Discord gateway
- Listen for `INTERACTION_CREATE` events with type `MESSAGE_COMPONENT`
- Acknowledge interactions and respond appropriately

**Acceptance criteria:**
- [ ] Bot connects to Discord and stays online
- [ ] Bot receives button click events
- [ ] Bot acknowledges interactions within 3s (Discord requirement)

**Dependencies:** Slice 6 T2 (bot token configured)

**Metadata:**
- **Source:** PRD Phase 3 (Button interaction handler)
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T2: Implement pagination handler

**What to build:**
When a user clicks "Next" or "Previous" on a widget embed, the bot:
1. Reads the current widget state from the embed (current index, total items)
2. Renders the next/previous widget item
3. Edits the original embed with the new image and updated buttons

The embed should carry metadata (hidden or in footer) to track pagination state:
- `currentIndex` — which item is displayed
- `totalItems` — total items in the set
- `items` — the data array (or reference to it)

For RSS feeds: the bot stores the feed items in memory (or a simple KV store) and paginates through them.

**Note:** In the primary conversation flow, pagination works differently — the user asks "show next" and Hermes renders the next item as a new `MEDIA:` attachment.

**Acceptance criteria:**
- [ ] "Next" button shows the next item
- [ ] "Previous" button shows the previous item
- [ ] Buttons are disabled (grayed out) at start/end
- [ ] Page counter updates (e.g., "2 / 5")
- [ ] Response time < 3s for pagination

**Dependencies:** T1, Slice 1 (image upload), Slice 4 (render tool)

**Metadata:**
- **Source:** PRD Phase 3 (Button interaction handler)
- **Skill:** takumi
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T3: Implement link button handler

**What to build:**
"Read Article" / "🔗 Link" buttons open the associated URL. This is simpler than pagination — the button has a `url` property that Discord handles natively.

Ensure the widget catalog's button definitions include `url` for link-type buttons.

**Acceptance criteria:**
- [ ] Link buttons open the correct URL in browser
- [ ] No bot interaction needed (Discord handles URL buttons natively)

**Dependencies:** None (Discord handles URL buttons natively)

**Metadata:**
- **Source:** PRD Phase 3
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T4: Add pagination state storage

**What to build:**
Implement a simple in-memory (or file-based) store for widget pagination state. When a widget is rendered with multiple items (like RSS feed), store the items and current index so the bot can paginate.

Key structure:
```typescript
interface WidgetState {
  messageId: string;
  widgetName: string;
  items: any[];
  currentIndex: number;
  totalItems: number;
}
```

For v1, use a Map in memory. For persistence, could upgrade to SQLite later.

**Acceptance criteria:**
- [ ] State is stored when widget is first rendered
- [ ] State is retrieved on button click
- [ ] State is updated when pagination happens
- [ ] State is cleaned up after interaction timeout (15min)

**Dependencies:** T1

**Metadata:**
- **Source:** PRD Phase 3
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

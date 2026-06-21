# Slice 7 — Embed Interaction Handler

> **Status:** 🔨 IN PROGRESS (core done, live test pending)
> **Package:** TBD (likely `packages/embed`)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-21 | **REWORKED.** Original scope was pagination/state management. New scope: button custom_id → Hermes callback → agent re-renders widget. Depends on Slice 9 (gateway plugin) for auto-registration. |

---

## Goal

Handle Discord button interactions so users can click widget buttons (Refresh, Details, pagination) and trigger Hermes agent callbacks that re-render the widget with updated state.

## Scope

### Interaction Pipeline

```
User clicks button → Discord sends INTERACTION_CREATE
→ Gateway plugin receives event
→ Route custom_id to handler
→ Trigger Hermes agent callback with interaction context
→ Agent re-renders widget with updated params
→ Update Discord message with new embed + attachment
```

### Responsibilities

1. **Event Listener** — Listen for `INTERACTION_CREATE` events on the Discord Gateway
2. **custom_id Router** — Parse `custom_id` format: `{widget}:{action}:{params}` (e.g., `weather:refresh: NYC`)
3. **Handler Registry** — Map actions to handler functions (refresh, paginate, toggle, navigate)
4. **Agent Callback** — Send interaction context to Hermes agent for re-render decision
5. **Message Update** — Edit original Discord message with new embed + image attachment
6. **State Store** — In-memory state keyed by interaction token (message_id + user_id)

### Button Interaction Format

```json
{
  "custom_id": "weather:refresh:NYC",
  "component_type": 2,
  "message_id": "...",
  "user": { "id": "..." }
}
```

### State Management

- **In-memory store** keyed by `{message_id}:{user_id}`
- State includes: widget name, last render params, interaction history
- TTL: 15 minutes (Discord interaction token expiry)
- No persistence (state lost on restart — acceptable for widget use case)

## Acceptance Criteria

- [ ] Gateway receives `INTERACTION_CREATE` events
- [ ] `custom_id` parsed into widget + action + params
- [ ] Handler dispatches to correct function
- [ ] Hermes agent callback triggered with context
- [ ] Widget re-rendered with updated state
- [ ] Discord message updated with new embed
- [ ] State store manages interaction lifecycle
- [ ] 15-minute TTL cleanup

## Dependencies

- Slice 3 (Embed Directive System) — parser for `[[embed]]` format
- Slice 9 (Gateway Plugin) — auto-registration of interaction handler
- `DISCORD_BOT_TOKEN` env var — required for Gateway connection
- Discord Gateway `INTERACTIONS` intent

## Open Questions

1. Should state be persisted to survive restarts? (Current plan: no)
2. How to handle concurrent clicks on same widget?
3. What's the re-render timeout? (Proposed: 10 seconds)
4. Should we support component-style interactions (select menus, modals)?

## Risks

- Discord Gateway connection stability
- Interaction token expiry (15 min) limits long-running workflows
- Concurrent interaction handling complexity
- Agent callback latency may cause poor UX

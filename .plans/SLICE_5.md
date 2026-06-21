# Slice 5: Hermes Widget Matching Skill

## Goal

Hermes automatically detects when a query would benefit from a widget response and uses the appropriate widget instead of plain text. This is the intelligence layer — connecting user intent to widget rendering.

## Issues

### T1: Create widget matching skill

**What to build:**
Create `.agents/skills/discord-widgets/SKILL.md` (update existing) with comprehensive instructions for Hermes:

**When to use widgets:**
- Query asks for weather → WeatherCard
- Query asks for news/articles/RSS → RssFeedCard
- Query asks for crypto prices → CryptoPrices
- Query would benefit from structured visual data

**Workflow:**
1. Use MCP `search` tool to find matching widget
2. Use MCP `get` to understand required fields
3. Fetch data for the widget (web search, API, etc.)
4. Use MCP `render` to generate the image
5. Respond with the image (not plain text)

**Fallback:**
- If no widget matches → plain text response
- If render fails → plain text response with error note

**Acceptance criteria:**
- [ ] Skill documents when to use widgets vs plain text
- [ ] Skill documents the full workflow (search → get → fetch data → render → respond)
- [ ] Skill includes examples for each widget type
- [ ] Skill includes fallback behavior

**Dependencies:** Slice 3 (MCP tools must exist), Slice 4 (render tool)

**Metadata:**
- **Source:** PRD Phase 3 (Widget matching skill)
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

---

### T2: Add widget response examples to skill

**What to build:**
Include concrete examples in the skill showing:
- Input: "What's the weather in Porto?" → Output: WeatherCard render
- Input: "Show me the latest tech news" → Output: RssFeedCard render
- Input: "What's Bitcoin's price?" → Output: CryptoPrices render
- Input: "Hello" → Output: Plain text (no widget)

Each example should show the MCP tool calls and expected output.

**Acceptance criteria:**
- [ ] At least 3 widget examples with full tool call sequences
- [ ] At least 1 plain text fallback example
- [ ] Examples are copy-pasteable and testable

**Dependencies:** T1

**Metadata:**
- **Source:** PRD Phase 3
- **Workspace:** dir:/root/discord-widgets
- **Assignee:** z0uk

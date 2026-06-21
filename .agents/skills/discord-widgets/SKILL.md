---
name: discord-widgets
description: Discord widget system — React-rendered embed images via Satori, served through MCP tools. Use when responding to queries that could benefit from structured visual responses instead of plain text.
version: 1.0.0
---

# Discord Widgets

## Purpose
Render rich Discord embeds with React-generated images instead of plain text responses.

## Workflow
1. Use MCP tools (`list`, `search`, `get`) to find matching widget templates
2. Fetch data needed for the widget
3. Use `render` tool to generate the embed image and send it

## Widget Catalog
Widget templates are defined in `packages/catalog/src/widgets/`.

## Rendering Pipeline
React JSX → Satori (SVG) → Resvg (PNG) → Upload → Discord Embed

# Slice 3 — Embed Directive System

> **Status:** ✅ DONE  
> **Package:** `packages/embed`

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-21 | Rewritten to reflect actual implementation. Python tests are authoritative. TS parser + builder exist. No gateway plugin yet. |

---

## Goal

Parse `[[embed]]` directives from agent responses and build Discord API payloads for delivery.

## What Was Built

### TypeScript Parser (`packages/embed/src/parser.ts`)
- Parses `[[embed widget="weather" ...]]` directives from agent text output
- Extracts widget name and parameters
- Returns structured embed directive objects

### TypeScript Builder (`packages/embed/src/builder.ts`)
- Constructs Discord API embed payloads from parsed directives
- Handles embed fields, colors, images, buttons
- Produces `createMessage` payload with embed + attachment

### Gateway Hook Reference (`packages/embed/src/hook.ts`)
- Reference implementation for Gateway integration
- NOT a working plugin — manual copy-paste required (until Slice 9)

### Python Parser (`packages/embed/python/embed_parser.py`)
- 1:1 port of the TypeScript parser
- Used in Hermes Discord adapter (manual patches)

### Adapter Patch (`packages/embed/python/adapter_patch.py`)
- 3 patch snippets for manual integration with Hermes Discord adapter
- Patches: embed parsing, media extraction, button handling
- Applied by hand — no auto-apply mechanism

### Tests
- `test_embed_parser.py`: 19 unit tests (parser edge cases, malformed input, valid directives)
- `test_integration.py`: 6 end-to-end tests (full pipeline: parse → build → Discord API)

## Acceptance Criteria

- [x] `[[embed]]` directives parsed correctly (TS + Python)
- [x] Discord API payloads built from parsed directives
- [x] Python parser passes 19 unit tests
- [x] Integration tests pass 6 e2e scenarios
- [x] Live-tested: directives render embeds with images + buttons via REST API

## Dependencies

- `zod` (schema validation)
- `discord-api-types` (Discord API type definitions)

## Known Limitations

- Adapter patches are manual copy-paste (no gateway plugin)
- TypeScript has NO automated tests
- Parser does not handle nested directives
- No error recovery for malformed `[[embed]]` blocks

## Test Coverage

| Suite | Tests | Status |
|-------|-------|--------|
| Unit (Python) | 19 | ✅ All passing |
| Integration (Python) | 6 | ✅ All passing |
| Unit (TypeScript) | 0 | ⬜ None |

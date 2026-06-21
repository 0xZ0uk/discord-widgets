#!/bin/bash
# Apply discord-widgets patches to Hermes after an update.
# Run from the discord-widgets repo root: bash patches/apply.sh
set -euo pipefail

HERMES="${HERMES_INSTALL:-/usr/local/lib/hermes-agent}"
PATCHES="$(cd "$(dirname "$0")" && pwd)"

echo "=== discord-widgets patch installer ==="
echo "Hermes dir: $HERMES"
echo "Patches dir: $PATCHES"
echo ""

# Backup current files first
BACKUP_DIR="$PATCHES/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

backup() {
    local f="$1"
    if [ -f "$f" ]; then
        cp "$f" "$BACKUP_DIR/$(basename "$f")"
        echo "  backed up: $f"
    fi
}

apply() {
    local src="$1"
    local dst="$2"
    if [ ! -f "$src" ]; then
        echo "  ERROR: source not found: $src"
        return 1
    fi
    cp "$src" "$dst"
    echo "  applied: $src -> $dst"
}

echo "Step 1: Backing up current files..."
backup "$HERMES/plugins/platforms/discord/adapter.py"
backup "$HERMES/tools/discord_tool.py"
backup "$HERMES/gateway/run.py"
echo ""

echo "Step 2: Applying adapter.py (WidgetView + embed parser + send fast-path)..."
apply "$PATCHES/adapter.py.patched" "$HERMES/plugins/platforms/discord/adapter.py"
# Clear stale bytecode
rm -f "$HERMES/plugins/platforms/discord/__pycache__/adapter.cpython-"*.pyc
echo ""

echo "Step 3: Applying discord_tool.py (send_embed + send_embed_with_attachment)..."
apply "$PATCHES/discord_tool.py.patched" "$HERMES/tools/discord_tool.py"
rm -f "$HERMES/tools/__pycache__/discord_tool.cpython-"*.pyc
echo ""

echo "Step 4: Applying gateway/run.py MEDIA injection..."
# This is a targeted insertion — apply via the patch file
if [ -f "$PATCHES/run_injection.patch" ]; then
    # Check if already applied
    if grep -q "embed:.*so extract_local_files ignores" "$HERMES/gateway/run.py" 2>/dev/null; then
        echo "  already applied, skipping"
    else
        # Use python to do the injection
        python3 - "$HERMES/gateway/run.py" << 'PYEOF'
import sys, re

run_path = sys.argv[1]
with open(run_path, "r") as f:
    content = f.read()

needle = "response = _sanitize_gateway_final_response(source.platform, response)"
injection = '''
            # Inject MEDIA: file paths into [[embed]] image attributes so
            # the embed fast-path can attach them as Discord file uploads.
            # This must happen before streaming splits the response into chunks.
            if response and "[[embed" in response and "MEDIA:" in response:
                import re as _re
                _media_matches = _re.findall(r"MEDIA:((?:[A-Za-z]:[/\\\\]|/|~/)\\S+\\.(?:png|jpe?g|gif|webp))", response)
                if _media_matches:
                    _first_media = _media_matches[0]
                    def _inject_image(m):
                        tag = m.group(0)
                        if "image=" not in tag:
                            tag = tag.rstrip("]") + f' image="embed:{_first_media}"]'
                        return tag
                    response = _re.sub(r"\\[\\[embed\\s+[^\\]]*\\]\\]", _inject_image, response, count=1)
                    response = _re.sub(r"MEDIA:\\S+", "", response).strip()'''

if needle in content:
    content = content.replace(needle, needle + injection, 1)
    with open(run_path, "w") as f:
        f.write(content)
    print("  applied: MEDIA injection into run.py")
else:
    print("  WARNING: needle not found in run.py — may already be applied or structure changed")
PYEOF
    fi
else
    echo "  ERROR: run_injection.patch not found"
fi
echo ""

echo "Step 5: Verifying..."
python3 -c "import py_compile; py_compile.compile('$HERMES/plugins/platforms/discord/adapter.py', doraise=True); print('  adapter.py: OK')"
python3 -c "import py_compile; py_compile.compile('$HERMES/tools/discord_tool.py', doraise=True); print('  discord_tool.py: OK')"
python3 -c "import py_compile; py_compile.compile('$HERMES/gateway/run.py', doraise=True); print('  run.py: OK')"
echo ""

echo "=== Done! Restart the gateway: hermes gateway restart ==="
echo "Backups saved to: $BACKUP_DIR"

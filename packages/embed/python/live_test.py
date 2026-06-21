"""
Live Discord Embed Test (REST-only)
====================================
Uses discord.py HTTP client to send embeds without gateway connection.
Safe to run alongside the running gateway.
"""

import asyncio
import os
import sys
import aiohttp

# Unbuffered
sys.stdout.reconfigure(line_buffering=True)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "plugins", "platforms", "discord"))
sys.path.insert(0, os.path.dirname(__file__))

from embed_parser import process_response, hex_to_int

TOKEN = os.environ.get("DISCORD_BOT_TOKEN", "")
CHANNEL_ID = os.environ.get("DISCORD_HOME_CHANNEL", "1517183281919955125")

API = "https://discord.com/api/v10"
HEADERS = {"Authorization": f"Bot {TOKEN}"}


import json as _json

async def send_message(session, channel_id, payload):
    """Send a message via Discord REST API."""
    url = f"{API}/channels/{channel_id}/messages"
    # Multipart for file uploads — Discord requires payload_json + files
    if "files" in payload:
        form = aiohttp.FormData()
        file_map = payload.pop("files")
        form.add_field("payload_json", _json.dumps(payload), content_type="application/json")
        for i, (fname, fpath) in enumerate(file_map.items()):
            with open(fpath, "rb") as f:
                form.add_field(f"files[{i}]", f.read(), filename=fname, content_type="image/png")
        async with session.post(url, headers={"Authorization": f"Bot {TOKEN}"}, data=form) as resp:
            data = await resp.json()
            if resp.status >= 400:
                print(f"  ✗ HTTP {resp.status}: {_json.dumps(data, indent=2)[:300]}")
                return None
            return data
    else:
        async with session.post(url, headers=HEADERS, json=payload) as resp:
            data = await resp.json()
            if resp.status >= 400:
                print(f"  ✗ HTTP {resp.status}: {_json.dumps(data, indent=2)[:300]}")
                return None
            return data


async def main():
    print(f"Token: {TOKEN[:10]}...{TOKEN[-4:]}")
    print(f"Channel: {CHANNEL_ID}")
    print()

    async with aiohttp.ClientSession() as session:

        # ── Test 1: Widget embed with image + buttons ──────────────
        print("Test 1: Widget embed (image + 2 buttons)")

        # Parse the agent response
        agent_response = """Here's the current weather for Porto:

[[embed title="Porto Weather" color="#3498db" description="20°C, Fog In Vicinity"]]

MEDIA:/root/discord-widgets/out/widget-1782048354350-zfmrld.png

[[buttons]]
[Detailed Forecast](https://weather.com/porto)
[Style:secondary custom_id:refresh Refresh]

[[/embed]]

*Widget delivered via [[embed]] directive — live test!*"""

        result = process_response(agent_response)
        embed = result.first_embed

        # Build Discord embed JSON
        embed_json = {}
        if embed.title:
            embed_json["title"] = embed.title
        if embed.description:
            embed_json["description"] = embed.description
        if embed.color:
            embed_json["color"] = hex_to_int(embed.color)

        # Image attachment reference
        image_path = embed.image_path
        image_file = {}
        if image_path and os.path.exists(image_path):
            fname = os.path.basename(image_path)
            embed_json["image"] = {"url": f"attachment://{fname}"}
            image_file = {fname: image_path}

        # Build button components
        components = []
        if embed.buttons:
            row = []
            for btn in embed.buttons[:5]:
                style_map = {"primary": 1, "secondary": 2, "success": 3, "danger": 4, "link": 5}
                btn_json = {
                    "type": 2,
                    "style": style_map.get(btn.style, 2),
                    "label": btn.label,
                }
                if btn.url:
                    btn_json["url"] = btn.url
                if btn.custom_id:
                    btn_json["custom_id"] = btn.custom_id
                row.append(btn_json)
            if row:
                components.append({"type": 1, "components": row})

        # Build payload
        payload = {
            "content": result.text_content,
            "embeds": [embed_json],
        }
        if components:
            payload["components"] = components
        if image_file:
            payload["files"] = image_file

        msg = await send_message(session, CHANNEL_ID, payload)
        if msg:
            print(f"  ✓ Sent! Message ID: {msg['id']}")
        else:
            print("  ✗ Failed!")

        # ── Test 2: Plain text passthrough ─────────────────────────
        print("\nTest 2: Plain text (no embed)")
        msg2 = await send_message(session, CHANNEL_ID, {
            "content": "This is a plain text message. No embeds — just testing passthrough. ✅"
        })
        if msg2:
            print(f"  ✓ Sent! Message ID: {msg2['id']}")

        # ── Test 3: Minimal embed ──────────────────────────────────
        print("\nTest 3: Minimal status embed")
        msg3 = await send_message(session, CHANNEL_ID, {
            "content": "",
            "embeds": [{
                "title": "System Status",
                "description": "All systems operational ✅",
                "color": 0x2ECC71,
            }]
        })
        if msg3:
            print(f"  ✓ Sent! Message ID: {msg3['id']}")

        print("\n=== ALL LIVE TESTS COMPLETE ===")
        print("Check Discord #home for 3 messages!")


if __name__ == "__main__":
    asyncio.run(main())

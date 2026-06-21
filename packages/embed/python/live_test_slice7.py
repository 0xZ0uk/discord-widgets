"""
Slice 7 Live Test — Send widget embed with interaction buttons.
Verifies button rendering and custom_id format.
"""
import asyncio, os, sys, json, aiohttp

sys.stdout.reconfigure(line_buffering=True)
sys.path.insert(0, os.path.dirname(__file__))
from widget_handler import build_widget_buttons

TOKEN = os.environ.get("DISCORD_BOT_TOKEN", "")
CHANNEL_ID = os.environ.get("DISCORD_HOME_CHANNEL", "1517183281919955125")
API = "https://discord.com/api/v10"

async def send_message(session, payload):
    url = f"{API}/channels/{CHANNEL_ID}/messages"
    if "files" in payload:
        form = aiohttp.FormData()
        file_map = payload.pop("files")
        form.add_field("payload_json", json.dumps(payload), content_type="application/json")
        for i, (fname, fpath) in enumerate(file_map.items()):
            with open(fpath, "rb") as f:
                form.add_field(f"files[{i}]", f.read(), filename=fname, content_type="image/png")
        async with session.post(url, headers={"Authorization": f"Bot {TOKEN}"}, data=form) as resp:
            return await resp.json()
    else:
        async with session.post(url, headers={"Authorization": f"Bot {TOKEN}"}, json=payload) as resp:
            return await resp.json()

async def main():
    print(f"Token: {TOKEN[:10]}...{TOKEN[-4:]}")
    print(f"Channel: {CHANNEL_ID}")
    async with aiohttp.ClientSession() as s:

        # ── Test 1: Widget with interaction buttons ─────────────────
        print("\n1. Weather widget with Refresh + Details buttons")
        buttons = build_widget_buttons("weather", [
            {"label": "🔄 Refresh", "action": "refresh"},
            {"label": "📊 Details", "action": "info"},
            {"label": "🌤 Forecast", "action": "forecast", "style": "link", "url": "https://weather.com/porto"},
        ])

        msg = await send_message(s, {
            "content": "Widget interaction test — click a button!",
            "embeds": [{
                "title": "🌤 Porto Weather",
                "description": "20°C, Fog In Vicinity\nH:22° L:15°",
                "color": 0x3498DB,
                "image": {"url": "attachment://widget.png"},
                "footer": {"text": "Slice 7 live test — buttons have widget:custom_ids"},
            }],
            "components": [{"type": 1, "components": buttons}],
            "files": {"widget.png": "/root/discord-widgets/out/widget-1782048354350-zfmrld.png"},
        })
        if msg and "id" in msg:
            print(f"   ✓ Sent! ID: {msg['id']}")
            # Show the custom_ids that were sent
            for btn in buttons:
                cid = btn.get("custom_id", "(link)")
                print(f"   Button: {btn['label']} → custom_id={cid}")
        else:
            print(f"   ✗ Failed: {json.dumps(msg, indent=2)[:200]}")

        # ── Test 2: Crypto widget with refresh ──────────────────────
        print("\n2. Crypto widget with Refresh button")
        buttons2 = build_widget_buttons("crypto-prices", [
            {"label": "🔄 Refresh", "action": "refresh"},
        ])
        msg2 = await send_message(s, {
            "content": "",
            "embeds": [{
                "title": "💰 Crypto Prices",
                "description": "BTC: $65,234 (+2.1%)\nETH: $3,456 (+1.8%)",
                "color": 0x2ECC71,
                "footer": {"text": "custom_id: widget:crypto-prices:refresh"},
            }],
            "components": [{"type": 1, "components": buttons2}],
        })
        if msg2 and "id" in msg2:
            print(f"   ✓ Sent! ID: {msg2['id']}")
        else:
            print(f"   ✗ Failed: {json.dumps(msg2, indent=2)[:200]}")

        print("\n=== BUTTONS SENT ===")
        print("Check Discord — buttons should be visible and clickable.")
        print("NOTE: Clicking will show 'interaction failed' until gateway restarts.")
        print("After restart, the WidgetView handler will process clicks.")

if __name__ == "__main__":
    asyncio.run(main())

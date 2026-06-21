"""
Slice 7 Live Test — Send embed THROUGH discord.py (not REST).
Uses discord.py View system so interactions are registered.
"""
import asyncio, os, sys, json

sys.stdout.reconfigure(line_buffering=True)
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, "/usr/local/lib/hermes-agent/plugins/platforms/discord")

from embed_parser import process_response, hex_to_int
TOKEN=os.environ.get("DISCORD_BOT_TOKEN", "")
CHANNEL_ID = os.environ.get("DISCORD_HOME_CHANNEL", "1517183281919955125")


async def main():
    import discord
    intents = discord.Intents.default()
    client = discord.Client(intents=intents)

    @client.event
    async def on_ready():
        print(f"Connected as {client.user}")
        channel = client.get_channel(int(CHANNEL_ID))
        if not channel:
            channel = await client.fetch_channel(int(CHANNEL_ID))
        print(f"Channel: {channel.name}")

        from embed_parser import process_response as _process
        from embed_parser import hex_to_int as _hex
        from widget_handler import create_widget_view, WidgetStateStore

        state_store = WidgetStateStore()
        processed = _process(
            '[[embed title="Porto Weather" color="#3498db" '
            'description="20C, Fog In Vicinity" '
            'image="/root/discord-widgets/out/widget-1782048354350-zfmrld.png"]]\n'
            '[[buttons]]\n'
            '[Refresh](https://example.com)\n'
            '[Details](https://example.com)\n'
            '[[/embed]]'
        )
        if not processed.has_embeds:
            print("No embeds!")
            await client.close()
            return

        embed_data = processed.first_embed
        discord_embed = discord.Embed()
        if embed_data.title:
            discord_embed.title = embed_data.title
        if embed_data.description:
            discord_embed.description = embed_data.description
        if embed_data.color:
            discord_embed.colour = discord.Colour(_hex(embed_data.color))

        files = []
        if embed_data.image_path and os.path.exists(embed_data.image_path):
            fname = os.path.basename(embed_data.image_path)
            files.append(discord.File(embed_data.image_path, filename=fname))
            discord_embed.set_image(url=f"attachment://{fname}")
            print(f"Image: {fname}")

        components = []
        if embed_data.buttons:
            row = []
            for btn in embed_data.buttons[:5]:
                sm = {"primary": 1, "secondary": 2, "success": 3, "danger": 4, "link": 5}
                style = {"primary": discord.ButtonStyle.primary, "secondary": discord.ButtonStyle.secondary,
                         "success": discord.ButtonStyle.success, "danger": discord.ButtonStyle.danger,
                         "link": discord.ButtonStyle.link}.get(btn.style, discord.ButtonStyle.secondary)
                kw = {"style": style, "label": btn.label}
                if btn.url:
                    kw["url"] = btn.url
                if btn.custom_id:
                    kw["custom_id"] = btn.custom_id
                row.append(discord.ui.Button(**kw))
            components.append(discord.ui.ActionRow(*row))
            print(f"{len(row)} button(s)")

        WidgetView = create_widget_view(state_store)
        view = WidgetView()

        msg = await channel.send(
            embed=discord_embed,
            files=files if files else [],
            components=components,
            view=view,
        )
        print(f"Sent with WidgetView! ID: {msg.id}")
        print("Click the buttons NOW — listening for 60s...")

        await asyncio.sleep(60)
        print("Done — disconnecting")
        await client.close()

    await client.start(TOKEN)

if __name__ == "__main__":
    asyncio.run(main())

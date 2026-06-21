"""End-to-end integration test for embed directive delivery.

Simulates the Discord adapter's send() flow:
1. Agent response contains [[embed]] directives
2. send() detects them via fast-path check
3. process_response() parses the directives
4. _send_embed_response() builds Discord API payload
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from embed_parser import process_response, ParsedEmbed


class MockChannel:
    """Mock Discord channel for testing."""
    def __init__(self):
        self.id = 123456789
        self.last_send_kwargs = None
        self.messages = []

    async def send(self, **kwargs):
        self.last_send_kwargs = kwargs
        msg = MockMessage()
        self.messages.append(msg)
        return msg

    async def fetch_message(self, msg_id):
        return None


class MockMessage:
    """Mock Discord message."""
    def __init__(self):
        self.id = 987654321

    def to_reference(self, fail_if_not_exists=False):
        return self


def test_embed_directive_detection():
    """Fast-path check: content contains [[embed."""
    assert "[[embed" in '[[embed title="Test"]]'
    assert "[[embed" not in "Hello world"
    assert "[[embed" in "Some text\n[[embed title=\"X\"]]\n[[/embed]]"


def test_process_response_extracts_embed():
    """Full parse of an agent response with embed directives."""
    response = """Here's the current weather for Porto:

[[embed title="Porto Weather" color="#3498db" description="20°C, Fog In Vicinity"]]

[[buttons]]
[Detailed Forecast](https://weather.com/porto)
[Style:secondary custom_id:refresh Refresh]

[[/embed]]

Let me know if you'd like more details!"""

    result = process_response(response)

    assert result.has_embeds
    assert len(result.embeds) == 1

    embed = result.first_embed
    assert embed.title == "Porto Weather"
    assert embed.color == "#3498db"
    assert embed.description == "20°C, Fog In Vicinity"
    assert len(embed.buttons) == 2

    btn1 = embed.buttons[0]
    assert btn1.label == "Detailed Forecast"
    assert btn1.style == "link"
    assert btn1.url == "https://weather.com/porto"

    btn2 = embed.buttons[1]
    assert btn2.label == "Refresh"
    assert btn2.style == "secondary"
    assert btn2.custom_id == "refresh"

    # Clean text should preserve surrounding content
    assert "Here's the current weather" in result.text_content
    assert "Let me know" in result.text_content
    assert "[[embed" not in result.text_content
    assert "[[buttons]]" not in result.text_content


def test_build_discord_payload():
    """Build a discord.py-compatible payload from parsed embed."""
    from embed_parser import hex_to_int

    response = '[[embed title="Crypto" color="#2ecc71" description="BTC: $65k"]]\n[[buttons]]\n[Trade](https://exchange.com)\n[[/embed]]'

    result = process_response(response)
    embed = result.first_embed

    # Simulate discord.Embed construction
    payload = {
        "embed": {
            "title": embed.title,
            "description": embed.description,
            "color": hex_to_int(embed.color),
        },
    }

    assert payload["embed"]["title"] == "Crypto"
    assert payload["embed"]["color"] == 0x2ECC71

    # Simulate button components
    if embed.buttons:
        components = []
        for btn in embed.buttons[:5]:
            btn_payload = {
                "type": 2,  # Button
                "style": {"link": 5, "secondary": 2, "primary": 1}.get(btn.style, 2),
                "label": btn.label,
            }
            if btn.url:
                btn_payload["url"] = btn.url
            if btn.custom_id:
                btn_payload["custom_id"] = btn.custom_id
            components.append(btn_payload)

        action_row = {"type": 1, "components": components}
        payload["components"] = [action_row]

    assert len(payload["components"][0]["components"]) == 1
    assert payload["components"][0]["components"][0]["style"] == 5  # link
    assert payload["components"][0]["components"][0]["url"] == "https://exchange.com"


def test_text_only_passthrough():
    """Responses without embed directives should pass through unchanged."""
    response = "This is just a plain text response with [[some]] brackets."
    result = process_response(response)

    assert not result.has_embeds
    assert result.text_content == response
    assert len(result.embeds) == 0


def test_embed_with_image():
    """Embed with MEDIA: path for image attachment."""
    response = """[[embed title="Widget" color="#9b59b6"]]
MEDIA:/root/discord-widgets/out/widget-1782048354350-zfmrld.png

[[buttons]]
[View Live](https://example.com)
[[/embed]]"""

    result = process_response(response)
    assert result.has_embeds
    assert result.first_embed.image_path == "/root/discord-widgets/out/widget-1782048354350-zfmrld.png"
    assert len(result.first_embed.buttons) == 1


def test_multiple_embeds():
    """Multiple embed blocks in one response."""
    response = """[[embed title="Weather" color="#3498db"]]
MEDIA:/weather.png
[[/embed]]

[[embed title="Crypto" color="#2ecc71"]]
MEDIA:/crypto.png
[[/embed]]"""

    result = process_response(response)
    assert result.has_embeds
    assert len(result.embeds) == 2
    assert result.embeds[0].title == "Weather"
    assert result.embeds[1].title == "Crypto"


if __name__ == "__main__":
    test_embed_directive_detection()
    test_process_response_extracts_embed()
    test_build_discord_payload()
    test_text_only_passthrough()
    test_embed_with_image()
    test_multiple_embeds()
    print("✓ All end-to-end tests passed")

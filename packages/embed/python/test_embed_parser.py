"""Tests for the embed directive parser — mirrors TS tests in embed.test.ts."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from embed_parser import (
    parse_embed_directives,
    parse_attributes,
    parse_buttons,
    process_response,
    hex_to_int,
)


class TestParseAttributes:
    def test_quoted_values(self):
        attrs = parse_attributes('title="Weather" color="#3498db"')
        assert attrs == {"title": "Weather", "color": "#3498db"}

    def test_unquoted_values(self):
        attrs = parse_attributes('color=#3498db foo=bar')
        assert attrs == {"color": "#3498db", "foo": "bar"}

    def test_empty(self):
        assert parse_attributes("") == {}


class TestParseButtons:
    def test_link_button(self):
        buttons = parse_buttons("[Label](https://example.com)")
        assert len(buttons) == 1
        assert buttons[0].label == "Label"
        assert buttons[0].style == "link"
        assert buttons[0].url == "https://example.com"

    def test_styled_link(self):
        buttons = parse_buttons("[Style:primary Detailed Forecast](https://weather.com)")
        assert len(buttons) == 1
        assert buttons[0].label == "Detailed Forecast"
        assert buttons[0].style == "link"  # url present → link
        assert buttons[0].url == "https://weather.com"

    def test_interaction_button(self):
        buttons = parse_buttons("[Style:secondary custom_id:refresh Refresh]")
        assert len(buttons) == 1
        assert buttons[0].label == "Refresh"
        assert buttons[0].style == "secondary"
        assert buttons[0].custom_id == "refresh"

    def test_multiple(self):
        raw = "[First](https://a.com)\n[Second](https://b.com)"
        buttons = parse_buttons(raw)
        assert len(buttons) == 2
        assert buttons[0].label == "First"
        assert buttons[1].label == "Second"

    def test_empty_label_skipped(self):
        buttons = parse_buttons("[](https://example.com)")
        assert len(buttons) == 0


class TestParseEmbedDirectives:
    def test_simple_embed(self):
        text = '[[embed title="Weather" color="#3498db"]]\nMEDIA:/path/widget.png\n[[/embed]]'
        embeds, clean = parse_embed_directives(text)
        assert len(embeds) == 1
        assert embeds[0].title == "Weather"
        assert embeds[0].color == "#3498db"
        assert embeds[0].image_path == "/path/widget.png"
        assert clean == ""

    def test_embed_with_buttons(self):
        text = (
            '[[embed title="Data" color="#2ecc71"]]\n'
            "MEDIA:/out/chart.png\n"
            "[[buttons]]\n"
            "[Details](https://example.com)\n"
            "[Style:secondary custom_id:refresh Refresh]\n"
            "[[/embed]]"
        )
        embeds, clean = parse_embed_directives(text)
        assert len(embeds) == 1
        assert len(embeds[0].buttons) == 2
        assert embeds[0].buttons[0].label == "Details"
        assert embeds[0].buttons[1].label == "Refresh"
        assert embeds[0].buttons[1].custom_id == "refresh"

    def test_surrounding_text(self):
        text = (
            "Here's the weather:\n\n"
            '[[embed title="Weather"]]\n'
            "MEDIA:/w.png\n"
            "[[buttons]]\n"
            "[Link](https://x.com)\n"
            "[[buttons]]\n"
            "[[/embed]]\n\n"
            "Hope that helps!"
        )
        embeds, clean = parse_embed_directives(text)
        assert len(embeds) == 1
        assert "Here's the weather:" in clean
        assert "Hope that helps!" in clean
        assert "[[embed" not in clean

    def test_no_directives(self):
        text = "Just a plain message with [[some]] brackets."
        embeds, clean = parse_embed_directives(text)
        assert len(embeds) == 0
        assert clean == text

    def test_multiple_embeds(self):
        text = (
            '[[embed title="A"]]\nMEDIA:/a.png\n[[/embed]]\n\n'
            '[[embed title="B"]]\nMEDIA:/b.png\n[[/embed]]'
        )
        embeds, clean = parse_embed_directives(text)
        assert len(embeds) == 2
        assert embeds[0].title == "A"
        assert embeds[1].title == "B"
        assert clean == ""

    def test_description_attr(self):
        text = (
            '[[embed title="Rss" description="Latest posts"]]\n'
            "MEDIA:/rss.png\n"
            "[[/embed]]"
        )
        embeds, _ = parse_embed_directives(text)
        assert embeds[0].description == "Latest posts"


class TestProcessResponse:
    def test_no_directives(self):
        result = process_response("Hello world")
        assert not result.has_embeds
        assert result.text_content == "Hello world"
        assert result.embeds == []

    def test_with_embed(self):
        text = 'Some text\n[[embed title="Test"]]\nMEDIA:/t.png\n[[/embed]]'
        result = process_response(text)
        assert result.has_embeds
        assert result.first_embed is not None
        assert result.first_embed.title == "Test"
        assert "Some text" in result.text_content
        assert "[[embed" not in result.text_content

    def test_empty(self):
        result = process_response("")
        assert not result.has_embeds


class TestHexToInt:
    def test_hash_prefix(self):
        assert hex_to_int("#3498db") == 0x3498DB

    def test_no_hash(self):
        assert hex_to_int("ff0000") == 0xFF0000

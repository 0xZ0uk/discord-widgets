"""Tests for the widget interaction handler."""

import sys
import os
import time

sys.path.insert(0, os.path.dirname(__file__))

from widget_handler import (
    parse_widget_custom_id,
    build_widget_custom_id,
    WidgetInteraction,
    WidgetState,
    WidgetStateStore,
    WidgetHandlerRegistry,
    build_widget_buttons,
)


class TestCustomIdParsing:
    def test_basic_refresh(self):
        parsed = parse_widget_custom_id("widget:weather:refresh")
        assert parsed is not None
        assert parsed.widget_name == "weather"
        assert parsed.action == "refresh"
        assert parsed.param is None

    def test_with_param(self):
        parsed = parse_widget_custom_id("widget:rss-feed:page:2")
        assert parsed is not None
        assert parsed.widget_name == "rss-feed"
        assert parsed.action == "page"
        assert parsed.param == "2"

    def test_non_widget_prefix(self):
        assert parse_widget_custom_id("clarify:abc:0") is None
        assert parse_widget_custom_id("approval:xyz") is None

    def test_malformed(self):
        assert parse_widget_custom_id("widget:") is None
        assert parse_widget_custom_id("widget:weather") is None

    def test_empty(self):
        assert parse_widget_custom_id("") is None
        assert parse_widget_custom_id(None) is None

    def test_roundtrip(self):
        cid = build_widget_custom_id("crypto-prices", "refresh")
        parsed = parse_widget_custom_id(cid)
        assert parsed.widget_name == "crypto-prices"
        assert parsed.action == "refresh"

    def test_roundtrip_with_param(self):
        cid = build_widget_custom_id("weather", "city", "Lisbon")
        parsed = parse_widget_custom_id(cid)
        assert parsed.param == "Lisbon"


class TestStateStore:
    def test_set_and_get(self):
        store = WidgetStateStore(ttl_seconds=60)
        state = WidgetState(widget_name="weather", render_params={"city": "Porto"})
        store.set("msg1", "user1", state)
        result = store.get("msg1", "user1")
        assert result is not None
        assert result.widget_name == "weather"
        assert result.render_params["city"] == "Porto"

    def test_expired(self):
        store = WidgetStateStore(ttl_seconds=0)  # immediate expiry
        state = WidgetState(widget_name="weather")
        store.set("msg1", "user1", state)
        time.sleep(0.01)
        result = store.get("msg1", "user1")
        assert result is None

    def test_different_users(self):
        store = WidgetStateStore(ttl_seconds=60)
        store.set("msg1", "user1", WidgetState(widget_name="a"))
        store.set("msg1", "user2", WidgetState(widget_name="b"))
        assert store.get("msg1", "user1").widget_name == "a"
        assert store.get("msg1", "user2").widget_name == "b"

    def test_update(self):
        store = WidgetStateStore(ttl_seconds=60)
        store.set("msg1", "user1", WidgetState(widget_name="weather"))
        state = store.update("msg1", "user1", "refresh")
        assert state is not None
        assert len(state.interaction_history) == 1

    def test_cleanup(self):
        store = WidgetStateStore(ttl_seconds=0)
        store.set("msg1", "user1", WidgetState(widget_name="a"))
        store.set("msg2", "user2", WidgetState(widget_name="b"))
        time.sleep(0.01)
        removed = store.cleanup()
        assert removed == 2
        assert store.get("msg1", "user1") is None


class TestHandlerRegistry:
    def test_specific_handler(self):
        registry = WidgetHandlerRegistry()
        async def my_handler(**kwargs): pass
        registry.register("weather", "refresh", my_handler)
        assert registry.get("weather", "refresh") is my_handler

    def test_global_fallback(self):
        registry = WidgetHandlerRegistry()
        async def global_refresh(**kwargs): pass
        registry.register_global("refresh", global_refresh)
        assert registry.get("weather", "refresh") is global_refresh
        assert registry.get("rss-feed", "refresh") is global_refresh

    def test_specific_overrides_global(self):
        registry = WidgetHandlerRegistry()
        async def global_handler(**kwargs): pass
        async def weather_handler(**kwargs): pass
        registry.register_global("refresh", global_handler)
        registry.register("weather", "refresh", weather_handler)
        assert registry.get("weather", "refresh") is weather_handler
        assert registry.get("rss-feed", "refresh") is global_handler

    def test_unknown_action(self):
        registry = WidgetHandlerRegistry()
        assert registry.get("weather", "unknown") is None


class TestBuildButtons:
    def test_default_refresh(self):
        buttons = build_widget_buttons("weather")
        assert len(buttons) == 1
        assert buttons[0]["label"] == "🔄 Refresh"
        assert buttons[0]["custom_id"] == "widget:weather:refresh"
        assert buttons[0]["style"] == 2  # secondary

    def test_custom_actions(self):
        buttons = build_widget_buttons("weather", [
            {"label": "Refresh", "action": "refresh"},
            {"label": "Details", "action": "details", "style": "link", "url": "https://example.com"},
        ])
        assert len(buttons) == 2
        assert buttons[0]["style"] == 2
        assert buttons[1]["style"] == 5  # link
        assert buttons[1]["url"] == "https://example.com"

    def test_max_5(self):
        actions = [{"label": f"Btn {i}", "action": f"act{i}"} for i in range(10)]
        buttons = build_widget_buttons("test", actions)
        assert len(buttons) == 5

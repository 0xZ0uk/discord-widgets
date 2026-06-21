"""
Widget Interaction Handler
==========================

Handles Discord button interactions on widget embeds.

Button custom_id convention:
    widget:{widget_name}:{action}:{param}

Examples:
    widget:weather:refresh         → re-render weather widget
    widget:rss-feed:next           → next page of RSS items
    widget:crypto-prices:refresh   → re-render crypto widget

Link buttons (style=5) don't need handling — Discord opens the URL natively.
Only interaction buttons (style=1/2/3/4) reach this handler.
"""

import asyncio
import logging
import os
import sys
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional

logger = logging.getLogger(__name__)

# ── custom_id parsing ──────────────────────────────────────────────────────

WIDGET_BUTTON_PREFIX = "widget:"


@dataclass
class WidgetInteraction:
    """Parsed widget button interaction."""
    widget_name: str
    action: str
    param: Optional[str] = None
    raw_custom_id: str = ""


def parse_widget_custom_id(custom_id: str) -> Optional[WidgetInteraction]:
    """Parse a widget custom_id into its components.

    Returns None if the custom_id doesn't match the widget prefix.
    """
    if not custom_id or not custom_id.startswith(WIDGET_BUTTON_PREFIX):
        return None

    parts = custom_id[len(WIDGET_BUTTON_PREFIX):].split(":", 2)
    if len(parts) < 2:
        return None

    return WidgetInteraction(
        widget_name=parts[0],
        action=parts[1],
        param=parts[2] if len(parts) > 2 else None,
        raw_custom_id=custom_id,
    )


def build_widget_custom_id(widget_name: str, action: str, param: Optional[str] = None) -> str:
    """Build a widget custom_id from components."""
    parts = [WIDGET_BUTTON_PREFIX.rstrip(":"), widget_name, action]
    if param:
        parts.append(param)
    return ":".join(parts)


# ── State Store ─────────────────────────────────────────────────────────────

STATE_TTL_SECONDS = 15 * 60  # 15 minutes (Discord interaction token expiry)


@dataclass
class WidgetState:
    """State for a single widget instance."""
    widget_name: str
    render_params: Dict[str, Any] = field(default_factory=dict)
    interaction_history: List[str] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)
    last_interaction: float = field(default_factory=time.time)


class WidgetStateStore:
    """In-memory state store for widget interactions.

    Keyed by {message_id}:{user_id}. Entries auto-expire after 15 minutes.
    """

    def __init__(self, ttl_seconds: int = STATE_TTL_SECONDS):
        self._store: Dict[str, WidgetState] = {}
        self._ttl = ttl_seconds

    def _key(self, message_id: str, user_id: str) -> str:
        return f"{message_id}:{user_id}"

    def get(self, message_id: str, user_id: str) -> Optional[WidgetState]:
        key = self._key(message_id, user_id)
        state = self._store.get(key)
        if state and (time.time() - state.last_interaction) < self._ttl:
            return state
        if state:
            del self._store[key]
        return None

    def set(self, message_id: str, user_id: str, state: WidgetState) -> None:
        key = self._key(message_id, user_id)
        self._store[key] = state

    def update(self, message_id: str, user_id: str, action: str) -> Optional[WidgetState]:
        """Update interaction timestamp and history. Returns existing state or None."""
        key = self._key(message_id, user_id)
        state = self._store.get(key)
        if not state:
            return None
        state.last_interaction = time.time()
        state.interaction_history.append(action)
        return state

    def cleanup(self) -> int:
        """Remove expired entries. Returns count removed."""
        now = time.time()
        expired = [k for k, v in self._store.items() if (now - v.last_interaction) >= self._ttl]
        for k in expired:
            del self._store[k]
        return len(expired)


# ── Handler Registry ────────────────────────────────────────────────────────

# Type alias for handler functions
WidgetHandler = Callable[..., Any]


class WidgetHandlerRegistry:
    """Registry mapping widget actions to handler functions.

    Handlers receive:
        - interaction: discord.Interaction
        - parsed: WidgetInteraction
        - state: WidgetState or None
        - state_store: WidgetStateStore

    Must call one of:
        - await interaction.response.edit_message(embed=..., view=...)
        - await interaction.response.defer()
    """

    def __init__(self):
        self._handlers: Dict[str, WidgetHandler] = {}
        self._global_handlers: Dict[str, WidgetHandler] = {}

    def register(self, widget_name: str, action: str, handler: WidgetHandler) -> None:
        """Register a handler for a specific widget:action pair."""
        key = f"{widget_name}:{action}"
        self._handlers[key] = handler

    def register_global(self, action: str, handler: WidgetHandler) -> None:
        """Register a handler for an action across ALL widgets.

        Global handlers are checked after widget-specific handlers.
        Useful for common actions like 'refresh' or 'info'.
        """
        self._global_handlers[action] = handler

    def get(self, widget_name: str, action: str) -> Optional[WidgetHandler]:
        """Look up handler: widget-specific first, then global."""
        return self._handlers.get(f"{widget_name}:{action}") or self._global_handlers.get(action)


# ── Built-in Handlers ───────────────────────────────────────────────────────

async def handle_refresh(
    interaction: Any,
    parsed: WidgetInteraction,
    state: Optional[WidgetState],
    state_store: WidgetStateStore,
    render_fn: Optional[Callable] = None,
) -> None:
    """Default refresh handler — re-renders the widget and updates the message.

    If render_fn is provided, calls it to get a new embed + file.
    Otherwise, just shows a "refreshed" footer on the existing embed.
    """
    import discord

    # Acknowledge the interaction immediately to prevent "interaction failed"
    await interaction.response.defer()

    embed = interaction.message.embeds[0] if interaction.message and interaction.message.embeds else None
    if not embed:
        await interaction.followup.send("No embed found on this message.", ephemeral=True)
        return

    if render_fn:
        try:
            result = await render_fn(parsed.widget_name, state.render_params if state else {})
            if result:
                await interaction.message.edit(embed=result.get("embed"), attachments=result.get("files", []))
                return
        except Exception as e:
            logger.warning("Widget render_fn failed: %s", e)

    # Fallback: update footer with refresh timestamp
    embed.set_footer(text=f"🔄 Refreshed at {time.strftime('%H:%M:%S')}")
    if state:
        state_store.update(
            str(interaction.message.id),
            str(interaction.user.id),
            "refresh",
        )
    await interaction.message.edit(embed=embed)


async def handle_info(
    interaction: Any,
    parsed: WidgetInteraction,
    state: Optional[WidgetState],
    state_store: WidgetStateStore,
    **kwargs,
) -> None:
    """Info handler — shows widget metadata as an ephemeral message."""
    embed = interaction.message.embeds[0] if interaction.message and interaction.message.embeds else None
    title = embed.title if embed else parsed.widget_name
    description = embed.description if embed else "No description"

    info_text = (
        f"**Widget:** {parsed.widget_name}\n"
        f"**Title:** {title}\n"
        f"**Description:** {description}\n"
    )
    if state:
        info_text += f"**Interactions:** {len(state.interaction_history)}\n"
        info_text += f"**Created:** {time.strftime('%H:%M:%S', time.localtime(state.created_at))}\n"

    await interaction.response.send_message(info_text, ephemeral=True)


# ── discord.ui.View Integration ─────────────────────────────────────────────

def create_widget_view(
    state_store: WidgetStateStore,
    handler_registry: Optional[WidgetHandlerRegistry] = None,
    render_fn: Optional[Callable] = None,
    allowed_user_ids: Optional[set] = None,
    allowed_role_ids: Optional[set] = None,
    timeout: float = 300,
) -> Any:
    """Create a discord.ui.View that handles widget button interactions.

    Returns a View class (not an instance) that can be passed to channel.send().
    The View auto-discovers buttons by their custom_id prefix.

    Usage:
        WidgetView = create_widget_view(state_store)
        await channel.send(embed=embed, view=WidgetView())
    """
    import discord

    _registry = handler_registry or WidgetHandlerRegistry()
    _registry.register_global("refresh", handle_refresh)
    _registry.register_global("info", handle_info)

    class WidgetInteractionView(discord.ui.View):
        def __init__(self):
            super().__init__(timeout=timeout)

        async def interaction_check(self, interaction: Any) -> bool:
            """Verify the custom_id is a widget interaction."""
            custom_id = interaction.data.get("custom_id", "") if interaction.data else ""
            parsed = parse_widget_custom_id(custom_id)
            if not parsed:
                return False

            # Auth check
            if allowed_user_ids or allowed_role_ids:
                from plugins.platforms.discord.adapter import _component_check_auth
                if not _component_check_auth(interaction, allowed_user_ids or set(), allowed_role_ids or set()):
                    await interaction.response.send_message(
                        "You're not authorized to interact with this widget.",
                        ephemeral=True,
                    )
                    return False

            return True

        async def on_button_click(self, interaction: Any) -> None:
            custom_id = interaction.data.get("custom_id", "") if interaction.data else ""
            parsed = parse_widget_custom_id(custom_id)
            if not parsed:
                return

            # Get or create state
            msg_id = str(interaction.message.id) if interaction.message else "unknown"
            user_id = str(interaction.user.id)
            state = state_store.get(msg_id, user_id)

            # Look up handler
            handler = _registry.get(parsed.widget_name, parsed.action)
            if not handler:
                await interaction.response.send_message(
                    f"Unknown action: {parsed.action}",
                    ephemeral=True,
                )
                return

            # Execute handler
            try:
                await handler(
                    interaction=interaction,
                    parsed=parsed,
                    state=state,
                    state_store=state_store,
                    render_fn=render_fn,
                )
            except Exception as e:
                logger.error(
                    "Widget handler error (%s:%s): %s",
                    parsed.widget_name, parsed.action, e,
                    exc_info=True,
                )
                try:
                    if not interaction.response.is_done():
                        await interaction.response.send_message(
                            "An error occurred processing this interaction.",
                            ephemeral=True,
                        )
                except Exception:
                    pass

        async def on_timeout(self):
            """Disable all buttons when the view times out."""
            for child in self.children:
                if hasattr(child, "disabled"):
                    child.disabled = True
            # Try to update the message
            # (may fail if message is too old)

    return WidgetInteractionView


# ── Convenience: build buttons for a widget ─────────────────────────────────

def build_widget_buttons(
    widget_name: str,
    actions: Optional[List[Dict[str, str]]] = None,
) -> List[Dict[str, Any]]:
    """Build Discord button component payloads for a widget.

    Args:
        widget_name: Widget name (e.g., "weather")
        actions: List of action dicts with keys: label, action, style (optional)

    Returns:
        List of component payloads ready for discord.ui.ActionRow or API JSON.

    Example:
        buttons = build_widget_buttons("weather", [
            {"label": "Refresh", "action": "refresh"},
            {"label": "Details", "action": "details", "style": "link", "url": "https://..."},
        ])
    """
    if not actions:
        actions = [{"label": "🔄 Refresh", "action": "refresh"}]

    style_map = {
        "primary": 1, "secondary": 2, "success": 3, "danger": 4, "link": 5,
    }

    components = []
    for action_def in actions[:5]:  # Discord max 5 per row
        label = action_def.get("label", action_def.get("action", "?"))
        action = action_def.get("action", "refresh")
        style = action_def.get("style", "secondary")
        url = action_def.get("url")

        if url:
            # Link buttons — no custom_id needed
            components.append({
                "type": 2,
                "style": 5,
                "label": label,
                "url": url,
            })
        else:
            # Interaction buttons
            custom_id = build_widget_custom_id(widget_name, action)
            components.append({
                "type": 2,
                "style": style_map.get(style, 2),
                "label": label,
                "custom_id": custom_id,
            })

    return components

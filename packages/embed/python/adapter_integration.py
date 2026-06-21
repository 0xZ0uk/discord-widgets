"""
Slice 7: Widget Interaction Handler — Adapter Integration
==========================================================

This module provides the integration between widget_handler.py and the
Hermes Discord adapter. It shows how to:

1. Create a WidgetView when sending a widget embed
2. Register the view with the adapter for interaction handling
3. Handle the interaction lifecycle

The key insight: discord.py's View system handles interaction routing
automatically. When you send a message with `view=WidgetView()`, Discord
stores the view's callbacks and routes INTERACTION_CREATE events to them.

There's no separate "event listener" needed — discord.py handles this.
"""

# ── How it works ────────────────────────────────────────────────────────────
#
# When the adapter sends an embed with buttons:
#
#   view = create_widget_view(state_store)
#   await channel.send(embed=discord_embed, view=view())
#
# Discord automatically:
#   1. Stores the view's callbacks (on_button_click, etc.)
#   2. Routes INTERACTION_CREATE events to the view
#   3. The view's on_button_click parses the custom_id
#   4. Looks up the handler from the registry
#   5. Executes the handler (refresh, navigate, etc.)
#
# For the Hermes integration specifically:
#
#   - The adapter's _send_embed_response() already sends with components
#   - We need to add `view=WidgetView()` to the send kwargs
#   - The WidgetView handles all subsequent interactions automatically
#
# ── Patch to _send_embed_response() ─────────────────────────────────────────
#
# In adapter.py, modify _send_embed_response to attach a WidgetView:
#
#   from widget_handler import create_widget_view, WidgetStateStore
#
#   # At class level or init:
#   self._widget_state_store = WidgetStateStore()
#
#   # In _send_embed_response, after building send_kwargs:
#   if components:  # Only if there are interaction buttons (not just links)
#       WidgetView = create_widget_view(self._widget_state_store)
#       send_kwargs["view"] = WidgetView()
#
# That's it — 3 lines of adapter code.
#
# ── Full adapter patch ──────────────────────────────────────────────────────

ADAPTER_PATCH = '''
    # === In DiscordAdapter.__init__ or connect(): ===
    # Add state store for widget interactions
    from widget_handler import WidgetStateStore
    self._widget_state_store = WidgetStateStore()

    # === In _send_embed_response(), after building send_kwargs: ===
    # Attach WidgetView if there are interaction buttons
    if components:
        from widget_handler import create_widget_view
        WidgetView = create_widget_view(
            self._widget_state_store,
            allowed_user_ids=self._allowed_user_ids,
            allowed_role_ids=getattr(self, "_allowed_role_ids", None),
        )
        send_kwargs["view"] = WidgetView()

    # === Periodic cleanup (optional, in a background task): ===
    # Clean up expired widget states every 5 minutes
    import asyncio
    async def _cleanup_widget_states():
        while True:
            await asyncio.sleep(300)
            removed = self._widget_state_store.cleanup()
            if removed:
                logger.debug("Cleaned up %d expired widget states", removed)
    asyncio.create_task(_cleanup_widget_states())
'''

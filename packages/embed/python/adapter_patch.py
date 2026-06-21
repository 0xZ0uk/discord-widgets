"""
Discord Embed Integration Patch for Hermes Gateway
===================================================

Patches the Discord adapter to detect [[embed]] directives in agent
response text and render them as Discord embeds with interactive buttons.

Usage:
    1. Copy embed_parser.py to the Discord plugin directory
    2. Apply the three patches below to adapter.py
    3. Restart the gateway

Flow:
    Agent response → send() → _parse_embed_if_present() →
        if has embeds → _send_embed_response() → channel.send(embeds=..., files=...)
        if no embeds → normal text send path
"""

# === PATCH 1: Import embed_parser at the top of adapter.py ===
# Add after line 97 (after the discord import block)

EMBED_PARSER_IMPORT = '''
# Embed directive support — allows agent responses to include [[embed]] blocks
# that render as Discord embeds with interactive buttons.
try:
    from embed_parser import process_response as _process_embed_response
    from embed_parser import hex_to_int as _embed_hex_to_int
    EMBED_PARSER_AVAILABLE = True
except ImportError:
    EMBED_PARSER_AVAILABLE = False
    _process_embed_response = None
    _embed_hex_to_int = None
'''

# === PATCH 2: Add _send_embed_response method to DiscordAdapter ===
# Insert before the _send_to_forum method (line 1788)

EMBED_SEND_METHOD = '''
    async def _send_embed_response(
        self,
        channel: Any,
        processed,
        reply_to: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> SendResult:
        """Send a parsed embed response as a Discord message with embeds and files.

        Args:
            channel: Resolved Discord channel object
            processed: ProcessedResponse from embed_parser
            reply_to: Optional message ID to reply to
            metadata: Thread/reply metadata
        """
        import discord as _discord

        embed = processed.first_embed
        if not embed:
            return await self.send(
                channel.id if hasattr(channel, "id") else str(channel),
                processed.text_content,
                reply_to=reply_to,
                metadata=metadata,
            )

        # Build discord.Embed
        discord_embed = _discord.Embed()
        if embed.title:
            discord_embed.title = embed.title
        if embed.description:
            discord_embed.description = embed.description
        if embed.color:
            try:
                discord_embed.colour = _discord.Colour(_embed_hex_to_int(embed.color))
            except Exception:
                pass

        # Attach image as file
        files = []
        if embed.image_path:
            import os
            image_path = embed.image_path
            # Expand ~ and resolve relative paths
            if image_path.startswith("~"):
                image_path = os.path.expanduser(image_path)
            elif not os.path.isabs(image_path):
                image_path = os.path.abspath(image_path)

            if os.path.exists(image_path):
                filename = os.path.basename(image_path)
                f = _discord.File(image_path, filename=filename)
                files.append(f)
                discord_embed.set_image(url=f"attachment://{filename}")
            else:
                logger.warning(
                    "[%s] Embed image not found: %s", self.name, image_path
                )

        # Build button components (max 5 per action row)
        components = []
        if embed.buttons:
            valid_buttons = embed.buttons[:5]
            row_components = []
            for btn in valid_buttons:
                style_map = {
                    "primary": _discord.ButtonStyle.primary,
                    "secondary": _discord.ButtonStyle.secondary,
                    "success": _discord.ButtonStyle.success,
                    "danger": _discord.ButtonStyle.danger,
                    "link": _discord.ButtonStyle.link,
                }
                style = style_map.get(btn.style, _discord.ButtonStyle.secondary)
                kwargs = {"style": style, "label": btn.label}
                if btn.url:
                    kwargs["url"] = btn.url
                if btn.custom_id:
                    kwargs["custom_id"] = btn.custom_id
                row_components.append(_discord.ui.Button(**kwargs))
            if row_components:
                components.append(_discord.ui.ActionRow(*row_components))

        # Resolve reply reference
        reference = None
        thread_id = None
        if metadata and metadata.get("thread_id"):
            thread_id = metadata["thread_id"]

        if reply_to and self._reply_to_mode != "off":
            try:
                ref_msg = await channel.fetch_message(int(reply_to))
                if hasattr(ref_msg, "to_reference"):
                    reference = ref_msg.to_reference(fail_if_not_exists=False)
                else:
                    reference = ref_msg
            except Exception as e:
                logger.debug("Could not fetch reply-to message for embed: %s", e)

        # Send the embed message
        send_kwargs = {
            "embed": discord_embed,
        }
        if processed.text_content:
            send_kwargs["content"] = processed.text_content
        if files:
            send_kwargs["files"] = files
        if components:
            send_kwargs["components"] = components
        if reference:
            send_kwargs["reference"] = reference

        try:
            msg = await channel.send(**send_kwargs)

            # Track the message for backfill
            nonconversational = _metadata_marks_nonconversational(metadata)
            msg_id = str(msg.id)
            _target_id = thread_id or (channel.id if hasattr(channel, "id") else None)
            if _target_id:
                if nonconversational:
                    self._nonconversational_messages.mark_many([msg_id])
                elif not _looks_like_nonconversational_history_message(
                    processed.text_content
                ):
                    self._last_self_message_id[str(_target_id)] = msg_id

            return SendResult(
                success=True,
                message_id=msg_id,
                raw_response={"message_ids": [msg_id], "embed": True},
            )
        except Exception as e:
            logger.error("[%s] Failed to send embed message: %s", self.name, e)
            # Fallback to plain text
            return await self.send(
                str(channel.id),
                f"{processed.text_content}\\n\\n(Details above — embed delivery failed)",
                reply_to=reply_to,
                metadata=metadata,
            )

'''

# === PATCH 3: Insert embed detection at the top of send() ===
# Modify the send() method to check for [[embed]] directives BEFORE
# the normal text send path. Insert after line 1695 (after channel resolution).

SEND_EMBED_CHECK = '''
            # ── Embed directive check ─────────────────────────────────
            # If the content contains [[embed]] directives, parse them
            # and route to the embed send path instead of plain text.
            if EMBED_PARSER_AVAILABLE and content and "[[embed" in content:
                try:
                    processed = _process_embed_response(content)
                    if processed.has_embeds:
                        logger.info(
                            "[%s] Sending embed response to %s (%d embed(s))",
                            self.name, chat_id, len(processed.embeds),
                        )
                        return await self._send_embed_response(
                            channel, processed,
                            reply_to=reply_to, metadata=metadata,
                        )
                except Exception as e:
                    logger.warning(
                        "[%s] Embed processing failed, falling back to text: %s",
                        self.name, e,
                    )
'''

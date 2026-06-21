"""
Discord Embed Directive Parser (Python)

Parses [[embed]] directives from Hermes agent response text.
Ported from packages/embed/src/parser.ts for gateway integration.

Syntax:
    [[embed title="Weather" color="#3498db" description="Current conditions"]]
    MEDIA:/path/to/widget.png
    [[buttons]]
    [Label](https://example.com)
    [Style:primary Label](https://example.com)
    [[/embed]]

The text outside [[embed]] blocks is sent as a normal message.
"""

import re
from dataclasses import dataclass, field
from typing import List, Optional

# Discord button style mapping
BUTTON_STYLES = {
    "primary": 1,
    "secondary": 2,
    "success": 3,
    "danger": 4,
    "link": 5,
}

EMBED_OPEN = re.compile(r"\[\[embed(?:\s+([^\]]*))?\]\]")
EMBED_CLOSE = re.compile(r"\[\[/embed\]\]")
ATTRIBUTE_PATTERN = re.compile(r'(\w+)=(?:"([^"]*)"|([\w#.-]+))')
BUTTON_PATTERN = re.compile(r"\[([^\]]*)\](?:\(([^)]*)\))?")
STYLE_PREFIX = re.compile(r"^Style:(\w+)\s+")
CUSTOM_ID_PREFIX = re.compile(r"^custom_id:(\S+)\s+")


@dataclass
class ParsedButton:
    label: str
    style: str = "secondary"
    url: Optional[str] = None
    custom_id: Optional[str] = None


@dataclass
class ParsedEmbed:
    title: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    image_path: Optional[str] = None
    buttons: List[ParsedButton] = field(default_factory=list)


@dataclass
class ProcessedResponse:
    """Result of processing an agent response for embed directives."""
    has_embeds: bool
    text_content: str
    embeds: List[ParsedEmbed] = field(default_factory=list)

    @property
    def first_embed(self) -> Optional[ParsedEmbed]:
        return self.embeds[0] if self.embeds else None


def parse_attributes(raw: str) -> dict:
    """Parse key=\"value\" or key=value attributes from the [[embed]] tag."""
    attrs = {}
    if not raw:
        return attrs
    for match in ATTRIBUTE_PATTERN.finditer(raw):
        key = match.group(1)
        value = match.group(2) if match.group(2) is not None else match.group(3)
        if value is not None:
            attrs[key] = value
    return attrs


def parse_buttons(raw: str) -> List[ParsedButton]:
    """Parse button definitions from the [[buttons]] block."""
    buttons = []
    for match in BUTTON_PATTERN.finditer(raw):
        inner = match.group(1).strip()
        url = match.group(2).strip() if match.group(2) else None

        style = "secondary"
        custom_id = None
        label = inner

        # Check for Style: prefix
        style_match = STYLE_PREFIX.match(label)
        if style_match:
            style = style_match.group(1)
            label = label[style_match.end():]

        # Check for custom_id: prefix
        cid_match = CUSTOM_ID_PREFIX.match(label)
        if cid_match:
            custom_id = cid_match.group(1)
            label = label[cid_match.end():]

        if not label:
            continue

        buttons.append(ParsedButton(
            label=label,
            style="link" if url else style,
            url=url or None,
            custom_id=custom_id,
        ))

    return buttons


def parse_embed_directives(content: str) -> tuple:
    """Parse embed directives from agent response text.

    Returns (embeds, clean_content).
    """
    embeds = []
    remaining = content

    while True:
        open_match = EMBED_OPEN.search(remaining)
        if not open_match:
            break

        open_index = open_match.start()
        open_capture = open_match.group(1) or ""
        after_open = remaining[open_match.end():]

        close_match = EMBED_CLOSE.search(after_open)
        if not close_match:
            break  # malformed — skip

        close_index = close_match.start()
        block_content = after_open[:close_index]
        attrs = parse_attributes(open_capture)

        # Extract MEDIA: path from the block
        media_match = re.search(r"MEDIA:\s*(\S+)", block_content)
        image_path = media_match.group(1) if media_match else None

        # Extract buttons section
        buttons_match = re.search(
            r"\[\[buttons\]\]([\s\S]*?)(?=\[\[/embed\]\]|$)", block_content
        )
        buttons = parse_buttons(buttons_match.group(1)) if buttons_match else []

        embeds.append(ParsedEmbed(
            title=attrs.get("title"),
            description=attrs.get("description"),
            color=attrs.get("color"),
            image_path=image_path,
            buttons=buttons,
        ))

        # Remove the block from remaining content
        block_start = open_index
        block_end = open_match.end() + close_match.end()
        remaining = remaining[:block_start] + remaining[block_end:]

    return embeds, remaining.strip()


def process_response(response: str) -> ProcessedResponse:
    """Process an agent response, extracting embed directives if present.

    This is the main entry point. Returns a ProcessedResponse with:
    - has_embeds: whether the response contained embed directives
    - text_content: cleaned text (directives removed)
    - embeds: parsed embed data (if any)
    """
    if not response or "[[embed" not in response:
        return ProcessedResponse(has_embeds=False, text_content=response)

    embeds, clean_content = parse_embed_directives(response)

    if not embeds:
        return ProcessedResponse(has_embeds=False, text_content=response)

    return ProcessedResponse(
        has_embeds=True,
        text_content=clean_content,
        embeds=embeds,
    )


def hex_to_int(hex_color: str) -> int:
    """Convert a hex color string (#rrggbb or rrggbb) to an integer."""
    return int(hex_color.lstrip("#"), 16)

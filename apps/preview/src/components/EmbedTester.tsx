import { useCallback, useMemo, useState } from "react";
import {
  parseEmbedDirectives,
  buildDiscordEmbed,
} from "@discord-widgets/embed";
import type { ParsedEmbed } from "@discord-widgets/embed";
import type { Widget } from "../types";

interface EmbedTesterProps {
  widget: Widget | null;
  imageUrl: string;
  onEmbedDirectiveChange?: (directive: string, apiPayload: string) => void;
}

function defaultTemplate(widget: Widget | null): string {
  if (!widget) return "";
  return `[[embed title="${widget.name}" color="${widget.color ?? "#5865f2"}" description="${widget.description}"]
MEDIA:/path/to/widget.png
[[buttons]]
[View Details](https://example.com)
[[/embed]]`;
}

function toHex(color: string | undefined): string {
  if (!color) return "#5865f2";
  if (/^#?[0-9a-f]{6}$/i.test(color.replace("#", ""))) {
    return color.startsWith("#") ? color : `#${color}`;
  }
  return "#5865f2";
}

export function EmbedTester({
  widget,
  imageUrl,
  onEmbedDirectiveChange,
}: EmbedTesterProps) {
  const [directive, setDirective] = useState(() => defaultTemplate(widget));
  const [result, setResult] = useState<{
    embeds: ParsedEmbed[];
    cleanContent: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = useCallback(() => {
    setError(null);
    try {
      const parsed = parseEmbedDirectives(directive);
      if (parsed.embeds.length === 0) {
        setError("No valid [[embed]] directives found.");
        setResult(null);
        return;
      }
      setResult(parsed);

      const payload = buildDiscordEmbed(parsed.embeds[0]!, imageUrl || undefined);
      onEmbedDirectiveChange?.(directive, JSON.stringify(payload, null, 2));
    } catch (err) {
      setError(
        `Parse error: ${err instanceof Error ? err.message : String(err)}`,
      );
      setResult(null);
    }
  }, [directive, imageUrl, onEmbedDirectiveChange]);

  const embed = result?.embeds[0];

  const embedColor = useMemo(() => toHex(embed?.color), [embed?.color]);

  return (
    <div className="rounded-xl border border-white/5 bg-[#2b2d31] p-4">
      <div className="mb-3 text-gray-500 text-xs uppercase tracking-wide">
        Embed Tester
      </div>

      <textarea
        value={directive}
        onChange={(e) => setDirective(e.target.value)}
        rows={6}
        className="mb-3 w-full rounded-lg border border-white/10 bg-[#1e1f22] p-3 font-mono text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
        placeholder="Enter [[embed]] directives..."
      />

      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleParse}
          className="cursor-pointer rounded-lg bg-[#5865f2] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[#4752c4]"
        >
          Parse
        </button>
        <button
          type="button"
          onClick={() => {
            setDirective(defaultTemplate(widget));
            setResult(null);
            setError(null);
          }}
          className="cursor-pointer rounded-lg border border-white/10 bg-[#4e5058]/50 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[#4e5058]"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {embed && (
        <div className="space-y-4">
          <div className="text-gray-500 text-xs uppercase tracking-wide">
            Parsed Result
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#1e1f22] p-3 text-xs">
            {embed.title && (
              <div>
                <span className="text-gray-500">Title:</span> {embed.title}
              </div>
            )}
            {embed.description && (
              <div>
                <span className="text-gray-500">Description:</span>{" "}
                {embed.description}
              </div>
            )}
            {embed.color && (
              <div>
                <span className="text-gray-500">Color:</span>{" "}
                <span
                  className="inline-block h-3 w-3 rounded align-middle"
                  style={{ backgroundColor: embedColor }}
                />
                {" "}{embed.color}
              </div>
            )}
            {embed.imagePath && (
              <div>
                <span className="text-gray-500">Image:</span> {embed.imagePath}
              </div>
            )}
            <div>
              <span className="text-gray-500">Buttons:</span>{" "}
              {embed.buttons.length}
            </div>
          </div>

          {/* Discord embed mockup */}
          <div>
            <div className="mb-2 text-gray-500 text-xs uppercase tracking-wide">
              Embed Mock-up
            </div>
            <div className="flex overflow-hidden rounded-lg bg-[#2f3136]">
              <div
                className="w-1 shrink-0"
                style={{ backgroundColor: embedColor }}
              />
              <div className="flex-1 space-y-2 p-4">
                {embed.title && (
                  <div className="font-semibold text-white">{embed.title}</div>
                )}
                {embed.description && (
                  <div className="text-gray-300 text-sm leading-relaxed">
                    {embed.description}
                  </div>
                )}
                {embed.imagePath && (
                  <div className="flex items-center justify-center rounded border border-white/10 bg-[#1e1f22] py-8">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Embedded widget preview"
                        className="max-h-32 rounded object-contain"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">
                        Image placeholder: {embed.imagePath}
                      </span>
                    )}
                  </div>
                )}
                {embed.buttons.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {embed.buttons.map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        className={`rounded px-3 py-1.5 text-sm ${
                          btn.style === "primary"
                            ? "bg-[#5865f2] text-white"
                            : btn.style === "link"
                              ? "text-[#00a8fc] underline"
                              : "bg-[#4e5058]/50 text-white"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* API payload */}
          {result && (
            <details className="group">
              <summary className="cursor-pointer text-gray-400 text-xs hover:text-white">
                API Payload
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-[#1e1f22] p-3 text-gray-300 text-xs">
                {JSON.stringify(
                  buildDiscordEmbed(embed, imageUrl || undefined),
                  null,
                  2,
                )}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
import { useCallback, useEffect, useState } from "react";
import type { RenderMeta } from "../types";

interface ExportPanelProps {
  imageUrl: string;
  meta: RenderMeta | null;
  embedDirective: string;
  apiPayload: string;
}

export function ExportPanel({
  imageUrl,
  meta,
  embedDirective,
  apiPayload,
}: ExportPanelProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(null), 2000);
    return () => clearTimeout(id);
  }, [feedback]);

  const copy = useCallback(async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setFeedback(label);
  }, []);

  const download = useCallback(() => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = meta ? `widget-${meta.width}x${meta.height}.png` : "widget.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [imageUrl, meta]);

  return (
    <div className="rounded-xl border border-white/5 bg-[#2b2d31] p-4">
      <div className="mb-3 text-gray-500 text-xs uppercase tracking-wide">
        Export
      </div>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => copy("Copied!", imageUrl)}
          disabled={!imageUrl}
          className="w-full cursor-pointer rounded-md bg-[#5865f2] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[#4752c4] disabled:opacity-50"
        >
          Copy PNG URL
        </button>
        <button
          type="button"
          onClick={download}
          disabled={!imageUrl}
          className="w-full cursor-pointer rounded-md bg-[#5865f2] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[#4752c4] disabled:opacity-50"
        >
          Download PNG
        </button>
        <button
          type="button"
          onClick={() => copy("Copied!", embedDirective)}
          disabled={!embedDirective}
          className="w-full cursor-pointer rounded-md bg-[#5865f2] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[#4752c4] disabled:opacity-50"
        >
          Copy Embed Directive
        </button>
        <button
          type="button"
          onClick={() => copy("Copied!", apiPayload)}
          disabled={!apiPayload}
          className="w-full cursor-pointer rounded-md bg-[#5865f2] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[#4752c4] disabled:opacity-50"
        >
          Copy API Payload
        </button>
      </div>
      {feedback && (
        <div className="mt-2 text-center text-green-400 text-xs">
          {feedback}
        </div>
      )}
    </div>
  );
}
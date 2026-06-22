import { useState } from "react";
import type { Widget } from "../types";

interface InteractionSimulatorProps {
  widget: Widget | null;
  onStateChange?: (state: Record<string, unknown>) => void;
}

interface InteractionEntry {
  button: NonNullable<Widget["buttons"]>[number];
  timestamp: number;
  payload: Record<string, unknown>;
}

export function InteractionSimulator({
  widget,
  onStateChange,
}: InteractionSimulatorProps) {
  const [history, setHistory] = useState<InteractionEntry[]>([]);

  const handleClick = (
    button: NonNullable<Widget["buttons"]>[number],
  ) => {
    const payload: Record<string, unknown> = {
      type: 3,
      custom_id: button.action?.handler ?? button.label.toLowerCase(),
      component_type: 2,
      message: {
        id: "mock_msg_001",
        channel_id: "mock_channel_001",
        author: { id: "mock_user_001", username: "PreviewUser" },
        timestamp: new Date().toISOString(),
      },
    };

    setHistory((prev) => [...prev, { button, timestamp: Date.now(), payload }]);

    if (button.action?.handler) {
      onStateChange?.({ lastHandler: button.action.handler, lastLabel: button.label });
    }
  };

  const clearLog = () => setHistory([]);

  const buttonStyle = (
    style: string | undefined,
  ): string => {
    switch (style) {
      case "primary":
        return "bg-[#5865f2] text-white hover:bg-[#4752c4]";
      case "link":
        return "text-[#00a8fc] hover:underline";
      default:
        return "bg-[#4e5058]/50 text-white hover:bg-[#4e5058]";
    }
  };

  return (
    <div className="rounded-xl border border-white/5 bg-[#2b2d31] p-4">
      <div className="mb-3 text-gray-500 text-xs uppercase tracking-wide">
        Interaction Simulator
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(widget?.buttons ?? []).length === 0 && (
          <span className="text-gray-500 text-sm">
            No buttons on this widget
          </span>
        )}
        {(widget?.buttons ?? []).map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={() => handleClick(button)}
            className={`cursor-pointer rounded-lg border border-white/10 px-4 py-2 font-medium text-sm transition-colors ${buttonStyle(button.style)}`}
          >
            {button.label}
            {button.style === "link" && button.action?.url && (
              <span className="ml-2 text-xs opacity-70">↗</span>
            )}
          </button>
        ))}
        {history.length > 0 && (
          <button
            type="button"
            onClick={clearLog}
            className="ml-auto cursor-pointer rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-red-400 text-xs transition-colors hover:bg-red-500/20"
          >
            Clear Log
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div className="space-y-2">
          <div className="text-gray-500 text-xs uppercase tracking-wide">
            Interaction Log ({history.length})
          </div>

          <div className="max-h-48 space-y-1 overflow-y-auto">
            {history.toReversed().map((entry, i) => (
              <div
                key={entry.timestamp}
                className="flex items-center justify-between rounded-lg bg-[#1e1f22] px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">
                    #{history.length - i}
                  </span>
                  <span className="font-medium">{entry.button.label}</span>
                  <span className="rounded bg-white/5 px-1.5 py-0.5 text-gray-400 text-xs">
                    {entry.button.style ?? "secondary"}
                  </span>
                  {entry.button.action?.type && (
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-gray-400 text-xs">
                      {entry.button.action.type}
                    </span>
                  )}
                </div>
                <div className="text-gray-500 text-xs">
                  {entry.button.action?.handler
                    ? `custom_id: ${entry.button.action.handler}`
                    : `custom_id: ${entry.button.label.toLowerCase()}`}
                </div>
              </div>
            ))}
          </div>

          <details className="group">
            <summary className="cursor-pointer text-gray-400 text-xs hover:text-white">
              Mock Payload (JSON)
            </summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-[#1e1f22] p-3 text-gray-300 text-xs">
              {JSON.stringify(history[0]!.payload, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
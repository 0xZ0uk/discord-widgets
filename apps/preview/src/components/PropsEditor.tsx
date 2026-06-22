import { useCallback } from "react";
import type { Widget } from "../types";

interface PropsEditorProps {
  widget: Widget | null;
  props: Record<string, unknown>;
  onPropsChange: (props: Record<string, unknown>) => void;
  onRender: () => void;
  loading: boolean;
}

export function PropsEditor({
  widget,
  props,
  onPropsChange,
  onRender,
  loading,
}: PropsEditorProps) {
  const handleChange = useCallback(
    (name: string, value: string) => {
      onPropsChange({ ...props, [name]: value });
    },
    [props, onPropsChange],
  );

  if (!widget) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#2b2d31] p-4">
        <div className="text-gray-400 text-sm">Select a widget to edit props</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 bg-[#2b2d31] p-4">
      <div className="mb-3 text-gray-500 text-xs uppercase tracking-wide">
        Props
      </div>
      <div className="space-y-3">
        {(widget.fields ?? []).map((field) => (
          <div key={field.name}>
            <label className="mb-1 block text-gray-400 text-sm">
              {field.name}
            </label>
            <input
              type="text"
              value={(props[field.name] as string) ?? field.value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full rounded-md border border-white/10 bg-[#1e1f22] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onRender}
        disabled={loading}
        className="mt-4 w-full cursor-pointer rounded-md bg-[#5865f2] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[#4752c4] disabled:opacity-50"
      >
        {loading ? "Rendering..." : "Render"}
      </button>
    </div>
  );
}
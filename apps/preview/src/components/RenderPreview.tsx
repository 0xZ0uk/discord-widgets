import type { RenderMeta } from "../types";

interface RenderPreviewProps {
  imageUrl: string;
  meta: RenderMeta | null;
  loading: boolean;
  error: string;
}

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatRenderTime(ms: number): string {
  return `${ms.toFixed(1)} ms`;
}

export function RenderPreview({
  imageUrl,
  meta,
  loading,
  error,
}: RenderPreviewProps) {
  if (error) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#2b2d31] p-4">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-white/5 bg-[#2b2d31] p-4">
        <div className="flex flex-col items-center gap-2 text-gray-400 text-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
          Rendering...
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-white/5 bg-[#2b2d31] p-4">
        <div className="text-gray-400 text-sm">No widget selected</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 bg-[#2b2d31] p-4">
      <img
        src={imageUrl}
        alt="Widget preview"
        className="max-w-full rounded-lg shadow-lg"
      />
      {meta && (
        <div className="mt-4 space-y-1 border-t border-white/5 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Dimensions</span>
            <span className="text-white">
              {meta.width} × {meta.height}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">File size</span>
            <span className="text-white">{formatFileSize(meta.fileSize)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Render time</span>
            <span className="text-white">
              {formatRenderTime(meta.renderTime)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
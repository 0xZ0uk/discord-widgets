interface RenderPreviewProps {
	imageUrl: string;
	loading: boolean;
	error: string;
}

export function RenderPreview({
	imageUrl,
	loading,
	error,
}: RenderPreviewProps) {
	if (error) {
		return <div className="text-red-400 text-sm">{error}</div>;
	}

	if (loading) {
		return (
			<div className="flex flex-col items-center gap-2 text-gray-400 text-sm">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				Rendering...
			</div>
		);
	}

	if (!imageUrl) {
		return (
			<div className="text-muted-foreground text-sm">No widget selected</div>
		);
	}

	return (
		<div className="rounded-xl">
			<img
				src={imageUrl}
				alt="Widget preview"
				className="max-w-full rounded-lg shadow-lg"
			/>
		</div>
	);
}

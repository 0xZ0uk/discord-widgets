import { useCallback } from "react";
import type { Widget } from "#/types/widget";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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
			<div className="text-muted-foreground text-sm">
				Select a widget to edit props
			</div>
		);
	}

	return (
		<div className="p-4">
			<p className="mb-2 font-medium text-muted-foreground text-xs uppercase">
				Props
			</p>
			<div className="space-y-3">
				{(widget.fields ?? []).map((field) => (
					<div key={field.name}>
						<Label className="mb-1 block text-muted-foreground text-sm">
							{field.name}
						</Label>
						<Input
							type="text"
							value={(props[field.name] as string) ?? field.value}
							onChange={(e) => handleChange(field.name, e.target.value)}
							className="w-full text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
				))}
			</div>
			<Button
				type="button"
				onClick={onRender}
				disabled={loading}
				className="mt-4 w-full cursor-pointer rounded-md px-4 py-2 font-medium text-sm transition-colors disabled:opacity-50"
			>
				{loading ? "Rendering..." : "Render"}
			</Button>
		</div>
	);
}

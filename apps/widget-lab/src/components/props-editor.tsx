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

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
	const parts = path.split(".");
	let current: unknown = obj;
	for (const part of parts) {
		if (current == null || typeof current !== "object") return undefined;
		current = (current as Record<string, unknown>)[part];
	}
	return current;
}

function setNestedValue(
	obj: Record<string, unknown>,
	path: string,
	value: unknown,
): Record<string, unknown> {
	const parts = path.split(".");
	const result = { ...obj };
	let current = result;
	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i];
		current[part] =
			typeof current[part] === "object" && current[part] !== null
				? { ...(current[part] as Record<string, unknown>) }
				: {};
		current = current[part] as Record<string, unknown>;
	}
	current[parts[parts.length - 1]] = value;
	return result;
}

export function PropsEditor({
	widget,
	props,
	onPropsChange,
	onRender,
	loading,
}: PropsEditorProps) {
	const handleChange = useCallback(
		(propKey: string, value: string) => {
			onPropsChange(setNestedValue(props, propKey, value));
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
			<p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
				Props
			</p>
			<div className="space-y-3">
				{(widget.fields ?? []).map((field) => {
					const propKey = field.prop ?? field.name;
					const value = getNestedValue(props, propKey) ?? field.value;
					return (
						<div key={field.name}>
							<Label className="mb-1 block text-muted-foreground text-sm">
								{field.name}
							</Label>
							<Input
								type="text"
								value={String(value)}
								onChange={(e) => handleChange(propKey, e.target.value)}
								className="w-full text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
							/>
						</div>
					);
				})}
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

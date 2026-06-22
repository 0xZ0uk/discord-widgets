export interface Widget {
	name: string;
	description: string;
	category?: string;
	component?: string;
	color?: string;
	fields?: Array<{
		name: string;
		value: string;
		prop?: string;
		inline?: boolean;
	}>;
	buttons?: Array<{
		label: string;
		style?:
			| "default"
			| "link"
			| "destructive"
			| "outline"
			| "secondary"
			| "ghost"
			| undefined;
		action?: { type: string; url?: string; handler?: string };
	}>;
}

export interface RenderMeta {
	url: string;
	width: number;
	height: number;
	fileSize: number;
	renderTime: number;
}

export interface ParsedButton {
	label: string;
	style: "primary" | "secondary" | "link" | "danger" | "success";
	url?: string;
	custom_id?: string;
}

export interface ParsedEmbed {
	title?: string;
	description?: string;
	color?: string;
	imagePath?: string;
	buttons: ParsedButton[];
}

export interface InteractionEvent {
	type: "button_click";
	button: {
		label: string;
		style?: string;
		action?: { type: string; url?: string; handler?: string };
	};
	customId: string;
	state?: Record<string, unknown>;
}

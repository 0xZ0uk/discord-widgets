import { create } from "zustand";
import type { RenderMeta, Widget } from "#/types/widget";

export type Tab = "interaction" | "embed" | "export";

interface WidgetStore {
	widgets: Widget[];
	selected: string;
	props: Record<string, unknown>;
	imageUrl: string;
	meta: RenderMeta | null;
	loading: boolean;
	error: string;
	embedDirective: string;
	apiPayload: string;
	tab: Tab;
	setWidgets: (widgets: Widget[]) => void;
	setSelected: (selected: string) => void;
	setProps: (props: Record<string, unknown>) => void;
	setImageUrl: (imageUrl: string) => void;
	setMeta: (meta: RenderMeta | null) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string) => void;
	setEmbedDirective: (embedDirective: string) => void;
	setApiPayload: (apiPayload: string) => void;
	setTab: (tab: Tab) => void;
}

export const useWidgetStore = create<WidgetStore>((set) => ({
	widgets: [],
	selected: "",
	props: {},
	imageUrl: "",
	meta: null,
	loading: false,
	error: "",
	embedDirective: "",
	apiPayload: "",
	tab: "interaction",
	setWidgets: (widgets) => set({ widgets }),
	setSelected: (selected) => set({ selected }),
	setProps: (props) => set({ props }),
	setImageUrl: (imageUrl) => set({ imageUrl }),
	setMeta: (meta) => set({ meta }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setEmbedDirective: (embedDirective) => set({ embedDirective }),
	setApiPayload: (apiPayload) => set({ apiPayload }),
	setTab: (tab) => set({ tab }),
}));

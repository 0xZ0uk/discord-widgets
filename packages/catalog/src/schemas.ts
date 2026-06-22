import { z } from "zod";

export const WidgetSchema = z.object({
	name: z.string(),
	description: z.string(),
	category: z.string().optional(),
	component: z.string().optional(),
	color: z.string().optional(),
	fields: z
		.array(
			z.object({
				name: z.string(),
				value: z.string(),
				prop: z.string().optional(),
				inline: z.boolean().optional(),
			}),
		)
		.optional(),
	buttons: z
		.array(
			z.object({
				label: z.string(),
				style: z.enum(["primary", "secondary", "link"]).optional(),
				action: z
					.object({
						type: z.enum(["url", "interaction"]),
						url: z.string().optional(),
						handler: z.string().optional(),
					})
					.optional(),
			}),
		)
		.optional(),
});

export type Widget = z.infer<typeof WidgetSchema>;

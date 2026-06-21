import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		R2_ACCOUNT_ID: z.string().min(1, "R2_ACCOUNT_ID is required"),
		R2_ACCESS_KEY_ID: z.string().min(1, "R2_ACCESS_KEY_ID is required"),
		R2_SECRET_ACCESS_KEY: z.string().min(1, "R2_SECRET_ACCESS_KEY is required"),
		R2_BUCKET_NAME: z.string().min(1, "R2_BUCKET_NAME is required"),
		R2_PUBLIC_URL: z.url("R2_PUBLIC_URL must be a valid URL"),
	},
	runtimeEnv: process.env,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});

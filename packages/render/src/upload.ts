import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@discord-widgets/env";

const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = env.R2_PUBLIC_URL;

const s3 = new S3Client({
	endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	region: "auto",
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID ?? "",
		secretAccessKey: R2_SECRET_ACCESS_KEY ?? "",
	},
});

export async function uploadToR2(buffer: Buffer, key: string): Promise<string> {
	await s3.send(
		new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: "image/png",
		}),
	);

	return `${R2_PUBLIC_URL}/${key}`;
}

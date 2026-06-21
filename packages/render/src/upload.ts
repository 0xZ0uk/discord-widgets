import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@discord-widgets/env";

let s3: S3Client | null = null;

function getS3(): S3Client | null {
	if (s3) return s3;
	const accountId = env.R2_ACCOUNT_ID;
	const accessKeyId = env.R2_ACCESS_KEY_ID;
	const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
	if (!accountId || !accessKeyId || !secretAccessKey) return null;
	s3 = new S3Client({
		endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
		region: "auto",
		credentials: { accessKeyId, secretAccessKey },
	});
	return s3;
}

export function isR2Configured(): boolean {
	return (
		!!env.R2_ACCOUNT_ID &&
		!!env.R2_ACCESS_KEY_ID &&
		!!env.R2_SECRET_ACCESS_KEY &&
		!!env.R2_BUCKET_NAME &&
		!!env.R2_PUBLIC_URL
	);
}

export async function uploadToR2(buffer: Buffer, key: string): Promise<string> {
	const client = getS3();
	const bucket = env.R2_BUCKET_NAME;
	const publicUrl = env.R2_PUBLIC_URL;
	if (!client || !bucket || !publicUrl) {
		throw new Error(
			"R2 not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL",
		);
	}
	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: buffer,
			ContentType: "image/png",
		}),
	);

	return `${publicUrl}/${key}`;
}

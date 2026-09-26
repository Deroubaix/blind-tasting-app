import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Cloudflare R2, spoken to over the S3 API.
 *
 * The bucket stays private: label photos belong to one account, so reads go through
 * /api/photos/<key>, which checks the owner and redirects to a short-lived signed URL. Writes are
 * signed too, and the browser sends the file straight to the bucket — which needs a CORS rule on
 * the bucket allowing PUT from the app's origin.
 */

function env(name: string) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} is not set. R2 needs it; see .env.example.`);
	}
	return value;
}

let client: S3Client | undefined;

function s3() {
	client ??= new S3Client({
		region: 'auto',
		endpoint: `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: env('R2_ACCESS_KEY_ID'),
			secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
		},
	});
	return client;
}

/** A URL the browser may PUT one file to, valid for ten minutes. */
export function signUpload(key: string, contentType: string) {
	return getSignedUrl(s3(), new PutObjectCommand({ Bucket: env('R2_BUCKET'), Key: key, ContentType: contentType }), {
		expiresIn: 600,
	});
}

/** A URL the browser may GET one file from, valid for an hour. */
export function signDownload(key: string) {
	return getSignedUrl(s3(), new GetObjectCommand({ Bucket: env('R2_BUCKET'), Key: key }), { expiresIn: 3600 });
}

export async function r2Delete(key: string) {
	await s3().send(new DeleteObjectCommand({ Bucket: env('R2_BUCKET'), Key: key }));
}

export async function r2Exists(key: string) {
	try {
		await s3().send(new HeadObjectCommand({ Bucket: env('R2_BUCKET'), Key: key }));
		return true;
	} catch {
		return false;
	}
}

/** The size R2 recorded, used to check an upload rather than believe what the browser claimed. */
export async function r2Size(key: string) {
	const head = await s3().send(new HeadObjectCommand({ Bucket: env('R2_BUCKET'), Key: key }));
	return head.ContentLength ?? 0;
}

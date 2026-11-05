import {
	DeleteObjectCommand,
	DeleteObjectsCommand,
	GetObjectCommand,
	HeadObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { type R2Config } from '../../config/ServerConfig';
import { PHOTO_CONTENT_TYPE } from '../../utils/PhotoKeyUtils';
import PhotoStorageService from './PhotoStorageService';

/**
 * Cloudflare R2, spoken to over the S3 API. The bucket stays private: reads go through
 * /api/photos/<key>, which checks the owner and redirects to a signed URL. The browser PUTs
 * straight to the bucket, which needs a CORS rule allowing PUT from the app's origin.
 */
export default class R2PhotoStorageService extends PhotoStorageService {
	public readonly receivesUploads = false;
	private readonly _s3: S3Client;

	constructor(private readonly _config: R2Config) {
		super();
		this._s3 = new S3Client({
			region: 'auto',
			endpoint: `https://${_config.accountId}.r2.cloudflarestorage.com`,
			credentials: { accessKeyId: _config.accessKeyId, secretAccessKey: _config.secretAccessKey },
		});
	}

	/** Valid for ten minutes. */
	public uploadUrl(key: string) {
		const command = new PutObjectCommand({
			Bucket: this._config.bucket,
			Key: key,
			ContentType: PHOTO_CONTENT_TYPE,
		});
		return getSignedUrl(this._s3, command, { expiresIn: 600 });
	}

	public async open(key: string) {
		return { redirect: await this.downloadUrl(key) };
	}

	public async write(): Promise<void> {
		throw new Error('R2 uploads go straight from the browser to the bucket.');
	}

	public async read(key: string) {
		const response = await fetch(await this.downloadUrl(key));
		return response.ok ? new Uint8Array(await response.arrayBuffer()) : null;
	}

	public async size(key: string) {
		try {
			const head = await this._s3.send(new HeadObjectCommand({ Bucket: this._config.bucket, Key: key }));
			return head.ContentLength ?? 0;
		} catch {
			return null;
		}
	}

	public async remove(key: string) {
		await this._s3.send(new DeleteObjectCommand({ Bucket: this._config.bucket, Key: key }));
	}

	/** A page of up to 1,000 objects at a time. */
	public async removeFolder(prefix: string) {
		const Bucket = this._config.bucket;
		let ContinuationToken: string | undefined;
		do {
			const page = await this._s3.send(new ListObjectsV2Command({ Bucket, Prefix: prefix, ContinuationToken }));
			const objects = (page.Contents ?? []).flatMap((object) => (object.Key ? [{ Key: object.Key }] : []));
			if (objects.length) {
				await this._s3.send(new DeleteObjectsCommand({ Bucket, Delete: { Objects: objects, Quiet: true } }));
			}
			ContinuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
		} while (ContinuationToken);
	}

	/** Valid for an hour. */
	private downloadUrl(key: string) {
		return getSignedUrl(this._s3, new GetObjectCommand({ Bucket: this._config.bucket, Key: key }), {
			expiresIn: 3600,
		});
	}
}

import { apiError, logServerError } from '../../utils/ApiUtils';
import { MAX_PHOTO_BYTES, newPhotoKey, ownsPhotoKey, userPhotoFolder } from '../../utils/PhotoKeyUtils';
import type PhotoStorageService from './PhotoStorageService';

const notFound = () => apiError(404, 'notFound');

/** Label photos: who may read and write which key. Where the bytes live is the storage's business. */
export default class PhotoService {
	constructor(
		// Built on first use: R2 needs its settings, which shouldn't stop anything but photos.
		private readonly _storage: () => PhotoStorageService,
	) {}

	/** Records nothing: the key only joins a tasting when one is saved with it, and the save checks the file. */
	public async sign(userId: string) {
		const key = newPhotoKey(userId);
		return { key, uploadUrl: await this._storage().uploadUrl(key) };
	}

	/** The owner's photo: a signed URL on R2, the file itself on the local driver. */
	public async open(
		userId: string,
		key: string,
	): Promise<{ redirect: string } | { body: ReadableStream; size: number }> {
		if (!ownsPhotoKey(userId, key)) {
			throw notFound();
		}
		const photo = await this._storage().open(key);
		if (!photo) {
			throw notFound();
		}
		return photo;
	}

	/** Local disk's stand-in for a signed bucket URL. On R2 the browser PUTs to the bucket. */
	public async upload(userId: string, key: string, readBody: () => Promise<Buffer>) {
		if (!this._storage().receivesUploads) {
			throw notFound();
		}
		if (!ownsPhotoKey(userId, key)) {
			throw apiError(403, 'uploadKeyNotYours');
		}
		// Read only once the key checks out, so a refused upload never buffers its body.
		const data = await readBody();
		if (data.length === 0) {
			throw apiError(400, 'photoEmpty');
		}
		if (data.length > MAX_PHOTO_BYTES) {
			throw apiError(413, 'photoTooLarge');
		}
		await this._storage().write(key, data);
	}

	/** The key comes from the browser, so ownership and the stored size are checked, never believed. */
	public async verifiedKey(userId: string, photoKey: string | null | undefined) {
		if (!photoKey) {
			return null;
		}
		if (!ownsPhotoKey(userId, photoKey)) {
			throw apiError(400, 'photoNotYours');
		}
		const size = await this._storage().size(photoKey);
		if (size === null) {
			throw apiError(400, 'photoUnfinished');
		}
		if (size > MAX_PHOTO_BYTES) {
			throw apiError(413, 'photoTooLarge');
		}
		return photoKey;
	}

	/** For the data export: null when the file is missing, which the export notes rather than fails on. */
	public read(key: string) {
		return this._storage().read(key);
	}

	/** Called after the rows are gone, so a failure leaves an unused file, never a broken tasting. */
	public async remove(key: string) {
		await this._storage()
			.remove(key)
			.catch((error) => logServerError('PhotoService.remove', error));
	}

	public async removeAll(userId: string) {
		await this._storage()
			.removeFolder(userPhotoFolder(userId))
			.catch((error) => logServerError('PhotoService.removeAll', error));
	}
}

import {
	MAX_PHOTO_BYTES,
	deletePhoto,
	deleteUserPhotos,
	newPhotoKey,
	ownsPhotoKey,
	photoDownloadUrl,
	photoSize,
	photoUploadUrl,
	readLocalPhoto,
	storageDriver,
	writeLocalPhoto,
} from '../../lib/storage';
import { apiError, logServerError } from '../../utils/ApiUtils';

const notFound = () => apiError(404, 'notFound');

/** Label photos: who may read and write which key. Where the bytes live is lib/storage's business. */
export default class PhotoService {
	/** Records nothing: the key only joins a tasting when one is saved with it, and the save checks the file. */
	public async sign(userId: string) {
		const key = newPhotoKey(userId);
		return { key, uploadUrl: await photoUploadUrl(key) };
	}

	/** The owner's photo: a signed URL on R2, the file itself on the local driver. */
	public async open(
		userId: string,
		key: string,
	): Promise<{ redirect: string } | { body: ReadableStream; size: number }> {
		if (!ownsPhotoKey(userId, key)) {
			throw notFound();
		}
		if (storageDriver() === 'r2') {
			return { redirect: await photoDownloadUrl(key) };
		}
		const size = await photoSize(key);
		if (size === null) {
			throw notFound();
		}
		return { body: readLocalPhoto(key), size };
	}

	/** The local driver's stand-in for a signed bucket URL. On R2 the browser PUTs to the bucket. */
	public async upload(userId: string, key: string, readBody: () => Promise<Buffer>) {
		if (storageDriver() !== 'local') {
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
		await writeLocalPhoto(key, data);
	}

	/** The key comes from the browser, so ownership and the stored size are checked, never believed. */
	public async verifiedKey(userId: string, photoKey: string | null | undefined) {
		if (!photoKey) {
			return null;
		}
		if (!ownsPhotoKey(userId, photoKey)) {
			throw apiError(400, 'photoNotYours');
		}
		const size = await photoSize(photoKey);
		if (size === null) {
			throw apiError(400, 'photoUnfinished');
		}
		if (size > MAX_PHOTO_BYTES) {
			throw apiError(413, 'photoTooLarge');
		}
		return photoKey;
	}

	/** Called after the rows are gone, so a failure leaves an unused file, never a broken tasting. */
	public async remove(key: string) {
		await deletePhoto(key).catch((error) => logServerError('PhotoService.remove', error));
	}

	public async removeAll(userId: string) {
		await deleteUserPhotos(userId).catch((error) => logServerError('PhotoService.removeAll', error));
	}
}

import { randomUUID } from 'node:crypto';

/** The browser re-encodes every photo to JPEG before upload, so this is the only type stored. */
export const PHOTO_CONTENT_TYPE = 'image/jpeg';

/** Far above what a 2000px JPEG comes to; it only has to stop an upload that skipped the resize. */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

/**
 * The server names every key, never the browser, and puts the owner's id in it. That is what lets
 * the upload, save and serve routes check ownership from the key alone, without a row to look up —
 * the photo is uploaded before the tasting it belongs to exists.
 */
export function newPhotoKey(userId: string) {
	return `labels/${userId}/${randomUUID()}.jpg`;
}

/** True only for a key `newPhotoKey` could have issued to this user. */
export function ownsPhotoKey(userId: string, key: string) {
	return new RegExp(`^labels/${UUID}/${UUID}\\.jpg$`).test(key) && key.startsWith(`labels/${userId}/`);
}

/** The folder holding all of one user's photos. */
export function userPhotoFolder(userId: string) {
	if (!new RegExp(`^${UUID}$`).test(userId)) {
		throw new Error(`Not a user id: ${userId}`);
	}
	return `labels/${userId}/`;
}

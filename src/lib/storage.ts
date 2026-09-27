import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import { r2Delete, r2DeletePrefix, r2Exists, r2Size, signDownload, signUpload } from './storage-r2';

/**
 * Where label photographs live.
 *
 * `local` writes under UPLOAD_DIR, which is what development uses and what any host with a real
 * disk can use. `r2` keeps nothing locally: the browser PUTs straight to the bucket with a signed
 * URL, so the app never handles the bytes and can run somewhere with no writable disk. The browser's
 * side of the upload is the same either way — sign, PUT, then save the tasting with the key.
 */
export function storageDriver(): 'local' | 'r2' {
	return process.env.STORAGE_DRIVER === 'r2' ? 'r2' : 'local';
}

/** The browser re-encodes every photo to JPEG before upload, so this is the only type stored. */
export const PHOTO_CONTENT_TYPE = 'image/jpeg';

/** Far above what a 2000px JPEG comes to; it only has to stop an upload that skipped the resize. */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/**
 * The server names every key, never the browser, and puts the owner's id in it. That is what lets
 * the upload, save and serve routes check ownership from the key alone, without a row to look up —
 * the photo is uploaded before the tasting it belongs to exists.
 */
export function newPhotoKey(userId: string) {
	return `labels/${userId}/${randomUUID()}.jpg`;
}

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

/** True only for a key `newPhotoKey` could have issued to this user. */
export function ownsPhotoKey(userId: string, key: string) {
	return new RegExp(`^labels/${UUID}/${UUID}\\.jpg$`).test(key) && key.startsWith(`labels/${userId}/`);
}

function uploadRoot() {
	return resolve(process.cwd(), process.env.UPLOAD_DIR ?? './uploads');
}

/**
 * `ownsPhotoKey` already rules out anything but a uuid path, but a traversal-safe join costs nothing
 * and keeps the disk safe even if a caller forgets that check.
 */
function localPath(key: string) {
	const root = uploadRoot();
	const target = resolve(join(root, normalize(key)));
	if (!target.startsWith(root + sep)) {
		throw new Error(`Refusing to access a path outside the upload directory: ${key}`);
	}
	return target;
}

export async function writeLocalPhoto(key: string, data: Buffer) {
	const path = localPath(key);
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, data);
}

export function readLocalPhoto(key: string) {
	return Readable.toWeb(createReadStream(localPath(key))) as ReadableStream;
}

/** Removes a stored photo. Already gone counts as success, since that is the state wanted. */
export async function deletePhoto(key: string) {
	if (storageDriver() === 'r2') {
		await r2Delete(key);
		return;
	}
	try {
		await unlink(localPath(key));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
			throw error;
		}
	}
}

/** Removes every photo a user uploaded, including any never attached to a saved tasting. */
export async function deleteUserPhotos(userId: string) {
	if (!new RegExp(`^${UUID}$`).test(userId)) {
		throw new Error(`Not a user id: ${userId}`);
	}
	const prefix = `labels/${userId}/`;
	if (storageDriver() === 'r2') {
		await r2DeletePrefix(prefix);
		return;
	}
	await rm(localPath(prefix), { recursive: true, force: true });
}

/** Size in bytes of a stored photo, or null when there is nothing under that key. */
export async function photoSize(key: string): Promise<number | null> {
	if (storageDriver() === 'r2') {
		return (await r2Exists(key)) ? r2Size(key) : null;
	}
	try {
		return (await stat(localPath(key))).size;
	} catch {
		return null;
	}
}

/**
 * Where the browser PUTs the file. On local disk that is this app's own receiver, standing in for
 * the signed bucket URL so the client code runs the same path in development and production.
 */
export async function photoUploadUrl(key: string) {
	return storageDriver() === 'r2'
		? signUpload(key, PHOTO_CONTENT_TYPE)
		: `/api/photos/upload?key=${encodeURIComponent(key)}`;
}

/** A short-lived bucket URL to redirect to. Only meaningful on R2; local disk streams instead. */
export function photoDownloadUrl(key: string) {
	return signDownload(key);
}

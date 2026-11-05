import { createReadStream } from 'node:fs';
import { mkdir, readFile, rm, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import PhotoStorageService from './PhotoStorageService';

const isMissing = (error: unknown) => (error as NodeJS.ErrnoException).code === 'ENOENT';

/** Photos on local disk under UPLOAD_DIR: development, or any host with a real disk. */
export default class LocalPhotoStorageService extends PhotoStorageService {
	public readonly receivesUploads = true;

	constructor(private readonly _root: string) {
		super();
	}

	/** This app's own receiver, standing in for a signed bucket URL. */
	public async uploadUrl(key: string) {
		return `/api/photos/upload?key=${encodeURIComponent(key)}`;
	}

	public async open(key: string) {
		const size = await this.size(key);
		return size === null
			? null
			: { body: Readable.toWeb(createReadStream(this.path(key))) as ReadableStream, size };
	}

	public async write(key: string, data: Buffer) {
		const path = this.path(key);
		await mkdir(dirname(path), { recursive: true });
		await writeFile(path, data);
	}

	public async read(key: string) {
		try {
			return new Uint8Array(await readFile(this.path(key)));
		} catch (error) {
			if (isMissing(error)) {
				return null;
			}
			throw error;
		}
	}

	public async size(key: string) {
		try {
			return (await stat(this.path(key))).size;
		} catch {
			return null;
		}
	}

	public async remove(key: string) {
		try {
			await unlink(this.path(key));
		} catch (error) {
			if (!isMissing(error)) {
				throw error;
			}
		}
	}

	public async removeFolder(prefix: string) {
		await rm(this.path(prefix), { recursive: true, force: true });
	}

	// Callers check keys with ownsPhotoKey; this keeps the disk safe even if one forgets.
	private path(key: string) {
		const target = resolve(join(this._root, normalize(key)));
		if (!target.startsWith(this._root + sep)) {
			throw new Error(`Refusing to access a path outside the upload directory: ${key}`);
		}
		return target;
	}
}

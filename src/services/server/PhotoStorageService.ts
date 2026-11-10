/**
 * Where label photos live. The browser's side of an upload is the same for every driver: sign, PUT
 * to `uploadUrl`, then save the tasting with the key.
 */
export default abstract class PhotoStorageService {
	/** True when uploads come to /api/photos/upload rather than straight to a bucket. */
	public abstract readonly receivesUploads: boolean;

	/** Where to PUT exactly `size` bytes of JPEG to `key`. */
	public abstract uploadUrl(key: string, size: number): Promise<string>;

	/** A short-lived URL to redirect to, or the file itself; null when nothing is stored. */
	public abstract open(key: string): Promise<{ redirect: string } | { body: ReadableStream; size: number } | null>;

	public abstract write(key: string, data: Buffer): Promise<void>;

	/** The whole photo, for the data export. Null when nothing is stored under that key. */
	public abstract read(key: string): Promise<Uint8Array | null>;

	/** Size in bytes, or null when nothing is stored under that key. */
	public abstract size(key: string): Promise<number | null>;

	/** Already gone counts as success, since that is the state wanted. */
	public abstract remove(key: string): Promise<void>;

	public abstract removeFolder(prefix: string): Promise<void>;
}

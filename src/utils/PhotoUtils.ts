import { type LabelPhoto } from '../components/tasting/TastingContext';

/** Long edge in pixels. Still enough to read a label, and a phone photo comes down to ~150KB. */
const MAX_EDGE = 1200;
const JPEG_QUALITY = 0.85;

type Decoded = { source: CanvasImageSource; width: number; height: number; release: () => void };

/**
 * Opens the photograph by the first route this browser manages.
 *
 * `createImageBitmap` with `imageOrientation: 'from-image'` applies the EXIF rotation, so a label
 * shot with the phone sideways is stored the right way up. Some Android browsers refuse it on
 * JPEGs every desktop opens; an `<img>` goes through the page decoder instead, which does not fail
 * that way and honours EXIF rotation by default.
 */
async function decode(file: Blob): Promise<Decoded> {
	try {
		const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
		return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
	} catch {
		// Falls through to the <img> below.
	}

	const url = URL.createObjectURL(file);
	const image = new Image();
	image.src = url;
	try {
		await image.decode();
	} catch {
		URL.revokeObjectURL(url);
		throw new Error('This photo could not be opened. Try saving it to your photos and choosing it from there.');
	}
	return {
		source: image,
		width: image.naturalWidth,
		height: image.naturalHeight,
		release: () => URL.revokeObjectURL(url),
	};
}

/**
 * Scales a picked photo down and re-encodes it as JPEG, in the browser. The server then only ever
 * stores one type, a phone's 5–10MB original never crosses the network, and whatever the camera
 * produced — PNG, WebP, a HEIC the browser can decode — arrives as something every browser shows.
 */
export async function prepareLabelPhoto(file: Blob): Promise<LabelPhoto> {
	const decoded = await decode(file);
	const ratio = Math.min(1, MAX_EDGE / Math.max(decoded.width, decoded.height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(decoded.width * ratio);
	canvas.height = Math.round(decoded.height * ratio);
	canvas.getContext('2d')?.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
	decoded.release();

	const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
	if (!blob) {
		throw new Error('This photo could not be prepared for upload.');
	}
	return { blob, preview: await toDataUrl(blob) };
}

/**
 * A data URL rather than an object URL: it needs no revoking, so it can sit in context across the
 * save page unmounting and remounting without an effect to manage its lifetime.
 */
function toDataUrl(blob: Blob) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('This photo could not be previewed.'));
		reader.readAsDataURL(blob);
	});
}

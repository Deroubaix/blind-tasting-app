import { requireUserId } from '../../../../lib/auth';
import { MAX_PHOTO_BYTES, ownsPhotoKey, storageDriver, writeLocalPhoto } from '../../../../lib/storage';
import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';
import { JsonApiError } from '../../../../utils/ErrorUtils';

/**
 * The local driver's stand-in for a signed bucket URL. On R2 the browser PUTs to the bucket and
 * this route does not exist.
 */
export async function PUT(request: Request) {
	try {
		if (storageDriver() !== 'local') {
			throw new JsonApiError('NotFound', 'Not found', 404);
		}

		const userId = await requireUserId();
		const key = new URL(request.url).searchParams.get('key') ?? '';
		if (!ownsPhotoKey(userId, key)) {
			throw new JsonApiError('Forbidden', 'That upload key is not yours.', 403);
		}

		const data = Buffer.from(await request.arrayBuffer());
		if (data.length === 0) {
			throw new JsonApiError('BadRequest', 'The photo was empty.', 400);
		}
		if (data.length > MAX_PHOTO_BYTES) {
			throw new JsonApiError('PayloadTooLarge', 'That photo is too large.', 413);
		}

		await writeLocalPhoto(key, data);
		return jsonResponse({ ok: true });
	} catch (error) {
		logServerError('PUT /api/photos/upload', error);
		return errorResponse(error);
	}
}

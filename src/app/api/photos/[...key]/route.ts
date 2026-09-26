import { requireUserId } from '../../../../lib/auth';
import {
	PHOTO_CONTENT_TYPE,
	ownsPhotoKey,
	photoDownloadUrl,
	photoSize,
	readLocalPhoto,
	storageDriver,
} from '../../../../lib/storage';
import { errorResponse, logServerError } from '../../../../utils/ApiUtils';
import { JsonApiError } from '../../../../utils/ErrorUtils';

/**
 * Serves a label photo to its owner only. Keys are unique per upload and never rewritten, so the
 * bytes behind one can be cached for good — but privately, since the response depends on the
 * cookie. On R2 this redirects to a signed URL, cached for a little less than the URL lives.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
	try {
		const userId = await requireUserId();
		const key = (await params).key.join('/');
		if (!ownsPhotoKey(userId, key)) {
			throw new JsonApiError('NotFound', 'Not found', 404);
		}

		if (storageDriver() === 'r2') {
			return new Response(null, {
				status: 302,
				headers: { Location: await photoDownloadUrl(key), 'Cache-Control': 'private, max-age=3000' },
			});
		}

		const size = await photoSize(key);
		if (size === null) {
			throw new JsonApiError('NotFound', 'Not found', 404);
		}

		return new Response(readLocalPhoto(key), {
			headers: {
				'Content-Type': PHOTO_CONTENT_TYPE,
				'Content-Length': String(size),
				'Cache-Control': 'private, max-age=31536000, immutable',
			},
		});
	} catch (error) {
		logServerError('GET /api/photos/[...key]', error);
		return errorResponse(error);
	}
}

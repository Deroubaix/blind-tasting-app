import { requireUserId } from '../../../../lib/auth';
import { newPhotoKey, photoUploadUrl } from '../../../../lib/storage';
import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';

/**
 * Names the key a label photo will occupy and returns the URL the browser should PUT it to. Nothing
 * is recorded here: the key only becomes part of a tasting when the tasting is saved with it, and
 * the save route checks the file actually arrived.
 */
export async function POST() {
	try {
		const userId = await requireUserId();
		const key = newPhotoKey(userId);
		return jsonResponse({ key, uploadUrl: await photoUploadUrl(key) });
	} catch (error) {
		logServerError('POST /api/photos/sign', error);
		return errorResponse(error);
	}
}

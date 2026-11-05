import { errorResponse, logServerError } from '../../../../utils/ApiUtils';
import { getLang } from '../../../../i18n/server';
import ServerServices from '../../../../services/server/ServerServices';
import PhotoService from '../../../../services/server/PhotoService';
import { requireUserId } from '../../../../lib/auth';
import { PHOTO_CONTENT_TYPE } from '../../../../lib/storage';

/** Keys never change, so the bytes cache for good, but privately: the response depends on the cookie. */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
	try {
		const userId = await requireUserId();
		const photo = await ServerServices.getClass(PhotoService).open(userId, (await params).key.join('/'));
		if ('redirect' in photo) {
			return new Response(null, {
				status: 302,
				headers: { Location: photo.redirect, 'Cache-Control': 'private, max-age=3000' },
			});
		}
		return new Response(photo.body, {
			headers: {
				'Content-Type': PHOTO_CONTENT_TYPE,
				'Content-Length': String(photo.size),
				'Cache-Control': 'private, max-age=31536000, immutable',
			},
		});
	} catch (error) {
		logServerError('GET /api/photos/[...key]', error);
		return errorResponse(error, await getLang());
	}
}

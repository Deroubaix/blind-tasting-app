import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';
import { getLang } from '../../../../i18n/server';
import ServerServices from '../../../../services/server/ServerServices';
import PhotoService from '../../../../services/server/PhotoService';
import SessionService from '../../../../services/server/SessionService';

export async function PUT(request: Request) {
	try {
		const userId = await ServerServices.getClass(SessionService).requireUserId();
		const key = new URL(request.url).searchParams.get('key') ?? '';
		await ServerServices.getClass(PhotoService).upload(userId, key, async () =>
			Buffer.from(await request.arrayBuffer()),
		);
		return jsonResponse({ ok: true });
	} catch (error) {
		logServerError('PUT /api/photos/upload', error);
		return errorResponse(error, await getLang());
	}
}

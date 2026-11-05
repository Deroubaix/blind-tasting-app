import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';
import { getLang } from '../../../../i18n/server';
import ServerServices from '../../../../services/server/ServerServices';
import PhotoService from '../../../../services/server/PhotoService';
import { requireUserId } from '../../../../lib/auth';

export async function POST() {
	try {
		const userId = await requireUserId();
		return jsonResponse(await ServerServices.getClass(PhotoService).sign(userId));
	} catch (error) {
		logServerError('POST /api/photos/sign', error);
		return errorResponse(error, await getLang());
	}
}

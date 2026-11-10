import { z } from 'zod';
import { errorResponse, jsonResponse, logServerError, readJson } from '../../../../utils/ApiUtils';
import { getLang } from '../../../../i18n/server';
import ServerServices from '../../../../services/server/ServerServices';
import PhotoService from '../../../../services/server/PhotoService';
import SessionService from '../../../../services/server/SessionService';

const signSchema = z.object({ size: z.number().int().positive() });

export async function POST(request: Request) {
	try {
		const userId = await ServerServices.getClass(SessionService).requireUserId();
		const { size } = signSchema.parse(await readJson(request));
		return jsonResponse(await ServerServices.getClass(PhotoService).sign(userId, size));
	} catch (error) {
		logServerError('POST /api/photos/sign', error);
		return errorResponse(error, await getLang());
	}
}

import { errorResponse, jsonResponse, logServerError, readJson } from '../../../../utils/ApiUtils';
import { getLang } from '../../../../i18n/server';
import ServerServices from '../../../../services/server/ServerServices';
import AuthService from '../../../../services/server/AuthService';
import { clientIp } from '../../../../utils/RateLimitUtils';
import { resetPasswordRequestSchema } from '../../../../schemas/auth';

export async function POST(request: Request) {
	try {
		const { email, token, password } = resetPasswordRequestSchema.parse(await readJson(request));
		await ServerServices.getClass(AuthService).resetPassword(email, token, password, clientIp(request));
		return jsonResponse({ ok: true });
	} catch (error) {
		logServerError('POST /api/auth/reset-password', error);
		return errorResponse(error, await getLang());
	}
}

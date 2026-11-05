import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';
import { getLang } from '../../../../i18n/server';
import ServerServices from '../../../../services/server/ServerServices';
import AuthService from '../../../../services/server/AuthService';
import { clientIp } from '../../../../lib/rateLimit';
import { forgotPasswordSchema } from '../../../../schemas/auth';

/** Always OK, whether or not the address has an account. */
export async function POST(request: Request) {
	try {
		const { email } = forgotPasswordSchema.parse(await request.json());
		await ServerServices.getClass(AuthService).requestPasswordReset(email, clientIp(request));
		return jsonResponse({ ok: true });
	} catch (error) {
		logServerError('POST /api/auth/forgot-password', error);
		return errorResponse(error, await getLang());
	}
}

import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';
import { getLang } from '../../../../i18n/server';
import ServerServices from '../../../../services/server/ServerServices';
import AuthService from '../../../../services/server/AuthService';
import { startSession } from '../../../../lib/auth';
import { clientIp } from '../../../../lib/rateLimit';
import { loginSchema } from '../../../../schemas/auth';

export async function POST(request: Request) {
	try {
		const { email, password } = loginSchema.parse(await request.json());
		const user = await ServerServices.getClass(AuthService).logIn(email, password, clientIp(request));
		await startSession(user.id);
		return jsonResponse(user);
	} catch (error) {
		logServerError('POST /api/auth/login', error);
		return errorResponse(error, await getLang());
	}
}

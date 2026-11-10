import { errorResponse, jsonResponse, logServerError, readJson } from '../../../../utils/ApiUtils';
import { getLang } from '../../../../i18n/server';
import ServerServices from '../../../../services/server/ServerServices';
import AuthService from '../../../../services/server/AuthService';
import { clientIp } from '../../../../utils/RateLimitUtils';
import { signupSchema } from '../../../../schemas/auth';

export async function POST(request: Request) {
	try {
		const input = signupSchema.parse(await readJson(request));
		const user = await ServerServices.getClass(AuthService).signUp(input, clientIp(request));
		return jsonResponse({ message: 'User created successfully', user }, 201);
	} catch (error) {
		logServerError('POST /api/auth/signup', error);
		return errorResponse(error, await getLang());
	}
}

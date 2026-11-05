import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';
import { getLang } from '../../../../i18n/server';
import ServerServices from '../../../../services/server/ServerServices';
import UserService from '../../../../services/server/UserService';
import SessionService from '../../../../services/server/SessionService';
import { deleteAccountSchema } from '../../../../schemas/auth';

/**
 * The signed-in user, or a 401. Not being signed in is the normal case on most page loads, so a
 * failure here is not logged.
 */
export async function GET() {
	try {
		const userId = await ServerServices.getClass(SessionService).requireUserId();
		return jsonResponse(await ServerServices.getClass(UserService).me(userId));
	} catch (error) {
		return errorResponse(error, await getLang());
	}
}

export async function DELETE(request: Request) {
	try {
		const userId = await ServerServices.getClass(SessionService).requireUserId();
		const { password } = deleteAccountSchema.parse(await request.json());
		await ServerServices.getClass(UserService).deleteAccount(userId, password);
		await ServerServices.getClass(SessionService).end();
		return new Response(null, { status: 204 });
	} catch (error) {
		logServerError('DELETE /api/user/me', error);
		return errorResponse(error, await getLang());
	}
}

import ServerServices from '../../../../services/server/ServerServices';
import SessionService from '../../../../services/server/SessionService';
import { jsonResponse } from '../../../../utils/ApiUtils';

/** POST, not GET: a GET that changes state can be fired by any link or image on another site. */
export async function POST() {
	await ServerServices.getClass(SessionService).end();
	return jsonResponse({ message: 'Logged out' });
}

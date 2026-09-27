import { endSession } from '../../../../lib/auth';
import { jsonResponse } from '../../../../utils/ApiUtils';

/** POST, not GET: a GET that changes state can be fired by any link or image on another site. */
export async function POST() {
	await endSession();
	return jsonResponse({ message: 'Logged out' });
}

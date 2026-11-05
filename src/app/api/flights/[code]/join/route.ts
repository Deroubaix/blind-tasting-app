import { errorResponse, jsonResponse, logServerError } from '../../../../../utils/ApiUtils';
import { getLang } from '../../../../../i18n/server';
import ServerServices from '../../../../../services/server/ServerServices';
import FlightService from '../../../../../services/server/FlightService';
import SessionService from '../../../../../services/server/SessionService';

export async function POST(_request: Request, { params }: { params: Promise<{ code: string }> }) {
	try {
		const userId = await ServerServices.getClass(SessionService).requireUserId();
		return jsonResponse({ code: await ServerServices.getClass(FlightService).join((await params).code, userId) });
	} catch (error) {
		logServerError('POST /api/flights/[code]/join', error);
		return errorResponse(error, await getLang());
	}
}

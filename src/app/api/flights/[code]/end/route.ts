import { errorResponse, jsonResponse, logServerError } from '../../../../../utils/ApiUtils';
import { getLang } from '../../../../../i18n/server';
import ServerServices from '../../../../../services/server/ServerServices';
import FlightService from '../../../../../services/server/FlightService';
import { requireUserId } from '../../../../../lib/auth';

export async function POST(_request: Request, { params }: { params: Promise<{ code: string }> }) {
	try {
		const userId = await requireUserId();
		return jsonResponse({ code: await ServerServices.getClass(FlightService).end((await params).code, userId) });
	} catch (error) {
		logServerError('POST /api/flights/[code]/end', error);
		return errorResponse(error, await getLang());
	}
}

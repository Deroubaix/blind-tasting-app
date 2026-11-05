import { errorResponse, jsonResponse, logServerError } from '../../../../../../utils/ApiUtils';
import ServerServices from '../../../../../../services/server/ServerServices';
import FlightService from '../../../../../../services/server/FlightService';
import SessionService from '../../../../../../services/server/SessionService';
import { flightRevealSchema } from '../../../../../../schemas/flight';
import { getLang } from '../../../../../../i18n/server';

type Params = { params: Promise<{ code: string; n: string }> };

export async function GET(_request: Request, { params }: Params) {
	try {
		const userId = await ServerServices.getClass(SessionService).requireUserId();
		const { code, n } = await params;
		const results = await ServerServices.getClass(FlightService).results(code, n, userId, await getLang());
		return jsonResponse({ results });
	} catch (error) {
		logServerError('GET /api/flights/[code]/wines/[n]', error);
		return errorResponse(error, await getLang());
	}
}

export async function PATCH(request: Request, { params }: Params) {
	try {
		const userId = await ServerServices.getClass(SessionService).requireUserId();
		const { code, n } = await params;
		const { reveal } = flightRevealSchema.parse(await request.json());
		return jsonResponse(await ServerServices.getClass(FlightService).reveal(code, n, userId, reveal));
	} catch (error) {
		logServerError('PATCH /api/flights/[code]/wines/[n]', error);
		return errorResponse(error, await getLang());
	}
}

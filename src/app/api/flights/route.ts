import { errorResponse, jsonResponse, logServerError } from '../../../utils/ApiUtils';
import { getLang } from '../../../i18n/server';
import ServerServices from '../../../services/server/ServerServices';
import FlightService from '../../../services/server/FlightService';
import SessionService from '../../../services/server/SessionService';
import { flightCreateSchema } from '../../../schemas/flight';

/** The flights the user hosts or has joined, newest first. */
export async function GET() {
	try {
		const userId = await ServerServices.getClass(SessionService).requireUserId();
		return jsonResponse({ flights: await ServerServices.getClass(FlightService).list(userId) });
	} catch (error) {
		logServerError('GET /api/flights', error);
		return errorResponse(error, await getLang());
	}
}

export async function POST(request: Request) {
	try {
		const userId = await ServerServices.getClass(SessionService).requireUserId();
		const input = flightCreateSchema.parse(await request.json());
		const flight = await ServerServices.getClass(FlightService).create(userId, input);
		return jsonResponse({ code: flight.code }, 201);
	} catch (error) {
		logServerError('POST /api/flights', error);
		return errorResponse(error, await getLang());
	}
}

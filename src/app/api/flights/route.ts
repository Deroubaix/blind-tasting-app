import { requireUserId } from '../../../lib/auth';
import { createFlight, listFlights } from '../../../lib/flights';
import { flightCreateSchema } from '../../../schemas/flight';
import { errorResponse, jsonResponse, logServerError } from '../../../utils/ApiUtils';

/** The flights the user hosts or has joined, newest first. */
export async function GET() {
	try {
		const userId = await requireUserId();
		return jsonResponse({ flights: await listFlights(userId) });
	} catch (error) {
		logServerError('GET /api/flights', error);
		return errorResponse(error);
	}
}

export async function POST(request: Request) {
	try {
		const userId = await requireUserId();
		const input = flightCreateSchema.parse(await request.json());
		const flight = await createFlight(userId, input);
		return jsonResponse({ code: flight.code }, 201);
	} catch (error) {
		logServerError('POST /api/flights', error);
		return errorResponse(error);
	}
}

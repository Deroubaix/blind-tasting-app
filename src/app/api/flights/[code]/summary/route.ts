import { requireUserId } from '../../../../../lib/auth';
import { flightSummary, loadFlight, requireInFlight } from '../../../../../lib/flights';
import { errorResponse, jsonResponse, logServerError } from '../../../../../utils/ApiUtils';

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
	try {
		const userId = await requireUserId();
		const flight = await loadFlight((await params).code, userId);
		requireInFlight(flight, userId);
		return jsonResponse({ summary: flightSummary(flight) });
	} catch (error) {
		logServerError('GET /api/flights/[code]/summary', error);
		return errorResponse(error);
	}
}

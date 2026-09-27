import { requireUserId } from '../../../../lib/auth';
import { flightView, loadFlight } from '../../../../lib/flights';
import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';

type Params = { params: Promise<{ code: string }> };

/** The flight as the viewer may see it: host, taster, or someone with the code who hasn't joined. */
export async function GET(_request: Request, { params }: Params) {
	try {
		const userId = await requireUserId();
		const { code } = await params;
		const flight = await loadFlight(code, userId);
		return jsonResponse({ flight: flightView(flight, userId) });
	} catch (error) {
		logServerError('GET /api/flights/[code]', error);
		return errorResponse(error);
	}
}

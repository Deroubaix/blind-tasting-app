import { errorResponse, jsonResponse, logServerError } from '../../../../../utils/ApiUtils';
import ServerServices from '../../../../../services/server/ServerServices';
import FlightService from '../../../../../services/server/FlightService';
import { requireUserId } from '../../../../../lib/auth';
import { getLang } from '../../../../../i18n/server';

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
	try {
		const userId = await requireUserId();
		const summary = await ServerServices.getClass(FlightService).summary(
			(await params).code,
			userId,
			await getLang(),
		);
		return jsonResponse({ summary });
	} catch (error) {
		logServerError('GET /api/flights/[code]/summary', error);
		return errorResponse(error, await getLang());
	}
}

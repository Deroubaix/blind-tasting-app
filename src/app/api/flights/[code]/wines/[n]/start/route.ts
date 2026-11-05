import { errorResponse, jsonResponse, logServerError } from '../../../../../../../utils/ApiUtils';
import { getLang } from '../../../../../../../i18n/server';
import ServerServices from '../../../../../../../services/server/ServerServices';
import FlightService from '../../../../../../../services/server/FlightService';
import { requireUserId } from '../../../../../../../lib/auth';

export async function POST(_request: Request, { params }: { params: Promise<{ code: string; n: string }> }) {
	try {
		const userId = await requireUserId();
		const { code, n } = await params;
		return jsonResponse(await ServerServices.getClass(FlightService).startWine(code, n, userId));
	} catch (error) {
		logServerError('POST /api/flights/[code]/wines/[n]/start', error);
		return errorResponse(error, await getLang());
	}
}

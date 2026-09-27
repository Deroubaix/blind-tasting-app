import { prisma } from '../../../../../lib/prisma';
import { requireUserId } from '../../../../../lib/auth';
import { loadFlight, requireHost } from '../../../../../lib/flights';
import { errorResponse, jsonResponse, logServerError } from '../../../../../utils/ApiUtils';

/** Closes the flight to new joins and new wines. Results stay readable. */
export async function POST(_request: Request, { params }: { params: Promise<{ code: string }> }) {
	try {
		const userId = await requireUserId();
		const flight = await loadFlight((await params).code, userId);
		requireHost(flight, userId);
		await prisma.flight.update({ where: { id: flight.id }, data: { endedAt: flight.endedAt ?? new Date() } });
		return jsonResponse({ code: flight.code });
	} catch (error) {
		logServerError('POST /api/flights/[code]/end', error);
		return errorResponse(error);
	}
}

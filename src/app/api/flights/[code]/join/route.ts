import { prisma } from '../../../../../lib/prisma';
import { requireUserId } from '../../../../../lib/auth';
import { loadFlight } from '../../../../../lib/flights';
import { JsonApiError } from '../../../../../utils/ErrorUtils';
import { errorResponse, jsonResponse, logServerError } from '../../../../../utils/ApiUtils';

export async function POST(_request: Request, { params }: { params: Promise<{ code: string }> }) {
	try {
		const userId = await requireUserId();
		const flight = await loadFlight((await params).code, userId);
		if (flight.hostId === userId) {
			throw new JsonApiError('Conflict', 'You are hosting this flight, so you pour rather than taste.', 409);
		}
		if (flight.endedAt) {
			throw new JsonApiError('Conflict', 'This flight has ended.', 409);
		}
		await prisma.flightMember.upsert({
			where: { flightId_userId: { flightId: flight.id, userId } },
			create: { flightId: flight.id, userId },
			update: {},
		});
		return jsonResponse({ code: flight.code });
	} catch (error) {
		logServerError('POST /api/flights/[code]/join', error);
		return errorResponse(error);
	}
}

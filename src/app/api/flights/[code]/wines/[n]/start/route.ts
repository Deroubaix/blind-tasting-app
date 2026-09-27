import { prisma } from '../../../../../../../lib/prisma';
import { requireUserId } from '../../../../../../../lib/auth';
import { loadFlight } from '../../../../../../../lib/flights';
import { JsonApiError } from '../../../../../../../utils/ErrorUtils';
import { errorResponse, jsonResponse, logServerError } from '../../../../../../../utils/ApiUtils';

/**
 * A taster opens a wine. The clock is stamped here, once, so reopening the wine (or reloading the
 * page) carries on the same clock rather than starting a new one.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ code: string; n: string }> }) {
	try {
		const userId = await requireUserId();
		const { code, n } = await params;
		const flight = await loadFlight(code, userId);
		if (!flight.members.some((member) => member.userId === userId)) {
			throw new JsonApiError('Forbidden', 'Join the flight to taste its wines.', 403);
		}
		const number = Number(n);
		const wine = flight.wines.find((w) => w.number === number);
		if (!wine) {
			throw new JsonApiError('NotFound', 'This flight has no such wine.', 404);
		}
		if (wine.revealedAt) {
			throw new JsonApiError('Conflict', `Wine ${number} has already been revealed.`, 409);
		}
		if (flight.endedAt) {
			throw new JsonApiError('Conflict', 'This flight has ended.', 409);
		}

		const entry = await prisma.flightEntry.upsert({
			where: { flightId_userId_wineNumber: { flightId: flight.id, userId, wineNumber: number } },
			create: { flightId: flight.id, userId, wineNumber: number },
			update: {},
		});
		if (entry.tastingId) {
			throw new JsonApiError('Conflict', `You have already submitted wine ${number}.`, 409);
		}
		const endsAt = flight.timerSeconds ? entry.startedAt.getTime() + flight.timerSeconds * 1000 : null;
		return jsonResponse({ startedAt: entry.startedAt.toISOString(), endsAt });
	} catch (error) {
		logServerError('POST /api/flights/[code]/wines/[n]/start', error);
		return errorResponse(error);
	}
}

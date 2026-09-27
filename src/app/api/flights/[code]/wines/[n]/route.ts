import { Prisma } from '@prisma/client';
import { prisma } from '../../../../../../lib/prisma';
import { requireUserId } from '../../../../../../lib/auth';
import { loadFlight, requireHost, requireInFlight, wineResults } from '../../../../../../lib/flights';
import { revealFields } from '../../../../../../lib/reveal';
import { flightRevealSchema } from '../../../../../../schemas/flight';
import { JsonApiError } from '../../../../../../utils/ErrorUtils';
import { errorResponse, jsonResponse, logServerError } from '../../../../../../utils/ApiUtils';

type Params = { params: Promise<{ code: string; n: string }> };

function wineNumber(n: string, wineCount: number) {
	const number = Number(n);
	if (!Number.isInteger(number) || number < 1 || number > wineCount) {
		throw new JsonApiError('NotFound', 'This flight has no such wine.', 404);
	}
	return number;
}

/** A revealed wine's results: everyone's call against the label, and their palate. */
export async function GET(_request: Request, { params }: Params) {
	try {
		const userId = await requireUserId();
		const { code, n } = await params;
		const flight = await loadFlight(code, userId);
		requireInFlight(flight, userId);
		return jsonResponse({ results: wineResults(flight, wineNumber(n, flight.wineCount), userId) });
	} catch (error) {
		logServerError('GET /api/flights/[code]/wines/[n]', error);
		return errorResponse(error);
	}
}

/**
 * The host reveals (or corrects) a wine. The reveal is copied onto every submitted tasting, so each
 * taster's archive scores it too. Anyone still tasting is closed out as not submitted.
 */
export async function PATCH(request: Request, { params }: Params) {
	try {
		const userId = await requireUserId();
		const { code, n } = await params;
		const flight = await loadFlight(code, userId);
		requireHost(flight, userId);
		const number = wineNumber(n, flight.wineCount);
		const { reveal } = flightRevealSchema.parse(await request.json());

		const fields = revealFields(reveal);
		if (fields.reveal === Prisma.DbNull) {
			throw new JsonApiError('BadRequest', 'Fill in at least one field from the label.', 400);
		}
		const submitted = flight.entries.filter((entry) => entry.wineNumber === number && entry.tastingId);
		if (!submitted.length) {
			throw new JsonApiError('Conflict', 'Wait until at least one taster has submitted this wine.', 409);
		}

		await prisma.$transaction([
			prisma.flightWine.update({ where: { flightId_number: { flightId: flight.id, number } }, data: fields }),
			// By relation, not the ids loaded above, so a tasting linked meanwhile gets it too.
			prisma.tasting.updateMany({
				where: { flightEntry: { is: { flightId: flight.id, wineNumber: number } } },
				data: fields,
			}),
		]);
		return jsonResponse({ code: flight.code, number });
	} catch (error) {
		logServerError('PATCH /api/flights/[code]/wines/[n]', error);
		return errorResponse(error);
	}
}

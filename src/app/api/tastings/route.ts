import { Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { JsonApiError } from '../../../utils/ErrorUtils';
import { errorResponse, jsonResponse, logServerError } from '../../../utils/ApiUtils';
import { requireUserId } from '../../../lib/auth';
import { tastingCreateSchema } from '../../../schemas/tasting';
import { revealFields } from '../../../lib/reveal';
import { normaliseCode } from '../../../components/flights/flightLogic';
import { RATE_LIMITS, check, consume } from '../../../lib/rateLimit';
import { TASTING_FLIGHT_INCLUDE, withFlight } from '../../../lib/flights';
import { MAX_PHOTO_BYTES, ownsPhotoKey, photoSize } from '../../../lib/storage';

/** Postgres unique-constraint violation. */
const UNIQUE_VIOLATION = 'P2002';

/**
 * Creates a tasting numbered sequentially within the user's own account, so every account starts
 * at "No. 1". The read of the current maximum and the insert can interleave with a concurrent
 * request, so the @@unique([userId, number]) constraint is the real guard: a collision surfaces as
 * P2002 and we retry with the next number rather than silently writing a duplicate.
 */
async function createWithNextNumber(userId: string, data: Omit<Prisma.TastingUncheckedCreateInput, 'number'>) {
	const MAX_ATTEMPTS = 5;

	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
		const last = await prisma.tasting.findFirst({
			where: { userId },
			orderBy: { number: 'desc' },
			select: { number: true },
		});

		try {
			return await prisma.tasting.create({
				data: { ...data, number: (last?.number ?? 0) + 1 },
			});
		} catch (error) {
			const isCollision =
				error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_VIOLATION;

			if (!isCollision) {
				throw error;
			}
		}
	}

	throw new Error('Could not allocate a tasting number after repeated collisions');
}

/**
 * The label photo is uploaded before the tasting exists, so the key arrives from the browser and is
 * taken on trust for nothing: it must be one this user was issued, and the file must be in storage
 * at a size the upload would have allowed. The size is read back rather than believed, because on R2
 * the browser PUTs to the bucket directly and nothing of ours saw the bytes.
 */
async function verifiedPhotoKey(userId: string, photoKey: string | null | undefined) {
	if (!photoKey) {
		return null;
	}
	if (!ownsPhotoKey(userId, photoKey)) {
		throw new JsonApiError('BadRequest', 'That photo does not belong to this account.', 400);
	}
	const size = await photoSize(photoKey);
	if (size === null) {
		throw new JsonApiError('BadRequest', 'The photo upload did not finish. Please try again.', 400);
	}
	if (size > MAX_PHOTO_BYTES) {
		throw new JsonApiError('PayloadTooLarge', 'That photo is too large.', 413);
	}
	return photoKey;
}

export async function GET() {
	try {
		const userId = await requireUserId();
		const tastings = await prisma.tasting.findMany({
			where: { userId },
			orderBy: { number: 'desc' },
			include: TASTING_FLIGHT_INCLUDE,
		});

		return jsonResponse({ tastings: tastings.map(withFlight) });
	} catch (error) {
		logServerError('GET /api/tastings', error);
		return errorResponse(error);
	}
}

/** The taster's entry for a flight wine, checked; `reveal` is set when the host got there first. */
async function flightEntryFor(userId: string, { code, wineNumber }: { code: string; wineNumber: number }) {
	await check(RATE_LIMITS.flightCode, userId);
	const flight = await prisma.flight.findUnique({
		where: { code: normaliseCode(code) },
		include: { members: { where: { userId } }, wines: { where: { number: wineNumber } } },
	});
	if (!flight) {
		await consume(RATE_LIMITS.flightCode, userId);
	}
	if (!flight || !flight.members.length || !flight.wines.length) {
		throw new JsonApiError('BadRequest', 'That flight wine could not be found.', 400);
	}
	const where = { flightId_userId_wineNumber: { flightId: flight.id, userId, wineNumber } };
	const entry = await prisma.flightEntry.findUnique({ where });
	if (!entry) {
		throw new JsonApiError('Conflict', `Open wine ${wineNumber} from the flight before submitting it.`, 409);
	}
	if (entry.tastingId) {
		throw new JsonApiError('Conflict', `You have already submitted wine ${wineNumber}.`, 409);
	}
	const reveal = flight.wines[0].revealedAt ? (flight.wines[0].reveal as Prisma.InputJsonValue) : null;
	return { where, reveal };
}

export async function POST(request: Request) {
	try {
		const userId = await requireUserId();
		// A ZodError here becomes a 400 naming the first bad field (see errorResponse).
		const body = tastingCreateSchema.parse(await request.json());
		const timed = body.timerEnabled === true && body.timerSeconds != null;

		const data = {
			userId,
			wineType: body.wineType,
			timerEnabled: timed,
			timerSeconds: timed ? body.timerSeconds : null,
			timerMode: timed ? (body.timerMode ?? 'guided') : null,
			notes: body.notes || null,
			confirmNose: body.confirmNose || null,
			sight: body.sight ?? Prisma.DbNull,
			nose: body.nose ?? Prisma.DbNull,
			palate: body.palate ?? Prisma.DbNull,
			conclusion: body.conclusion ?? Prisma.DbNull,
			wineName: body.wineName || null,
			photoKey: await verifiedPhotoKey(userId, body.photoKey),
			...revealFields(body.reveal),
		};

		const flight = body.flight ? await flightEntryFor(userId, body.flight) : null;
		// Revealed before this arrived: saved to the archive with the host's reveal, but not in the results.
		const late = flight?.reveal ?? null;
		const tasting = await createWithNextNumber(
			userId,
			late ? { ...data, reveal: late, revealedAt: new Date() } : data,
		);
		if (flight && !late) {
			await prisma.flightEntry.update({ where: flight.where, data: { tastingId: tasting.id } });
			// Revealed between the check and the link: copy the reveal on, as the reveal would have.
			const { flightId, wineNumber } = flight.where.flightId_userId_wineNumber;
			const wine = await prisma.flightWine.findUnique({
				where: { flightId_number: { flightId, number: wineNumber } },
			});
			if (wine?.revealedAt) {
				await prisma.tasting.update({
					where: { id: tasting.id },
					data: { reveal: wine.reveal as Prisma.InputJsonValue, revealedAt: wine.revealedAt },
				});
			}
		}

		return jsonResponse({ message: 'Tasting saved', tasting, flightLate: Boolean(late) }, 201);
	} catch (error) {
		logServerError('POST /api/tastings', error);
		return errorResponse(error);
	}
}

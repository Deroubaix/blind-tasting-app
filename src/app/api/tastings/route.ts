import { Prisma, PrismaClient } from '@prisma/client';
import { JsonApiError } from '../../../utils/ErrorUtils';
import { errorResponse, logServerError } from '../../../utils/ApiUtils';
import { requireUserId } from '../../../lib/auth';
import { tastingCreateSchema } from '../../../schemas/tasting';
import { MAX_PHOTO_BYTES, ownsPhotoKey, photoSize } from '../../../lib/storage';

const prisma = new PrismaClient();

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
		});

		return new Response(JSON.stringify({ tastings }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		logServerError('GET /api/tastings', error);
		return errorResponse(error);
	}
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
		};

		const tasting = await createWithNextNumber(userId, data);

		return new Response(JSON.stringify({ message: 'Tasting saved', tasting }), {
			status: 201,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		logServerError('POST /api/tastings', error);
		return errorResponse(error);
	}
}

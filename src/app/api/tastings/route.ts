import { Prisma, PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { JsonApiError } from '../../../utils/ErrorUtils';
import { errorResponse, logServerError } from '../../../utils/ApiUtils';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET!;

async function getUserIdFromToken() {
	const cookieStore = await cookies();
	const token = cookieStore.get('auth-token')?.value;

	if (!token) {
		throw new JsonApiError('Unauthorized', 'Access denied: no token provided', 401);
	}

	const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };

	return decoded.userId;
}

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

export async function GET() {
	try {
		const userId = await getUserIdFromToken();
		const tastings = await prisma.tasting.findMany({
			where: { userId },
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
		const userId = await getUserIdFromToken();
		const body = await request.json();

		if (!body.wineType) {
			return new Response(JSON.stringify({ error: 'Wine type is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const data = {
			userId,
			wineType: body.wineType,
			timerEnabled: body.timerEnabled ?? false,
			timerDuration: body.timerDuration ?? null,
			isArchived: false,
			notes: body.notes ?? null,
			sight: body.sight ?? null,
			nose: body.nose ?? null,
			palate: body.palate ?? null,
			conclusion: body.conclusion ?? null,
			wineName: body.wineName ?? null,
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

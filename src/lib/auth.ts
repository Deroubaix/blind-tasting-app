import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { JsonApiError } from '../utils/ErrorUtils';

const prisma = new PrismaClient();

/**
 * The signed-in user's id, or a 401. An expired or forged token is a 401 too — `jwt.verify` throws
 * a plain Error for those, which `errorResponse` would otherwise report as a 500.
 *
 * A valid token is not enough on its own: it outlives the account it names, so a deleted user's
 * cookie would pass and then fail the Tasting foreign key as a 500. Checking the row turns that
 * into the same 401, which the client already answers by sending the taster to log in.
 */
export async function requireUserId() {
	const token = (await cookies()).get('auth-token')?.value;
	if (!token) {
		throw new JsonApiError('Unauthorized', 'Access denied: no token provided', 401);
	}

	let userId: string;
	try {
		userId = (jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }).userId;
	} catch {
		throw new JsonApiError('Unauthorized', 'Your session has expired. Please log in again.', 401);
	}

	const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
	if (!user) {
		throw new JsonApiError('Unauthorized', 'Your account could not be found. Please log in again.', 401);
	}
	return userId;
}

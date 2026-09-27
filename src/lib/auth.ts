import { prisma } from './prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { JsonApiError } from '../utils/ErrorUtils';

/**
 * Everything about the session lives here — the cookie's name and attributes, the signing
 * secret, how long it lasts — so logging in, logging out and checking a request cannot drift
 * apart. They had: the logout cookie lacked `Secure`, `/api/user/me` answered an expired token
 * with 403 where every other route said 401, and a dead route read a cookie that never existed.
 */
const AUTH_COOKIE = 'auth-token';
const SESSION_SECONDS = 60 * 60;

function secret() {
	const value = process.env.JWT_SECRET;
	if (!value) {
		throw new Error('JWT_SECRET is not set; see .env.example.');
	}
	return value;
}

const cookieAttributes = {
	httpOnly: true,
	secure: true,
	sameSite: 'strict' as const,
	path: '/',
};

/** Signs the user in: issues the token and sets it as the session cookie on this response. */
export async function startSession(userId: string) {
	const token = jwt.sign({ userId }, secret(), { expiresIn: SESSION_SECONDS });
	(await cookies()).set(AUTH_COOKIE, token, { ...cookieAttributes, maxAge: SESSION_SECONDS });
}

/** Signs the user out by expiring the cookie, with the same attributes it was set with. */
export async function endSession() {
	(await cookies()).set(AUTH_COOKIE, '', { ...cookieAttributes, maxAge: 0 });
}

/**
 * The signed-in user's id, or a 401. An expired or forged token is a 401 too — `jwt.verify` throws
 * a plain Error for those, which `errorResponse` would otherwise report as a 500.
 *
 * A valid token is not enough on its own: it outlives the account it names, so a deleted user's
 * cookie would pass and then fail the Tasting foreign key as a 500. Checking the row turns that
 * into the same 401, which the client already answers by sending the taster to log in.
 */
export async function requireUserId() {
	const token = (await cookies()).get(AUTH_COOKIE)?.value;
	if (!token) {
		throw new JsonApiError('Unauthorized', 'Access denied: no token provided', 401);
	}

	let userId: string;
	try {
		userId = (jwt.verify(token, secret()) as { userId: string }).userId;
	} catch {
		throw new JsonApiError('Unauthorized', 'Your session has expired. Please log in again.', 401);
	}

	const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
	if (!user) {
		throw new JsonApiError('Unauthorized', 'Your account could not be found. Please log in again.', 401);
	}
	return userId;
}

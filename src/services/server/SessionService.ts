import { type PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import ServerConfig from '../../config/ServerConfig';
import { apiError } from '../../utils/ApiUtils';
import { JsonApiError } from '../../utils/ErrorUtils';

const AUTH_COOKIE = 'auth-token';
const SESSION_SECONDS = 60 * 60;

const cookieAttributes = {
	httpOnly: true,
	secure: true,
	sameSite: 'strict' as const,
	path: '/',
};

/** The session cookie, in one place so logging in, logging out and checking a request can't drift apart. */
export default class SessionService {
	constructor(private readonly _prisma: PrismaClient) {}

	/** Signs the user in: issues the token and sets it as the session cookie on this response. */
	public async start(userId: string) {
		const token = jwt.sign({ userId }, ServerConfig.getJwtSecret(), { expiresIn: SESSION_SECONDS });
		(await cookies()).set(AUTH_COOKIE, token, { ...cookieAttributes, maxAge: SESSION_SECONDS });
	}

	/** Signs the user out by expiring the cookie, with the same attributes it was set with. */
	public async end() {
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
	public async requireUserId() {
		const token = (await cookies()).get(AUTH_COOKIE)?.value;
		if (!token) {
			throw apiError(401, 'notSignedIn');
		}

		let userId: string;
		try {
			userId = (jwt.verify(token, ServerConfig.getJwtSecret()) as { userId: string }).userId;
		} catch {
			throw apiError(401, 'sessionExpired');
		}

		const user = await this._prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
		if (!user) {
			throw apiError(401, 'accountMissing');
		}
		return userId;
	}

	/** For server pages: the signed-in user's id, or null where a route would answer 401. */
	public async currentUserId() {
		try {
			return await this.requireUserId();
		} catch (error) {
			if (error instanceof JsonApiError && error.statusCode === 401) {
				return null;
			}
			throw error;
		}
	}
}

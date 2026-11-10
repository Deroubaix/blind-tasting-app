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

	/** Signs the user in: records the session, then sets its token as the cookie on this response. */
	public async start(userId: string) {
		const session = await this._prisma.session.create({
			data: { userId, expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000) },
		});
		const token = jwt.sign({ userId, sid: session.id }, ServerConfig.getJwtSecret(), {
			algorithm: 'HS256',
			expiresIn: SESSION_SECONDS,
		});
		(await cookies()).set(AUTH_COOKIE, token, { ...cookieAttributes, maxAge: SESSION_SECONDS });
		this.sweepOccasionally();
	}

	/** Signs this browser out: ends its session, so a copied token stops working too, and expires the cookie. */
	public async end() {
		const claims = await this.claims().catch(() => null);
		if (claims) {
			await this._prisma.session.deleteMany({ where: { id: claims.sid } });
		}
		(await cookies()).set(AUTH_COOKIE, '', { ...cookieAttributes, maxAge: 0 });
	}

	/** Every browser the user is signed in on, e.g. after a password reset. */
	public async endAll(userId: string) {
		await this._prisma.session.deleteMany({ where: { userId } });
	}

	/**
	 * The signed-in user's id, or a 401. An expired or forged token is a 401 too — `jwt.verify` throws
	 * a plain Error for those, which `errorResponse` would otherwise report as a 500.
	 *
	 * A valid token is not enough on its own: it outlives logging out, a password reset and the
	 * account it names. Checking its session row turns each of those into the same 401, which the
	 * client already answers by sending the taster to log in.
	 */
	public async requireUserId() {
		const { userId, sid } = await this.claims();
		// The session row goes with logging out, a password reset and the account itself.
		const session = await this._prisma.session.findUnique({ where: { id: sid }, select: { userId: true } });
		if (!session || session.userId !== userId) {
			throw apiError(401, 'sessionExpired');
		}
		return userId;
	}

	/** The cookie's verified claims. Tokens from before sessions were recorded have no `sid`: signed out. */
	private async claims(): Promise<{ userId: string; sid: string }> {
		const token = (await cookies()).get(AUTH_COOKIE)?.value;
		if (!token) {
			throw apiError(401, 'notSignedIn');
		}
		let claims: { userId?: unknown; sid?: unknown };
		try {
			claims = jwt.verify(token, ServerConfig.getJwtSecret(), { algorithms: ['HS256'] }) as typeof claims;
		} catch {
			throw apiError(401, 'sessionExpired');
		}
		if (typeof claims.userId !== 'string' || typeof claims.sid !== 'string') {
			throw apiError(401, 'sessionExpired');
		}
		return { userId: claims.userId, sid: claims.sid };
	}

	/** Drops expired sessions on about one sign-in in fifty, so the table stays small. */
	private sweepOccasionally() {
		if (Math.random() < 0.02) {
			this._prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => undefined);
		}
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

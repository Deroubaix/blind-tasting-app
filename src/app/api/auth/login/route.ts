import { prisma } from '../../../../lib/prisma';
import { verifyPassword } from '../../../../utils/PasswordUtils';
import { JsonApiError } from '../../../../utils/ErrorUtils';
import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';
import { startSession } from '../../../../lib/auth';
import { loginSchema } from '../../../../schemas/auth';
import { RATE_LIMITS, check, clientIp, consume, reset } from '../../../../lib/rateLimit';

export async function POST(request: Request) {
	try {
		const { email, password } = loginSchema.parse(await request.json());

		// Every attempt from this address counts; only wrong passwords count against the account,
		// and an account already at its limit is refused before the password is even checked.
		await consume(RATE_LIMITS.loginIp, clientIp(request));
		await check(RATE_LIMITS.loginEmail, email);

		const user = await prisma.user.findUnique({ where: { email } });
		const isPasswordValid = user ? await verifyPassword(password, user.password) : false;
		if (!user || !isPasswordValid) {
			// Counted for unknown emails too, so the limit gives away nothing about which exist.
			await consume(RATE_LIMITS.loginEmail, email).catch(() => undefined);
			throw new JsonApiError('Unauthorized', 'Invalid email or password', 401);
		}

		await reset(RATE_LIMITS.loginEmail, email);

		await startSession(user.id);

		// Mirrors AuthenticatedUser — the password and reset-token columns never leave the server.
		return jsonResponse({
			id: user.id,
			email: user.email,
			displayName: user.displayName,
			created_at: user.created_at,
		});
	} catch (error) {
		logServerError('login', error);
		return errorResponse(error);
	}
}

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { type PrismaClient } from '@prisma/client';
import ServerConfig from '../../config/ServerConfig';
import type { Resend } from 'resend';
import { RATE_LIMITS } from '../../utils/RateLimitUtils';
import { type AuthenticatedUser } from '../IAuthService';
import { ApiError, apiError, logServerError } from '../../utils/ApiUtils';
import { hashPassword, verifyPassword } from '../../utils/PasswordUtils';
import type RateLimitService from './RateLimitService';

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

// Checked against for unknown emails, so they take as long to refuse as a wrong password does.
const DUMMY_HASH = `${'0'.repeat(32)}:${'0'.repeat(128)}`;

const hashToken = (raw: string) => createHash('sha256').update(raw).digest('hex');

/** 401 rather than 400: the client keys off this status to offer a fresh reset link. */
const invalidLinkError = () => apiError(401, 'resetLinkInvalid');

/** Accounts and credentials. The session cookie itself is SessionService's, set by the route. */
export default class AuthService {
	constructor(
		private readonly _prisma: PrismaClient,
		private readonly _rateLimits: RateLimitService,
		// Built on first send: Resend throws without an API key, which shouldn't stop log-ins.
		private readonly _resend: () => Resend,
	) {}

	public async signUp(input: { email: string; password: string; displayName: string }, ip: string) {
		await this._rateLimits.consume(RATE_LIMITS.signupIp, ip);

		const existingUser = await this._prisma.user.findUnique({ where: { email: input.email } });
		if (existingUser) {
			throw new ApiError(400, 'userExists', [], 'UserExists');
		}

		const user = await this._prisma.user.create({
			data: { email: input.email, password: await hashPassword(input.password), displayName: input.displayName },
		});
		return { id: user.id, email: user.email, name: user.displayName };
	}

	/**
	 * The user, or a 401. Only wrong passwords count against the account, so the limit gives nothing away.
	 * The tight limit is per account and address, so someone guessing elsewhere doesn't lock the owner out.
	 */
	public async logIn(email: string, password: string, ip: string): Promise<AuthenticatedUser> {
		const fromHere = `${email}|${ip}`;
		await this._rateLimits.consume(RATE_LIMITS.loginIp, ip);
		await this._rateLimits.check(RATE_LIMITS.loginEmail, fromHere);
		await this._rateLimits.check(RATE_LIMITS.loginAccount, email);

		const user = await this._prisma.user.findUnique({ where: { email } });
		const isPasswordValid = (await verifyPassword(password, user?.password ?? DUMMY_HASH)) && !!user;
		if (!user || !isPasswordValid) {
			// Counted for unknown emails too, so the limit gives away nothing about which exist.
			await this._rateLimits.consume(RATE_LIMITS.loginEmail, fromHere).catch(() => undefined);
			await this._rateLimits.consume(RATE_LIMITS.loginAccount, email).catch(() => undefined);
			throw apiError(401, 'invalidCredentials');
		}

		await this._rateLimits.reset(RATE_LIMITS.loginEmail, fromHere);

		// The password and reset-token columns never leave the server.
		return { id: user.id, email: user.email, displayName: user.displayName, created_at: user.created_at };
	}

	/** Emails a reset link if the account exists. Says nothing either way, so it can't enumerate accounts. */
	public async requestPasswordReset(email: string, ip: string) {
		// Before the user lookup, so the limit behaves the same for addresses with no account.
		await this._rateLimits.consume(RATE_LIMITS.forgotIp, ip);
		await this._rateLimits.consume(RATE_LIMITS.forgotEmail, email);

		const user = await this._prisma.user.findUnique({ where: { email } });
		if (!user) {
			return;
		}

		const rawToken = randomBytes(32).toString('hex');
		await this._prisma.user.update({
			where: { email },
			data: { resetToken: hashToken(rawToken), resetTokenExpiry: new Date(Date.now() + TOKEN_EXPIRY_MS) },
		});

		const resetUrl = `${ServerConfig.getAppUrl()}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

		const deliverTo = ServerConfig.getResendTestEmail() ?? email;

		try {
			const sendResult = await this._resend().emails.send({
				from: "The Sommelier's Ledger <onboarding@resend.dev>",
				to: deliverTo,
				subject: 'Reset your password',
				html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; padding: 40px 32px; border-radius: 8px;">
          <p style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #8B4557; margin: 0 0 24px;">The Sommelier's Ledger</p>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #1a1a1a; margin: 0 0 12px; letter-spacing: -0.02em;">Reset your password</h2>
          <p style="color: #555; line-height: 1.6; margin: 0 0 32px;">
            Someone requested a password reset for your account. If that was you, click the button below. The link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #8B4557; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 0.95rem;">
            Reset password
          </a>
          <p style="font-size: 0.78rem; color: #999; margin: 32px 0 0; line-height: 1.6;">
            If you didn't request this, you can safely ignore this email — your password won't change.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0 0;" />
          <p style="font-size: 0.7rem; color: #bbb; margin: 16px 0 0;">The Sommelier's Ledger · sent via resend</p>
        </div>
      `,
			});

			process.stderr.write(`Resend result: ${JSON.stringify(sendResult)}\n`);
		} catch (sendError) {
			// Swallow delivery failures: an error only for addresses that exist would turn this into
			// an account-enumeration oracle.
			logServerError('forgot-password (email delivery)', sendError);
		}
	}

	public async resetPassword(email: string, token: string, password: string, ip: string) {
		await this._rateLimits.consume(RATE_LIMITS.resetIp, ip);

		const user = await this._prisma.user.findUnique({ where: { email } });
		if (!user || !user.resetToken || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
			throw invalidLinkError();
		}

		const provided = Buffer.from(hashToken(token), 'hex');
		const stored = Buffer.from(user.resetToken, 'hex');
		if (provided.length !== stored.length || !timingSafeEqual(provided, stored)) {
			throw invalidLinkError();
		}

		await this._prisma.user.update({
			where: { email },
			data: { password: await hashPassword(password), resetToken: null, resetTokenExpiry: null },
		});
	}
}

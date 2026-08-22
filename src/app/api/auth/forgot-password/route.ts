import { PrismaClient } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';
import { Resend } from 'resend';
import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';
import { forgotPasswordSchema } from '../../../../schemas/auth';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function hashToken(raw: string): string {
	return createHash('sha256').update(raw).digest('hex');
}

export async function POST(request: Request) {
	try {
		const { email } = forgotPasswordSchema.parse(await request.json());

		const user = await prisma.user.findUnique({ where: { email } });

		// Always respond OK — don't reveal whether the email exists
		if (!user) {
			return jsonResponse({ ok: true });
		}

		const rawToken = randomBytes(32).toString('hex');
		const tokenHash = hashToken(rawToken);
		const expiry = new Date(Date.now() + TOKEN_EXPIRY_MS);

		await prisma.user.update({
			where: { email },
			data: { resetToken: tokenHash, resetTokenExpiry: expiry },
		});

		const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
		const resetUrl = `${appUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

		const deliverTo = process.env.RESEND_TEST_EMAIL ?? email;

		try {
			const sendResult = await resend.emails.send({
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
			// Swallow delivery failures: surfacing a 500 only for addresses that exist would turn
			// this endpoint into an account-enumeration oracle.
			logServerError('forgot-password (email delivery)', sendError);
		}

		return jsonResponse({ ok: true });
	} catch (error) {
		logServerError('forgot-password', error);
		return errorResponse(error);
	}
}

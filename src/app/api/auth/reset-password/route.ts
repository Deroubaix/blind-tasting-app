import { PrismaClient } from '@prisma/client';
import { createHash, timingSafeEqual } from 'crypto';
import { hashPassword } from '../../../../utils/PasswordUtils';
import { JsonApiError } from '../../../../utils/ErrorUtils';
import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';
import { resetPasswordRequestSchema } from '../../../../schemas/auth';

const prisma = new PrismaClient();

function hashToken(raw: string): string {
	return createHash('sha256').update(raw).digest('hex');
}

/** 401 rather than 400: the client keys off this status to offer a fresh reset link. */
function invalidLinkError() {
	return new JsonApiError('Unauthorized', 'This reset link is invalid or has expired.', 401);
}

export async function POST(request: Request) {
	try {
		const { email, token, password } = resetPasswordRequestSchema.parse(await request.json());

		const user = await prisma.user.findUnique({ where: { email } });

		if (!user || !user.resetToken || !user.resetTokenExpiry) {
			throw invalidLinkError();
		}

		if (new Date() > user.resetTokenExpiry) {
			throw invalidLinkError();
		}

		const provided = Buffer.from(hashToken(token), 'hex');
		const stored = Buffer.from(user.resetToken, 'hex');

		if (provided.length !== stored.length || !timingSafeEqual(provided, stored)) {
			throw invalidLinkError();
		}

		const hashedPassword = await hashPassword(password);

		await prisma.user.update({
			where: { email },
			data: {
				password: hashedPassword,
				resetToken: null,
				resetTokenExpiry: null,
			},
		});

		return jsonResponse({ ok: true });
	} catch (error) {
		logServerError('reset-password', error);
		return errorResponse(error);
	}
}

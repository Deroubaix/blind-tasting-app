import { prisma } from '../../../../lib/prisma';
import { endSession, requireUserId } from '../../../../lib/auth';
import { deleteUserPhotos } from '../../../../lib/storage';
import { RATE_LIMITS, check, consume } from '../../../../lib/rateLimit';
import { deleteAccountSchema } from '../../../../schemas/auth';
import { verifyPassword } from '../../../../utils/PasswordUtils';
import { JsonApiError } from '../../../../utils/ErrorUtils';
import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';

/**
 * The signed-in user, or a 401. Not being signed in is the normal case on most page loads, so a
 * failure here is not logged.
 */
export async function GET() {
	try {
		const userId = await requireUserId();
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, displayName: true, created_at: true },
		});
		return jsonResponse(user);
	} catch (error) {
		return errorResponse(error);
	}
}

/** Deletes the account, every tasting and every photo, after checking the password. */
export async function DELETE(request: Request) {
	try {
		const userId = await requireUserId();
		const { password } = deleteAccountSchema.parse(await request.json());

		await check(RATE_LIMITS.deleteAccount, userId);
		const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { password: true } });
		if (!(await verifyPassword(password, user.password))) {
			await consume(RATE_LIMITS.deleteAccount, userId).catch(() => undefined);
			throw new JsonApiError('Unauthorized', 'That password is not right.', 403);
		}

		await prisma.$transaction([
			prisma.tasting.deleteMany({ where: { userId } }),
			prisma.user.delete({ where: { id: userId } }),
		]);

		// After the rows: a failure here leaves unreachable files, never an account half-deleted.
		await deleteUserPhotos(userId).catch((error) => logServerError('DELETE /api/user/me (photos)', error));

		await endSession();
		return new Response(null, { status: 204 });
	} catch (error) {
		logServerError('DELETE /api/user/me', error);
		return errorResponse(error);
	}
}

import { type PrismaClient } from '@prisma/client';
import { RATE_LIMITS, check, consume } from '../../lib/rateLimit';
import { apiError } from '../../utils/ApiUtils';
import { verifyPassword } from '../../utils/PasswordUtils';
import type PhotoService from './PhotoService';

export default class UserService {
	constructor(
		private readonly _prisma: PrismaClient,
		private readonly _photos: PhotoService,
	) {}

	public me(userId: string) {
		return this._prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, displayName: true, created_at: true },
		});
	}

	/** Deletes the account, every tasting and every photo, after checking the password. */
	public async deleteAccount(userId: string, password: string) {
		await check(RATE_LIMITS.deleteAccount, userId);
		const user = await this._prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { password: true } });
		if (!(await verifyPassword(password, user.password))) {
			await consume(RATE_LIMITS.deleteAccount, userId).catch(() => undefined);
			throw apiError(403, 'wrongPassword');
		}

		await this._prisma.$transaction([
			this._prisma.tasting.deleteMany({ where: { userId } }),
			this._prisma.user.delete({ where: { id: userId } }),
		]);

		// After the rows: a failure here leaves unreachable files, never an account half-deleted.
		await this._photos.removeAll(userId);
	}
}

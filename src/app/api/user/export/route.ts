import { requireUserId } from '../../../../lib/auth';
import { exportArchive } from '../../../../lib/export';
import { RATE_LIMITS, check, consume } from '../../../../lib/rateLimit';
import { errorResponse, logServerError } from '../../../../utils/ApiUtils';

/** Everything stored about the signed-in person, as a ZIP download. */
export async function GET() {
	try {
		const userId = await requireUserId();
		await check(RATE_LIMITS.exportAccount, userId);
		await consume(RATE_LIMITS.exportAccount, userId);

		const stream = await exportArchive(userId);
		const date = new Date().toISOString().slice(0, 10);
		return new Response(stream, {
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="sommeliers-ledger-${date}.zip"`,
				'Cache-Control': 'no-store',
			},
		});
	} catch (error) {
		logServerError('GET /api/user/export', error);
		return errorResponse(error);
	}
}

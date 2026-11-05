import { errorResponse, logServerError } from '../../../../utils/ApiUtils';
import { getLang } from '../../../../i18n/server';
import ServerServices from '../../../../services/server/ServerServices';
import ExportService from '../../../../services/server/ExportService';
import SessionService from '../../../../services/server/SessionService';

/** Everything stored about the signed-in person, as a ZIP download. */
export async function GET() {
	try {
		const userId = await ServerServices.getClass(SessionService).requireUserId();
		const stream = await ServerServices.getClass(ExportService).archive(userId);
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
		return errorResponse(error, await getLang());
	}
}

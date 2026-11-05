import { errorResponse, jsonResponse, logServerError } from '../../../utils/ApiUtils';
import { getLang } from '../../../i18n/server';
import ServerServices from '../../../services/server/ServerServices';
import TastingService from '../../../services/server/TastingService';
import { requireUserId } from '../../../lib/auth';
import { tastingCreateSchema } from '../../../schemas/tasting';

export async function GET() {
	try {
		const userId = await requireUserId();
		return jsonResponse({ tastings: await ServerServices.getClass(TastingService).list(userId) });
	} catch (error) {
		logServerError('GET /api/tastings', error);
		return errorResponse(error, await getLang());
	}
}

export async function POST(request: Request) {
	try {
		const userId = await requireUserId();
		// A ZodError here becomes a 400 naming the first bad field (see errorResponse).
		const body = tastingCreateSchema.parse(await request.json());
		const saved = await ServerServices.getClass(TastingService).create(userId, body);
		return jsonResponse({ message: 'Tasting saved', ...saved }, 201);
	} catch (error) {
		logServerError('POST /api/tastings', error);
		return errorResponse(error, await getLang());
	}
}

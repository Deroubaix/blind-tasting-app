import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';
import { getLang } from '../../../../i18n/server';
import ServerServices from '../../../../services/server/ServerServices';
import TastingService from '../../../../services/server/TastingService';
import { requireUserId } from '../../../../lib/auth';
import { revealUpdateSchema } from '../../../../schemas/tasting';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
	try {
		const userId = await requireUserId();
		return jsonResponse({ tasting: await ServerServices.getClass(TastingService).get(userId, (await params).id) });
	} catch (error) {
		logServerError('GET /api/tastings/[id]', error);
		return errorResponse(error, await getLang());
	}
}

export async function DELETE(_request: Request, { params }: Params) {
	try {
		const userId = await requireUserId();
		await ServerServices.getClass(TastingService).delete(userId, (await params).id);
		return new Response(null, { status: 204 });
	} catch (error) {
		logServerError('DELETE /api/tastings/[id]', error);
		return errorResponse(error, await getLang());
	}
}

/** Sets, edits or clears (`{ reveal: null }`) the reveal on one of the user's own tastings. */
export async function PATCH(request: Request, { params }: Params) {
	try {
		const userId = await requireUserId();
		const { reveal } = revealUpdateSchema.parse(await request.json());
		const tasting = await ServerServices.getClass(TastingService).setReveal(userId, (await params).id, reveal);
		return jsonResponse({ tasting });
	} catch (error) {
		logServerError('PATCH /api/tastings/[id]', error);
		return errorResponse(error, await getLang());
	}
}

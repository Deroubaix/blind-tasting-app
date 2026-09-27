import { prisma } from '../../../../lib/prisma';
import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';
import { requireUserId } from '../../../../lib/auth';
import { deletePhoto } from '../../../../lib/storage';
import { revealUpdateSchema } from '../../../../schemas/tasting';
import { revealFields } from '../../../../lib/reveal';
import { JsonApiError } from '../../../../utils/ErrorUtils';

// Also what someone else's id gets, so the route never confirms another user's tasting exists.
const NOT_FOUND = new JsonApiError('NotFound', 'This tasting does not exist, or it was deleted.', 404);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const userId = await requireUserId();
		const tasting = await prisma.tasting.findFirst({
			where: { id, userId },
		});
		if (!tasting) {
			return errorResponse(NOT_FOUND);
		}
		return jsonResponse({ tasting });
	} catch (error) {
		logServerError('GET /api/tastings/[id]', error);
		return errorResponse(error);
	}
}

/**
 * Deletes one of the signed-in user's tastings, and its photo. The row goes first: if removing the
 * photo then fails, the worst case is an unused file in storage, never a tasting pointing at a
 * photo that is gone. `deleteMany` scoped to the user makes someone else's id a plain 404.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const userId = await requireUserId();
		const tasting = await prisma.tasting.findFirst({ where: { id, userId }, select: { photoKey: true } });
		if (!tasting) {
			return errorResponse(NOT_FOUND);
		}

		await prisma.tasting.deleteMany({ where: { id, userId } });

		if (tasting.photoKey) {
			await deletePhoto(tasting.photoKey).catch((error) =>
				logServerError('DELETE /api/tastings/[id] (photo)', error),
			);
		}

		return new Response(null, { status: 204 });
	} catch (error) {
		logServerError('DELETE /api/tastings/[id]', error);
		return errorResponse(error);
	}
}

/**
 * Sets, edits or clears (`{ reveal: null }`) the reveal on one of the signed-in user's tastings.
 * The reveal usually comes after saving — when the bottle is unwrapped — so it has its own route
 * rather than riding on the save. Scoped by user, so someone else's id is a plain 404.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const userId = await requireUserId();
		const { reveal } = revealUpdateSchema.parse(await request.json());

		const { count } = await prisma.tasting.updateMany({ where: { id, userId }, data: revealFields(reveal) });
		if (count === 0) {
			return errorResponse(NOT_FOUND);
		}

		const tasting = await prisma.tasting.findFirst({ where: { id, userId } });
		return jsonResponse({ tasting });
	} catch (error) {
		logServerError('PATCH /api/tastings/[id]', error);
		return errorResponse(error);
	}
}

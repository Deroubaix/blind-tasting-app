import { prisma } from '../../../../lib/prisma';
import { errorResponse, logServerError } from '../../../../utils/ApiUtils';
import { requireUserId } from '../../../../lib/auth';
import { deletePhoto } from '../../../../lib/storage';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const userId = await requireUserId();
		const tasting = await prisma.tasting.findFirst({
			where: { id, userId },
		});
		if (!tasting) {
			return new Response(JSON.stringify({ error: 'Not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		return new Response(JSON.stringify({ tasting }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
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
			return new Response(JSON.stringify({ error: 'NotFound', message: 'Not found', statusCode: 404 }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
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

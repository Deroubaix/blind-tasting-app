import { prisma } from '../../../../lib/prisma';
import { requireUserId } from '../../../../lib/auth';
import { errorResponse, jsonResponse } from '../../../../utils/ApiUtils';

/**
 * The signed-in user, or a 401. Not being signed in is the normal case on most page loads, so a
 * failure here is not logged.
 */
export async function GET() {
	try {
		const userId = await requireUserId();
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, displayName: true },
		});
		return jsonResponse(user);
	} catch (error) {
		return errorResponse(error);
	}
}

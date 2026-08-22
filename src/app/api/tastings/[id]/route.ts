import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { JsonApiError } from '../../../../utils/ErrorUtils';
import { errorResponse, logServerError } from '../../../../utils/ApiUtils';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET!;

async function getUserIdFromToken() {
	const cookieStore = await cookies();
	const token = cookieStore.get('auth-token')?.value;
	if (!token) {
		throw new JsonApiError('Unauthorized', 'Access denied: no token provided', 401);
	}
	const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
	return decoded.userId;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const userId = await getUserIdFromToken();
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

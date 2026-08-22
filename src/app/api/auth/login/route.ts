import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { verifyPassword } from '../../../../utils/PasswordUtils';
import { JsonApiError } from '../../../../utils/ErrorUtils';
import { errorResponse, logServerError } from '../../../../utils/ApiUtils';
import { loginSchema } from '../../../../schemas/auth';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET!;

export async function POST(request: Request) {
	try {
		const { email, password } = loginSchema.parse(await request.json());

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			throw new JsonApiError('Unauthorized', 'Invalid email or password', 401);
		}

		const isPasswordValid = await verifyPassword(password, user.password);
		if (!isPasswordValid) {
			throw new JsonApiError('Unauthorized', 'Invalid email or password', 401);
		}

		const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
			expiresIn: '1h',
		});

		// Mirrors AuthenticatedUser — the password and reset-token columns never leave the server.
		const safeUser = {
			id: user.id,
			email: user.email,
			displayName: user.displayName,
			created_at: user.created_at,
		};

		return new Response(JSON.stringify(safeUser), {
			status: 200,
			headers: {
				'Set-Cookie': `auth-token=${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`,
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		logServerError('login', error);
		return errorResponse(error);
	}
}

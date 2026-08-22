import { PrismaClient } from '@prisma/client';
import { JsonApiError } from '../../../../utils/ErrorUtils';
import { errorResponse, jsonResponse, logServerError } from '../../../../utils/ApiUtils';
import { hashPassword } from '../../../../utils/PasswordUtils';
import { signupSchema } from '../../../../schemas/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const { email, password, displayName } = signupSchema.parse(await request.json());

		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			throw new JsonApiError('UserExists', 'User with this email already exists', 400);
		}

		const hashedPassword = await hashPassword(password);

		const user = await prisma.user.create({
			data: { email, password: hashedPassword, displayName },
		});

		return jsonResponse(
			{
				message: 'User created successfully',
				user: { id: user.id, email: user.email, name: user.displayName },
			},
			201,
		);
	} catch (error) {
		logServerError('signup', error);
		return errorResponse(error);
	}
}

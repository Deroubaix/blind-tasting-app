import { PrismaClient } from '@prisma/client';
import { verifyToken } from "../../../../lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return new Response(JSON.stringify({ error: 'Access Denied' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const decoded: any = verifyToken(token);
    const tastings = await prisma.tasting.findMany({
      where: { userId: decoded.userId },
    });

    return new Response(JSON.stringify({ tastings }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid Token' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

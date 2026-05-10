import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET!;

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) throw new Error("Access Denied: No token provided");
  const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
  return decoded.userId;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromToken();
    const tasting = await prisma.tasting.findFirst({
      where: { id: Number(id), userId },
    });
    if (!tasting) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ tasting }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes("Access Denied") ? 401 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

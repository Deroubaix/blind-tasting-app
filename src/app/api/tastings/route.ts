import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET!;

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    throw new Error("Access Denied: No token provided");
  }

  const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
  return decoded.userId;
}

export async function GET() {
  try {
    const userId = await getUserIdFromToken();

    const tastings = await prisma.tasting.findMany({
      where: { userId },
    });

    return new Response(JSON.stringify({ tastings }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in GET /api/tastings:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes("Access Denied") ? 401 : 403,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromToken();
    const body = await request.json();

    // Validate required fields
    if (!body.wineType) {
      return new Response(JSON.stringify({ error: "Wine type is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tasting = await prisma.tasting.create({
      data: {
        userId,
        wineType: body.wineType,
        timerEnabled: body.timerEnabled ?? false,
        timerDuration: body.timerDuration ?? null,
        isArchived: false,
        notes: body.notes ?? null,
        sight: body.sight ?? null,
        nose: body.nose ?? null,
        palate: body.palate ?? null,
        conclusion: body.conclusion ?? null,
        wineName: body.wineName ?? null,
      },
    });

    return new Response(JSON.stringify({ message: "Tasting saved", tasting }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in POST /api/tastings:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes("Access Denied") ? 401 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

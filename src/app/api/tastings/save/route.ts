import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../../../lib/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return new Response(JSON.stringify({ error: "Access Denied" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const decoded: any = verifyToken(token);
    const body = await request.json();

    const tasting = await prisma.tasting.create({
      data: {
        userId: decoded.userId,
        wineType: body.wineType,
        sight: body.sight,
        nose: body.nose,
        palate: body.palate,
        conclusion: body.conclusion,
        wineName: body.wineName,
        timerEnabled: body.timerEnabled,
        timerDuration: body.timerDuration,
        isArchived: body.isArchived,
        notes: body.notes,
      },
    });

    return new Response(JSON.stringify({ message: "Tasting saved", tasting }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/tasting/save:", error);
    return new Response(JSON.stringify({ error: "Invalid Token" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
}

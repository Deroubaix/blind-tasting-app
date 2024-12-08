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
    const { tastingId } = await request.json();

    const updatedTasting = await prisma.tasting.update({
      where: { id: tastingId, userId: decoded.userId },
      data: { isArchived: true },
    });

    return new Response(
      JSON.stringify({ message: "Tasting archived", updatedTasting }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error archiving tasting:", error);
    return new Response(JSON.stringify({ error: "Invalid Request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

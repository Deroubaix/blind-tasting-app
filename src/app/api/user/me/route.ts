import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET!;

export async function GET() {
  try {
    // Await the cookies object
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "Access Denied",
          message: "No token provided",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
    const userId = decoded.userId;

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in /api/user/me:", error);

    return new Response(
      JSON.stringify({
        error: "Invalid Token",
        message: "Authentication failed",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
}

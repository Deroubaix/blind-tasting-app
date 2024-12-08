import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return new Response(JSON.stringify({ error: "User already exists" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  return new Response(
    JSON.stringify({
      message: "User created",
      user: { id: user.id, email: user.email },
    }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
}

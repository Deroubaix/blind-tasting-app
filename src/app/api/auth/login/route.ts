import { PrismaClient } from "@prisma/client";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);
const SECRET_KEY = process.env.JWT_SECRET!;

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, storedKey] = hash.split(":");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedKeyBuffer = Buffer.from(storedKey, "hex");
  return timingSafeEqual(derivedKey, storedKeyBuffer);
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401 }
      );
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    return new Response(
      JSON.stringify({ message: "Login successful" }),
      {
        status: 200,
        headers: {
          "Set-Cookie": `auth-token=${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error during login: ${message}\n`);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

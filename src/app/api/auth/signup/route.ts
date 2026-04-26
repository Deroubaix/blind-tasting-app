import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { z } from "zod";
import { JsonApiError } from "../../../../utils/ErrorUtils";

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  displayName: z.string().min(1, "Name is required"),
});

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, displayName } = signupSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new JsonApiError(
        "UserExists",
        "User with this email already exists",
        400
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, displayName },
    });

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        user: { id: user.id, email: user.email, name: user.displayName },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code = (error as any)?.code;
    process.stderr.write(`Error during signup: ${message}${code ? ` [${code}]` : ""}\n`);

    const handledError = JsonApiError.isJsonApiError(error)
      ? error
      : JsonApiError.create(error);

    return new Response(JSON.stringify(JsonApiError.toJson(handledError)), {
      status: handledError.statusCode || 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

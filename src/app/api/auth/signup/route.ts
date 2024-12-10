import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";
import { JsonApiError } from "../../../../utils/ErrorUtils";

const prisma = new PrismaClient();

// Schema validation for signup
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const { email, password } = signupSchema.parse(body);

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new JsonApiError(
        "UserExists",
        "User with this email already exists",
        400
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    // Return a successful response
    return new Response(
      JSON.stringify({
        message: "User created successfully",
        user: { id: user.id, email: user.email },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Handle errors consistently using JsonApiError
    const handledError = JsonApiError.isJsonApiError(error)
      ? error
      : JsonApiError.create(error);

    return new Response(JSON.stringify(JsonApiError.toJson(handledError)), {
      status: handledError.statusCode || 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

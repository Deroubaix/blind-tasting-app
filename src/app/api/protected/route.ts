import { verifyToken } from "../../../../lib/auth";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return new Response(JSON.stringify({ error: "Access Denied" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const decoded = verifyToken(token);
    return new Response(
      JSON.stringify({ message: "Access Granted", user: decoded }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid Token" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
}

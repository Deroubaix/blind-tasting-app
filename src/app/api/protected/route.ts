import { verify } from "jsonwebtoken";
import { parse } from "cookie";

const SECRET_KEY = process.env.JWT_SECRET;

export async function GET(request: Request) {
  try {
    // Parse cookies from the request
    const cookieHeader = request.headers.get("Cookie");
    if (!cookieHeader) {
      return new Response(
        JSON.stringify({
          error: "Access Denied",
          message: "Authorization cookie is missing",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const cookies = parse(cookieHeader);
    const token = cookies.authToken;

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "Access Denied",
          message: "Authorization token is missing",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify the token
    const decoded = verify(token, SECRET_KEY);

    return new Response(
      JSON.stringify({
        message: "Access Granted",
        user: decoded,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Authentication Error:", error);

    if (error.name === "TokenExpiredError") {
      return new Response(
        JSON.stringify({
          error: "Token Expired",
          message: "Please login again.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Invalid Token",
        message: "The token provided is invalid.",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

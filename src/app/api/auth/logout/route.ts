export async function GET() {
  return new Response(JSON.stringify({ message: "Logged out" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`,
    },
  });
}

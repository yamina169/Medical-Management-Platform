// login/route.js
import { verifyLogin } from "@/actions/login";

export async function POST(req) {
  const body = await req.json();
  try {
    const user = await verifyLogin(body);
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
}

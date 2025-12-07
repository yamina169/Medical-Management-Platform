import { resetPassword } from "@/actions/resetPassword";

export async function POST(req) {
  const body = await req.json();
  try {
    const result = await resetPassword(body);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
}

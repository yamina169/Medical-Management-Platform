import { getSuperadminSubscriptionAlerts } from "@/actions/notifications";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    if (!token)
      return new Response(JSON.stringify({ error: "Token missing" }), {
        status: 401,
      });

    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secretKey);

    if (!payload?.role || payload.role !== "SUPERADMIN") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
      });
    }

    const alerts = await getSuperadminSubscriptionAlerts();

    return new Response(JSON.stringify(alerts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching superadmin alerts:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

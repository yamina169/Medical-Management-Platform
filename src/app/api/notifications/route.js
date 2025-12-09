import {
  getSuperadminSubscriptionAlerts,
  getAdminClinicSubscriptionAlert,
} from "@/actions/notifications";
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

    if (!payload?.role) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
      });
    }

    let alerts;

    if (payload.role === "SUPERADMIN") {
      // Alertes pour le superadmin
      alerts = await getSuperadminSubscriptionAlerts();
    } else if (payload.role === "ADMIN_CLINIC") {
      // Alertes pour l'admin de clinique
      alerts = await getAdminClinicSubscriptionAlert(payload.id);
    } else {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ success: true, alerts }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching alerts:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

// src/app/api/users/route.js
// src/app/api/users/route.js

import {
  getAdminsClinic,
  activateAdminClinicBySuperAdmin,
} from "@/actions/admins";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const role = url.searchParams.get("role")?.trim();

    const admins = await getAdminsClinic();
    return Response.json(admins, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/users
 * Exemple pour activer un AdminClinic par SuperAdmin
 * Body JSON: { "adminId": "...", "superAdminId": "..." }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { adminId, superAdminId } = body;

    if (!adminId || !superAdminId) {
      return new Response(
        JSON.stringify({ error: "adminId and superAdminId are required" }),
        { status: 400 }
      );
    }

    const adminClinic = await activateAdminClinicBySuperAdmin(
      adminId,
      superAdminId
    );

    return new Response(JSON.stringify(adminClinic), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

// src/app/api/users/route.js
import {
  getUsersByRole,
  activateAdminClinicBySuperAdmin,
} from "@/actions/users";

/**
 * GET /api/users?role=ROLE_NAME
 * Récupère les utilisateurs par rôle
 */
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const role = url.searchParams.get("role")?.trim();

    if (!role) {
      return new Response(JSON.stringify({ error: "Role is required" }), {
        status: 400,
      });
    }

    const users = await getUsersByRole(role);
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
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

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  getFilteredClinics,
  getClinicById,
  updateClinic,
  getClinicsStats,
} from "@/actions/clinics";

const JWT_SECRET = process.env.JWT_SECRET;

// Helper pour extraire le role et l'id depuis le JWT
function getUserFromJWT(req) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      id: decoded.id,
      role: decoded.role?.toUpperCase() || null,
    };
  } catch {
    return null;
  }
}

export async function GET(req) {
  try {
    const user = getUserFromJWT(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const params = url.searchParams;

    const id = params.get("id");
    const stats = params.get("stats");

    /* ============================
       1️⃣ GET STATS SUPERADMIN
       ============================ */
    if (stats === "true") {
      if (user.role !== "SUPERADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const data = await getClinicsStats();
      return NextResponse.json(data, { status: 200 });
    }

    /* ============================
       2️⃣ GET CLINIC BY ID
       ============================ */
    if (id) {
      const clinic = await getClinicById(Number(id));
      return NextResponse.json(clinic, { status: 200 });
    }

    /* ============================
       3️⃣ GET FILTERED CLINICS (LIST)
       ============================ */
    if (user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const page = Number(params.get("page") || 1);
    const limit = Number(params.get("limit") || 10);
    const search = params.get("search") || "";
    const sort = params.get("sort") || "createdAt:desc";

    const clinics = await getFilteredClinics({ page, limit, search, sort });
    return NextResponse.json(clinics, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
export async function PUT(req) {
  try {
    const user = getUserFromJWT(req);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );

    const body = await req.json();

    // Mettre à jour la clinique correspondant à cet userId
    const updatedClinic = await updateClinic(user.id, body);

    return NextResponse.json({ success: true, data: updatedClinic });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

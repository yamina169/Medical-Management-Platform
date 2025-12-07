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
    if (!user || user.role !== "ADMIN_CLINIC") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Clinic id is required" },
        { status: 400 }
      );
    }

    // Vérifier que l'admin appartient à la clinique
    const clinic = await getClinicById(Number(id));
    const isAdminOfClinic = clinic.clinic.adminEmail;

    if (!isAdminOfClinic) {
      return NextResponse.json(
        { error: "You are not admin of this clinic" },
        { status: 403 }
      );
    }

    // Champs autorisés
    const allowedFields = [
      "name",
      "taxId",
      "address",
      "phone",
      "subscriptionType",
      "subscriptionStatus",
      "subscriptionStart",
      "subscriptionEnd",
    ];

    const payload = {};
    for (const key of allowedFields) {
      if (key in data) payload[key] = data[key];
    }

    await updateClinic(Number(id), payload);
    const updatedClinic = await getClinicById(Number(id));

    return NextResponse.json(
      { message: "Clinic updated", clinic: updatedClinic },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

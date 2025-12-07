// /src/app/api/clinics/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  getClinics,
  getClinicById,
  updateClinic,
  softDeleteClinic,
} from "@/actions/clinics";

// 🔑 SECRET pour JWT
const JWT_SECRET = process.env.JWT_SECRET;

/** Helper pour récupérer le rôle depuis le JWT */
function getUserRole(req) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.role?.toUpperCase() || null;
  } catch (err) {
    return null;
  }
}

/** GET /api/clinics */
export async function GET(req) {
  try {
    const role = getUserRole(req);
    if (!role)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const params = url.searchParams;
    const id = params.get("id");

    // GET single clinic
    if (id) {
      if (role === "ADMIN_CLINIC") {
        // 🔹 ici tu peux ajouter vérification ownership si nécessaire
      }
      const result = await getClinicById(Number(id));
      return NextResponse.json(result, { status: 200 });
    }

    // LIST clinics (SUPERADMIN seulement)
    if (role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // simple validation query params
    const page = Math.max(1, Number(params.get("page") || 1));
    const limit = Math.max(1, Number(params.get("limit") || 10));
    const search = params.get("search") || "";
    const sort = params.get("sort") || "createdAt:desc";

    const result = await getClinics({ page, limit, search, sort });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("GET /api/clinics error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 400 }
    );
  }
}

/** PUT /api/clinics */
export async function PUT(req) {
  try {
    const role = getUserRole(req);
    if (!role || role !== "ADMIN_CLINIC") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;
    if (!id)
      return NextResponse.json(
        { error: "clinic id is required" },
        { status: 400 }
      );

    // simple validation body
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
    for (const k of allowedFields) {
      if (k in data) payload[k] = data[k];
    }

    // update clinic
    await updateClinic(Number(id), payload);

    // récupérer la clinic mise à jour
    const updatedFull = await getClinicById(Number(id));

    return NextResponse.json(
      { message: "Clinic updated", clinic: updatedFull },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT /api/clinics error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 400 }
    );
  }
}

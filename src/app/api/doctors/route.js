// /api/doctors/route.js
import { NextResponse } from "next/server";
import {
  getDoctors,
  registerDoctor,
  updateDoctor,
  deleteDoctor,
} from "@/actions/doctors";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyAdminClinic(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Vérifie que le rôle est bien ADMIN_CLINIC
  if (payload.role !== "ADMIN_CLINIC") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Return payload for further use (do NOT mutate req)
  return payload;
}

/**
 * Verify admin role AND ensure payload contains clinicId.
 * Returns object: { clinicId, admin } on success, or NextResponse on failure.
 */
async function verifyAdminAndGetClinic(req) {
  const payloadOrResponse = await verifyAdminClinic(req);
  // If verifyAdminClinic returned a NextResponse (error) it will be an object with `.status` (not the payload)
  if (!payloadOrResponse || payloadOrResponse?.status) return payloadOrResponse;
  const payload = payloadOrResponse;

  const clinicId = payload.clinicId || payload.clinic?.id;
  if (!clinicId) {
    return NextResponse.json(
      { error: "No clinicId in token" },
      { status: 403 }
    );
  }

  const admin = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };

  return { clinicId: Number(clinicId), admin };
}
export async function GET(req) {
  try {
    const payloadOrError = await verifyAdminClinic(req);
    if (!payloadOrError || payloadOrError?.status) return payloadOrError;
    const payload = payloadOrError;

    const url = new URL(req.url);
    const searchParams = {
      search: url.searchParams.get("search") || "",
      specialization: url.searchParams.get("specialization") || "", // <-- nouveau
      page: parseInt(url.searchParams.get("page")) || 1,
      limit: parseInt(url.searchParams.get("limit")) || 10,
      clinicId: payload.clinicId || payload.clinic?.id,
    };

    const doctors = await getDoctors(searchParams);
    return NextResponse.json({ success: true, data: doctors });
  } catch (err) {
    console.error("GET /doctors error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id; // <-- prendre id du token
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const doctor = await registerDoctor(body, userId);

    return NextResponse.json(doctor);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const payloadOrError = await verifyAdminClinic(req);
    if (!payloadOrError || payloadOrError?.status) return payloadOrError;

    const body = await req.json();
    // Expect body to be: { id, name?, email?, password? }
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Doctor id is required" },
        { status: 400 }
      );
    }

    const updatedDoctor = await updateDoctor(Number(id), data); // Validation inside updateDoctor
    return NextResponse.json({ success: true, data: updatedDoctor });
  } catch (err) {
    console.error("PUT /doctors error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}

export async function DELETE(req) {
  try {
    console.log("🔹 DELETE /doctors called");

    const payloadOrError = await verifyAdminClinic(req);
    if (!payloadOrError || payloadOrError?.status) {
      console.log("⛔ Unauthorized or forbidden access");
      return payloadOrError;
    }

    const body = await req.json();
    console.log("📦 Request body:", body);

    if (!body.id) {
      console.log("⚠️ Doctor id is missing in request body");
      return NextResponse.json(
        { success: false, error: "Doctor id is required" },
        { status: 400 }
      );
    }

    const deletedDoctor = await deleteDoctor(body.id);
    console.log("✅ Deleted doctor:", deletedDoctor);

    return NextResponse.json({ success: true, data: deletedDoctor });
  } catch (err) {
    console.error("❌ DELETE /doctors error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}

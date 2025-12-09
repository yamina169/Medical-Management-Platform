import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import {
  getPatients,
  registerPatient,
  updatePatient,
  deletePatient,
} from "@/actions/patients";

const JWT_SECRET = process.env.JWT_SECRET;
async function verifyAdminClinic(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!["ADMIN_CLINIC"].includes(decoded.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminRecord = await prisma.adminClinic.findFirst({
      where: { userId: decoded.id },
      select: { clinicId: true },
    });

    if (!adminRecord) {
      return NextResponse.json(
        { error: "Admin clinic not found" },
        { status: 404 }
      );
    }

    return { adminUserId: decoded.id, clinicId: adminRecord.clinicId };
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
// GET /api/patients
export async function GET(req) {
  try {
    // Vérification du token + récupération adminUserId et clinicId
    const payloadOrResponse = await verifyAdminClinic(req);
    if (payloadOrResponse instanceof NextResponse) return payloadOrResponse;

    const { adminUserId } = payloadOrResponse;

    // Récupérer les query params
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);

    // Utiliser directement la fonction getPatients
    const result = await getPatients(
      `Bearer ${req.headers.get("authorization")?.split(" ")[1]}`,
      {
        search,
        page,
        limit,
      }
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error("GET /api/patients error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const payload = await verifyRole(req);
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["DOCTOR", "ADMIN_CLINIC", "RECEPTIONIST"].includes(payload.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const patient = await registerPatient(body, payload.id, payload.role);
  return NextResponse.json({ success: true, data: patient });
}

export async function PUT(req) {
  const payload = await verifyRole(req);
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["DOCTOR", "ADMIN_CLINIC", "RECEPTIONIST"].includes(payload.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, ...data } = body;
  if (!id)
    return NextResponse.json(
      { error: "Patient id is required" },
      { status: 400 }
    );

  const updated = await updatePatient(id, data);
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req) {
  const payload = await verifyRole(req);
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["DOCTOR", "ADMIN_CLINIC", "RECEPTIONIST"].includes(payload.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  if (!body.id)
    return NextResponse.json(
      { error: "Patient id is required" },
      { status: 400 }
    );

  const deleted = await deletePatient(body.id);
  return NextResponse.json({ success: true, data: deleted });
}

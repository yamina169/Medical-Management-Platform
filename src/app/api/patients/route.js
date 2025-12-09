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
    // 1️⃣ Vérifier le token et récupérer adminUserId + clinicId
    const payloadOrResponse = await verifyAdminClinic(req);
    if (payloadOrResponse instanceof NextResponse) return payloadOrResponse;

    const { adminUserId, clinicId } = payloadOrResponse;

    // 2️⃣ Récupérer les query params
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);

    // 3️⃣ Filtrage par clinicId et recherche
    const skip = (page - 1) * limit;
    const q = search.trim();

    const where = {
      clinicId,
      ...(q && {
        OR: [
          { user: { is: { name: { contains: q, mode: "insensitive" } } } },
          { user: { is: { email: { contains: q, mode: "insensitive" } } } },
        ],
      }),
    };

    const total = await prisma.patient.count({ where });
    const data = await prisma.patient.findMany({
      where,
      include: { user: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const mapped = data.map((p) => ({
      id: p.id,
      userId: p.userId,
      clinicId: p.clinicId,
      name: p.user?.name || null,
      email: p.user?.email || null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: mapped,
      total,
      page,
      limit,
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

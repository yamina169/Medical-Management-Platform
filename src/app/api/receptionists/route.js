// /api/receptionists/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  getReceptionists,
  registerReceptionist,
  updateReceptionist,
  deleteReceptionist,
} from "@/actions/receptionists";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;
async function verifyToken(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Récupérer clinicId de l'admin
async function getAdminClinicId(adminUserId) {
  const adminRecord = await prisma.adminClinic.findFirst({
    where: { userId: adminUserId },
    select: { clinicId: true },
  });
  if (!adminRecord) throw new Error("Admin clinic not found");
  return adminRecord.clinicId;
}

// GET /api/receptionists
export async function GET(req) {
  try {
    const payload = await verifyToken(req);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const adminUserId = payload.id;

    // Récupérer la clinicId du clinic admin
    const clinicId = await getAdminClinicId(adminUserId);

    // Récupérer les query params
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);

    // Récupérer les réceptionnistes filtrés par clinicId
    const receptionists = await getReceptionists({
      search,
      page,
      limit,
      clinicId,
    });

    return NextResponse.json(
      { success: true, ...receptionists },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/receptionists error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
export async function POST(req) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const receptionist = await registerReceptionist(body, userId);
    return NextResponse.json(receptionist);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const payload = await verifyAdminClinic(req);
    if (!payload || payload?.status) return payload;

    const body = await req.json();
    const { id, ...data } = body;
    if (!id)
      return NextResponse.json(
        { success: false, error: "Receptionist id is required" },
        { status: 400 }
      );

    const updated = await updateReceptionist(Number(id), data);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
} // Fonction pour vérifier que l'utilisateur est admin de la clinique
async function verifyAdminClinic(req) {
  const payload = await verifyToken(req);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const clinicId = await getAdminClinicId(payload.id);
    return { adminId: payload.id, clinicId };
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 403 }
    );
  }
}

// Exemple pour DELETE
export async function DELETE(req) {
  try {
    const payload = await verifyAdminClinic(req);
    if (!payload.adminId) return payload; // Si payload contient déjà la réponse NextResponse

    const body = await req.json();
    if (!body.id)
      return NextResponse.json(
        { success: false, error: "Receptionist id is required" },
        { status: 400 }
      );

    const deleted = await deleteReceptionist(body.id);
    return NextResponse.json({ success: true, data: deleted });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}

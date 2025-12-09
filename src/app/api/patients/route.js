import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  getPatients,
  registerPatient,
  updatePatient,
  deletePatient,
} from "@/actions/patients";

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
export async function GET(req) {
  try {
    // 1️⃣ Récupérer le token depuis le header Authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // 2️⃣ Décoder le token pour obtenir le userId
    const secret = process.env.JWT_SECRET; // mettre la clé secrète de ton JWT
    const decoded = jwt.verify(token, secret);
    const adminUserId = decoded.id;

    // 3️⃣ Récupérer les query params
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);

    // 4️⃣ Appeler la fonction getPatients en filtrant par la clinique de l'admin
    const patients = await getPatients({ search, page, limit, adminUserId });

    // 5️⃣ Retourner la réponse
    return new Response(JSON.stringify({ success: true, ...patients }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/patients error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
export async function POST(req) {
  const payload = await verifyToken(req);
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["DOCTOR", "ADMIN_CLINIC", "RECEPTIONIST"].includes(payload.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const patient = await registerPatient(body, payload.id, payload.role);
  return NextResponse.json({ success: true, data: patient });
}

export async function PUT(req) {
  const payload = await verifyToken(req);
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["DOCTOR", "ADMIN_CLINIC", "RECEPTIONIST"].includes(payload.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
  const payload = await verifyToken(req);
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["DOCTOR", "ADMIN_CLINIC", "RECEPTIONIST"].includes(payload.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.id)
    return NextResponse.json(
      { error: "Patient id is required" },
      { status: 400 }
    );

  const deleted = await deletePatient(body.id);
  return NextResponse.json({ success: true, data: deleted });
}

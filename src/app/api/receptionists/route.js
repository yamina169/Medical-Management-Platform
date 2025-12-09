// /api/receptionists/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  getReceptionists,
  registerReceptionist,
  updateReceptionist,
  deleteReceptionist,
} from "@/actions/receptionists";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyAdminClinic(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer "))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = authHeader.split(" ")[1];

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (payload.role !== "ADMIN_CLINIC")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return payload;
}

export async function GET(req) {
  try {
    const payload = await verifyAdminClinic(req);
    if (!payload || payload?.status) return payload;

    const url = new URL(req.url);
    const params = {
      search: url.searchParams.get("search") || "",
      page: parseInt(url.searchParams.get("page")) || 1,
      limit: parseInt(url.searchParams.get("limit")) || 10,
      clinicId: payload.clinicId || payload.clinic?.id,
    };

    const receptionists = await getReceptionists(params);
    return NextResponse.json({ success: true, data: receptionists });
  } catch (err) {
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
}

export async function DELETE(req) {
  try {
    const payload = await verifyAdminClinic(req);
    if (!payload || payload?.status) return payload;

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

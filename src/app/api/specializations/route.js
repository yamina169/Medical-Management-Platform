import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET; // ton secret pour signer/verifier les tokens

async function verifyAdminClinic(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token) return null;

  try {
    // Décoder le JWT
    const decoded = jwt.verify(token, SECRET);

    // Vérifier le rôle avec Prisma
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: { adminClinic: true },
    });

    if (!user || user.role !== "ADMIN_CLINIC") return null;

    return user;
  } catch (err) {
    console.error("JWT Error:", err);
    return null;
  }
}

export async function GET(req) {
  const user = await verifyAdminClinic(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const specializations = await prisma.specialization.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(specializations);
}

export async function POST(req) {
  const user = await verifyAdminClinic(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const specialization = await prisma.specialization.create({ data: body });
  return NextResponse.json(specialization);
}

export async function PUT(req) {
  const user = await verifyAdminClinic(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, ...data } = await req.json();
  const updated = await prisma.specialization.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(req) {
  const user = await verifyAdminClinic(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const deleted = await prisma.specialization.delete({
    where: { id: Number(id) },
  });
  return NextResponse.json(deleted);
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  getMedicalRecordByPatient,
  updateMedicalRecord,
} from "@/actions/medicalRecord";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyDoctor(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "DOCTOR") return null;
    return { id: decoded.id };
  } catch {
    return null;
  }
}

// GET /api/medicalRecord?patientId=xxx
export async function GET(req) {
  const doctor = await verifyDoctor(req);
  if (!doctor)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const patientIdParam = url.searchParams.get("patientId");

  if (!patientIdParam)
    return NextResponse.json(
      { error: "PatientId is required" },
      { status: 400 }
    );

  const patientId = Number(patientIdParam);
  const record = await getMedicalRecordByPatient(patientId);

  if (!record)
    return NextResponse.json(
      { error: "No medical record found" },
      { status: 404 }
    );

  return NextResponse.json({ success: true, data: record });
}

export async function PUT(req) {
  try {
    const body = await req.json();
    if (!body.id)
      return NextResponse.json(
        { error: "Record id required" },
        { status: 400 }
      );

    const updated = await updateMedicalRecord(body.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

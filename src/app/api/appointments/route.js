import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentById,
} from "@/actions/appointments";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

// Vérifier le token et récupérer userId, role, clinicId
async function verifyUser(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer "))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { id: userId, role } = decoded;

    if (!["DOCTOR", "RECEPTIONIST"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let clinicId = null;
    if (role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId },
        select: { clinicId: true },
      });
      if (!doctor)
        return NextResponse.json(
          { error: "Doctor not found" },
          { status: 404 }
        );
      clinicId = doctor.clinicId;
    } else if (role === "RECEPTIONIST") {
      const rec = await prisma.receptionist.findUnique({
        where: { userId },
        select: { clinicId: true },
      });
      if (!rec)
        return NextResponse.json(
          { error: "Receptionist not found" },
          { status: 404 }
        );
      clinicId = rec.clinicId;
    }

    return { userId, role, clinicId };
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// GET /api/appointments?doctorId=&patientId=&status=&page=&limit=
// GET /api/appointments?id=123
export async function GET(req) {
  const payload = await verifyUser(req);
  if (payload instanceof NextResponse) return payload;

  const { role, clinicId, userId } = payload;

  const url = new URL(req.url);
  const appointmentId = url.searchParams.get("id");

  try {
    if (appointmentId) {
      // Récupérer un rendez-vous par ID
      const appointment = await getAppointmentById(Number(appointmentId));
      return NextResponse.json({ success: true, data: appointment });
    } else {
      // Sinon liste avec filtre
      const patientId = url.searchParams.get("patientId")
        ? Number(url.searchParams.get("patientId"))
        : undefined;
      const status = url.searchParams.get("status") || undefined;
      const page = Number(url.searchParams.get("page") || 1);
      const limit = Number(url.searchParams.get("limit") || 10);

      const result = await getAppointments({
        clinicId,
        doctorUserId: userId,
        patientId,
        status,
        page,
        limit,
      });
      return NextResponse.json({ success: true, ...result });
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}

// POST /api/appointments
export async function POST(req) {
  const payload = await verifyUser(req);
  if (payload instanceof NextResponse) return payload;

  const { clinicId } = payload;
  const body = await req.json();

  try {
    body.clinicId = clinicId; // forcer le clinicId
    const appointment = await createAppointment(body);
    return NextResponse.json({ success: true, data: appointment });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}

// PUT /api/appointments
// PUT /api/appointments/[id]
// Fonction pour mettre à jour uniquement la date et le status

// Handler PUT
export async function PUT(req) {
  const payload = await verifyUser(req);
  if (payload instanceof NextResponse) return payload;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Appointment ID required" },
      { status: 400 }
    );
  }

  const body = await req.json();

  try {
    const updated = await updateAppointment(Number(id), body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(err); // 🔴 Voir la vraie erreur dans la console
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments
export async function DELETE(req) {
  const payload = await verifyUser(req);
  if (payload instanceof NextResponse) return payload;

  const body = await req.json();
  if (!body.id)
    return NextResponse.json(
      { error: "Appointment ID required" },
      { status: 400 }
    );

  try {
    const deleted = await deleteAppointment(body.id);
    return NextResponse.json({ success: true, data: deleted });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}

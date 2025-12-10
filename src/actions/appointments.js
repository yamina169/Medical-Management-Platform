"use server";

import prisma from "@/lib/prisma";

/**
 * Récupère les appointments avec filtre, recherche et pagination
 */
export async function getAppointments({
  clinicId,
  doctorUserId,
  patientId,
  status,
  page = 1,
  limit = 10,
}) {
  const skip = (page - 1) * limit;

  let doctorId;

  if (doctorUserId) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: doctorUserId },
      select: { id: true },
    });
    doctorId = doctor?.id;
  }

  const where = {
    clinicId,
    ...(doctorId && { doctorId }),
    ...(patientId && { patientId }),
    ...(status && { status }),
    patient: { isActive: true }, // Filtre patients actifs
  };

  const total = await prisma.appointment.count({ where });

  const data = await prisma.appointment.findMany({
    where,
    skip,
    take: limit,
    orderBy: { date: "desc" },
    include: {
      patient: {
        select: {
          userId: true,
          isActive: true,
          user: { select: { name: true, email: true } },
        },
      },
      doctor: {
        select: { userId: true, user: { select: { name: true, email: true } } },
      },
      receptionist: {
        select: { userId: true, user: { select: { name: true, email: true } } },
      },
    },
  });

  return { data, total, page, limit };
}
/**
 * Crée un rendez-vous
 */
export async function createAppointment(payload) {
  const { patientId, doctorId, receptionistId, clinicId, date, status } =
    payload;

  if (
    !patientId ||
    !doctorId ||
    !receptionistId ||
    !clinicId ||
    !date ||
    !status
  ) {
    throw new Error("Missing required fields");
  }

  return prisma.appointment.create({
    data: {
      patientId,
      doctorId,
      receptionistId,
      clinicId,
      date: new Date(date),
      status,
    },
  });
}

/**
 * Met à jour un rendez-vous
 */
export async function updateAppointment(id, payload) {
  if (!id) throw new Error("Appointment ID required");

  // On ne garde que date et status
  const { date, status } = payload;
  if (date === undefined && status === undefined) {
    throw new Error("Nothing to update. Provide date and/or status");
  }

  return prisma.appointment.update({
    where: { id: Number(id) },
    data: {
      ...(date !== undefined && { date }),
      ...(status !== undefined && { status }),
    },
  });
}

/**
 * Supprime un rendez-vous
 */
export async function deleteAppointment(id) {
  if (!id) throw new Error("Appointment ID required");
  await prisma.appointment.delete({ where: { id: Number(id) } });
  return { message: "Appointment deleted successfully" };
}

export async function getAppointmentById(id) {
  if (!id) throw new Error("Appointment ID required");

  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(id) },
    include: {
      patient: {
        select: {
          user: { select: { name: true, email: true } },
          isActive: true,
        },
      },
      doctor: { select: { user: { select: { name: true, email: true } } } },
      receptionist: {
        select: { user: { select: { name: true, email: true } } },
      },
    },
  });

  if (!appointment) throw new Error("Appointment not found");
  return appointment;
}

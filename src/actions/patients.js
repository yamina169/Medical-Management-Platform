"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

/** Register a new patient linked to a clinic */
export async function registerPatient(payload, creatorUserId, creatorRole) {
  if (!creatorUserId) throw new Error("Creator userId is required");

  const { name, email } = payload;
  if (!name || !email) throw new Error("Name and email are required");

  let clinicId;

  // Determine clinicId depending on creator role
  if (creatorRole === "ADMIN_CLINIC") {
    const admin = await prisma.adminClinic.findUnique({
      where: { userId: creatorUserId },
    });
    if (!admin?.clinicId) throw new Error("Admin clinic not found");
    clinicId = admin.clinicId;
  } else if (creatorRole === "RECEPTIONIST") {
    const rec = await prisma.receptionist.findUnique({
      where: { userId: creatorUserId },
    });
    if (!rec?.clinicId) throw new Error("Receptionist clinic not found");
    clinicId = rec.clinicId;
  } else if (creatorRole === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: creatorUserId },
    });
    if (!doctor?.clinicId) throw new Error("Doctor clinic not found");
    clinicId = doctor.clinicId;
  } else {
    throw new Error("Unauthorized role to create patient");
  }

  // Generate temp password
  const tempPassword = crypto.randomBytes(4).toString("hex");
  const hashed = await bcrypt.hash(tempPassword, 10);

  // Create user
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: "PATIENT" },
  });

  // Create patient
  const patient = await prisma.patient.create({
    data: { userId: user.id, clinicId },
    include: { user: true, clinic: true },
  });

  // Send email with temp password
  await sendEmail({
    to: email,
    subject: "Votre compte Patient - MedFlow",
    text: `Bonjour ${name},\nVotre compte patient a été créé pour la clinique ${patient.clinic.name}.\nEmail: ${email}\nMot de passe temporaire: ${tempPassword}`,
    html: `<p>Bonjour ${name},</p><p>Votre compte patient a été créé pour la clinique <strong>${patient.clinic.name}</strong>.</p><ul><li><strong>Email:</strong> ${email}</li><li><strong>Mot de passe temporaire:</strong> ${tempPassword}</li></ul><p>Merci, MedFlow</p>`,
  });

  return patient;
}

/** Get patients with optional search, clinic filter, and pagination */

/**
 * Récupère les patients actifs pour le clinic admin connecté.
 * @param {Object} params
 * @param {string} params.search
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} params.adminUserId - id du user connecté (clinic admin)
 */
export async function getPatients({
  search = "",
  page = 1,
  limit = 10,
  adminUserId,
}) {
  const skip = (page - 1) * limit;
  const q = (search || "").trim();

  // Récupérer le clinicId du clinic admin
  const adminClinic = await prisma.adminClinic.findUnique({
    where: { userId: adminUserId },
    select: { clinicId: true },
  });

  if (!adminClinic) {
    return { data: [], total: 0, page, limit };
  }

  const clinicId = adminClinic.clinicId;

  const where = {
    clinicId,
    isActive: true, // uniquement les patients actifs
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
    include: { user: true }, // pas besoin de récupérer la clinique ici
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

  return { data: mapped, total, page, limit };
}

/** Update patient info (name/email/password) */
export async function updatePatient(id, data) {
  if (!id) throw new Error("Patient id is required");

  const userData = {};
  if (data.name) userData.name = data.name;
  if (data.email) userData.email = data.email;
  if (data.password) userData.password = await bcrypt.hash(data.password, 10);

  try {
    return await prisma.patient.update({
      where: { id: Number(id) },
      data: { user: { update: userData } },
      include: { user: true },
    });
  } catch (err) {
    const code = err?.code || err?.original?.code;
    if (code === "P2002" && err?.meta?.target?.includes("email")) {
      throw new Error("Email already in use");
    }
    throw err;
  }
}

/** Delete (deactivate) patient */
export async function deletePatient(id) {
  if (!id) throw new Error("Patient id is required");

  const patient = await prisma.patient.findUnique({
    where: { id: Number(id) },
    include: { user: true },
  });
  if (!patient) throw new Error("Patient not found");

  await prisma.user.update({
    where: { id: patient.userId },
    data: { role: "PATIENT" },
  });
  await prisma.patient.delete({ where: { id: Number(id) } });

  return { message: "Patient deleted successfully" };
}

/** Register a new patient linked to a clinic */

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

/**
 * Register a new patient linked to a clinic
 * Crée automatiquement un dossier médical vide pour le patient
 */
export async function registerPatient(payload, creatorUserId, creatorRole) {
  if (!creatorUserId) throw new Error("Creator userId is required");

  const { name, email, phoneNumber } = payload;
  if (!name || !email) throw new Error("Name and email are required");

  let clinicId;

  // Déterminer le clinicId selon le rôle du créateur
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

  // Générer un mot de passe temporaire
  const tempPassword = crypto.randomBytes(4).toString("hex");
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "PATIENT",
    },
  });

  // Créer le patient
  const patient = await prisma.patient.create({
    data: {
      userId: user.id,
      clinicId,
      phoneNumber: phoneNumber || null,
    },
    include: { clinic: true, user: true },
  });

  // Créer automatiquement le dossier médical
  await prisma.medicalRecord.create({
    data: {
      patientId: patient.id,
      description: "",
      prescriptions: { medicaments: [] },
      doctorId: null, // peut être assigné plus tard
    },
  });

  // Envoyer un email avec le mot de passe temporaire
  await sendEmail({
    to: email,
    subject: "Votre compte Patient - MedFlow",
    text: `Bonjour ${name},\nVotre compte patient a été créé pour la clinique ${patient.clinic.name}.\nEmail: ${email}\nMot de passe temporaire: ${tempPassword}`,
    html: `<p>Bonjour ${name},</p>
           <p>Votre compte patient a été créé pour la clinique <strong>${patient.clinic.name}</strong>.</p>
           <ul>
             <li><strong>Email:</strong> ${email}</li>
             <li><strong>Mot de passe temporaire:</strong> ${tempPassword}</li>
           </ul>
           <p>Merci, MedFlow</p>`,
  });

  return patient;
}

export async function getPatients(
  tokenJWT,
  { search = "", page = 1, limit = 10 } = {}
) {
  if (!tokenJWT) throw new Error("Token is required");

  const token = tokenJWT.replace("Bearer ", "");
  const payloadBase64 = token.split(".")[1];
  const decodedPayload = JSON.parse(
    Buffer.from(payloadBase64, "base64").toString()
  );

  const userId = decodedPayload.id;
  const role = decodedPayload.role;

  if (!userId || !role) throw new Error("Invalid token payload");

  // Récupérer le clinicId selon le rôle
  let clinicId = null;

  if (role === "ADMIN_CLINIC") {
    const adminRecord = await prisma.adminClinic.findFirst({
      where: { userId },
      select: { clinicId: true },
    });
    if (!adminRecord) throw new Error("Admin clinic not found");
    clinicId = adminRecord.clinicId;
  } else if (role === "DOCTOR") {
    const doctorRecord = await prisma.doctor.findFirst({
      where: { userId },
      select: { clinicId: true },
    });
    if (!doctorRecord) throw new Error("Doctor not found");
    clinicId = doctorRecord.clinicId;
  } else if (role === "RECEPTIONIST") {
    const receptionistRecord = await prisma.receptionist.findFirst({
      where: { userId },
      select: { clinicId: true },
    });
    if (!receptionistRecord) throw new Error("Receptionist not found");
    clinicId = receptionistRecord.clinicId;
  } else {
    throw new Error("Role not authorized to fetch patients");
  }

  const skip = (page - 1) * limit;
  const q = search.trim();

  const where = {
    clinicId,
    isActive: true,
    ...(q && {
      OR: [
        { user: { is: { name: { contains: q, mode: "insensitive" } } } },
        { user: { is: { email: { contains: q, mode: "insensitive" } } } },
        { phoneNumber: { contains: q } },
      ],
    }),
  };

  const total = await prisma.patient.count({ where });

  const data = await prisma.patient.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      clinicId: true,
      phoneNumber: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const mapped = data.map((p) => ({
    id: p.id,
    userId: p.userId,
    clinicId: p.clinicId,
    name: p.user?.name || null,
    email: p.user?.email || null,
    phoneNumber: p.phoneNumber || null,
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

  const patientData = {};
  if (data.phoneNumber) patientData.phoneNumber = data.phoneNumber;

  try {
    return await prisma.patient.update({
      where: { id: Number(id) },
      data: {
        user: { update: userData },
        ...(patientData && { phoneNumber: patientData.phoneNumber }),
      },
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

/**
 * Désactiver un patient sans toucher au dossier médical
 */
export async function deletePatient(id) {
  if (!id) throw new Error("Patient id is required");

  // Trouver le patient
  const patient = await prisma.patient.findUnique({
    where: { id: Number(id) },
    include: { user: true },
  });

  if (!patient) throw new Error("Patient not found");

  // Désactiver l'utilisateur
  await prisma.user.update({
    where: { id: patient.userId },
    data: { isActive: false }, // rendre l'utilisateur inactif
  });

  // Désactiver le patient
  await prisma.patient.update({
    where: { id: patient.id },
    data: { isActive: false },
  });

  return { message: "Patient deactivated successfully" };
}

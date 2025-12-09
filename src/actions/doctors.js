// /actions/doctors.js
// Doctor management: register, list, update, delete

"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { registerSchema, updateUserSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/email";

/**
 * Register a doctor linked to the admin's clinic
 * @param {Object} payload - { name, email, specializationId?, specialization? }
 * @param {number} adminUserId - userId from JWT
 */
export async function registerDoctor(payload, adminUserId) {
  if (!adminUserId) throw new Error("Admin userId is required from token");

  // ----------------------------
  // Validation du payload
  // ----------------------------
  const validation = registerSchema.safeParse(payload);
  if (!validation.success) {
    const errorsArray = validation.error?.errors || [];
    const errors = errorsArray
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new Error(`Validation failed: ${errors || "Payload invalide"}`);
  }

  // ----------------------------
  // Récupérer la clinique de l'admin
  // ----------------------------
  const adminRecord = await prisma.adminClinic.findFirst({
    where: { userId: adminUserId },
    include: { clinic: true },
  });
  if (!adminRecord) throw new Error("Admin clinic not found");

  const clinicId = adminRecord.clinic?.id;
  if (!clinicId) throw new Error("No clinic associated with this admin");

  // ----------------------------
  // Générer un mot de passe temporaire
  // ----------------------------
  const tempPassword = crypto.randomBytes(4).toString("hex");
  const hashed = await bcrypt.hash(tempPassword, 10);

  // ----------------------------
  // Créer l'utilisateur DOCTOR
  // ----------------------------
  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashed,
        role: "DOCTOR",
      },
    });
  } catch (err) {
    const code = err?.code || err?.original?.code;
    if (code === "P2002") {
      const target = err?.meta?.target || err?.original?.meta?.target;
      if (
        (Array.isArray(target) ? target.join(",") : String(target)).includes(
          "email"
        )
      ) {
        throw new Error("Email already in use");
      }
    }
    throw err;
  }

  // ----------------------------
  // Gestion de la spécialisation
  // ----------------------------
  let specializationRecord;
  try {
    if (payload.specializationId) {
      specializationRecord = await prisma.specialization.findUnique({
        where: { id: Number(payload.specializationId) },
      });
      if (!specializationRecord) throw new Error("specializationId not found");
    } else {
      const name = String(payload.specialization).trim();
      specializationRecord = await prisma.specialization.findUnique({
        where: { name },
      });
      if (!specializationRecord) {
        specializationRecord = await prisma.specialization.create({
          data: { name },
        });
      }
    }
  } catch (err) {
    // Supprimer user si spécialisation invalide
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    throw err;
  }

  // ----------------------------
  // Créer le record Doctor
  // ----------------------------
  const doctor = await prisma.doctor.create({
    data: {
      userId: user.id,
      clinicId,
      specializationId: specializationRecord.id,
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
      specialization: true,
      clinic: true,
    },
  });

  // ----------------------------
  // Envoyer email
  // ----------------------------
  await sendEmail({
    to: payload.email,
    subject: "Votre compte Médecin - MedFlow",
    text: `Bonjour ${
      payload.name
    },\nVotre compte médecin a été créé pour la clinique ${
      doctor.clinic?.name || ""
    }.\nEmail: ${payload.email}\nMot de passe temporaire: ${tempPassword}`,
    html: `<p>Bonjour ${
      payload.name
    },</p><p>Votre compte médecin a été créé pour la clinique <strong>${
      doctor.clinic?.name || ""
    }</strong>.</p><ul><li><strong>Email:</strong> ${
      payload.email
    }</li><li><strong>Mot de passe temporaire:</strong> ${tempPassword}</li></ul><p>Merci, MedFlow</p>`,
  });

  return doctor;
}

/** Get doctors with optional search, specialization name, clinic filter and pagination */

// tokenJWT doit être passé depuis l'API (req.headers.authorization)
export async function getDoctors(
  tokenJWT,
  { search = "", page = 1, limit = 10, specialization = "" } = {}
) {
  if (!tokenJWT) throw new Error("Token is required");

  // Décoder le token pour récupérer l'adminUserId
  const token = tokenJWT.replace("Bearer ", "");
  const payloadBase64 = token.split(".")[1];
  const decodedPayload = JSON.parse(
    Buffer.from(payloadBase64, "base64").toString()
  );
  const adminUserId = decodedPayload.id;
  if (!adminUserId) throw new Error("Invalid token payload");

  // Récupérer la clinicId de l'admin
  const adminRecord = await prisma.adminClinic.findFirst({
    where: { userId: adminUserId },
    select: { clinicId: true },
  });
  if (!adminRecord) throw new Error("Admin clinic not found");
  const clinicId = adminRecord.clinicId;

  // Pagination
  const skip = (page - 1) * limit;

  // Normalisation
  const q = (search || "").toString().trim();
  const spec = (specialization || "").toString().trim();

  // Construction du where pour Prisma
  const where = {
    clinicId, // uniquement les docteurs de la même clinique
    isActive: true,
    ...(q && {
      OR: [
        { user: { is: { name: { contains: q, mode: "insensitive" } } } },
        { user: { is: { email: { contains: q, mode: "insensitive" } } } },
      ],
    }),
    ...(spec && {
      specialization: { is: { name: { contains: spec, mode: "insensitive" } } },
    }),
  };

  const total = await prisma.doctor.count({ where });

  const data = await prisma.doctor.findMany({
    where,
    include: { user: true, specialization: true, clinic: true },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  // Mapper pour retourner les infos utiles
  const mappedData = data.map((doc) => ({
    id: doc.id,
    userId: doc.userId,
    clinicId: doc.clinicId,
    specializationId: doc.specializationId,
    specializationName: doc.specialization?.name || null,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    name: doc.user?.name || null,
    email: doc.user?.email || null,
  }));

  return { data: mappedData, total, page, limit };
}

/** Update doctor info */
export async function updateDoctor(id, data) {
  if (!id) throw new Error("doctor id is required for update");
  const parsed = updateUserSchema.parse(data);
  const userData = {};
  if (parsed.name) userData.name = parsed.name;
  if (parsed.email) userData.email = parsed.email;
  if (parsed.password)
    userData.password = await bcrypt.hash(parsed.password, 10);

  try {
    return await prisma.doctor.update({
      where: { id: Number(id) },
      data: { user: { update: userData } },
      include: { user: true },
    });
  } catch (err) {
    const code = err?.code || err?.original?.code;
    if (code === "P2002") {
      const target = err?.meta?.target || err?.original?.meta?.target;
      if (
        (Array.isArray(target) ? target.join(",") : String(target)).includes(
          "email"
        )
      )
        throw new Error("Email already in use");
    }
    throw err;
  }
}

/** Delete (deactivate) doctor */
export async function deleteDoctor(doctorId) {
  if (!doctorId) throw new Error("Doctor id is required");
  const doctor = await prisma.doctor.findUnique({
    where: { id: Number(doctorId) },
    include: { user: true },
  });
  if (!doctor) throw new Error("Doctor not found");
  await prisma.doctor.update({
    where: { id: Number(doctorId) },
    data: { isActive: false },
  });
  return { message: "Doctor deactivated successfully" };
}

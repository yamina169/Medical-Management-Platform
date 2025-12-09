// /actions/receptionists.js
"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { registerSchema, updateUserSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/email";

/**
 * Register a receptionist linked to an admin's clinic
 */
export async function registerReceptionist(payload, adminUserId) {
  if (!adminUserId) throw new Error("Admin userId is required");

  const validation = registerSchema.safeParse(payload);
  if (!validation.success) {
    const errors = validation.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new Error(`Validation failed: ${errors}`);
  }

  // Get admin clinic
  const adminRecord = await prisma.adminClinic.findFirst({
    where: { userId: adminUserId },
    include: { clinic: true },
  });

  if (!adminRecord?.clinic?.id)
    throw new Error("No clinic associated with this admin");
  const clinicId = adminRecord.clinic.id;

  const tempPassword = crypto.randomBytes(4).toString("hex");
  const hashed = await bcrypt.hash(tempPassword, 10);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashed,
        role: "RECEPTIONIST",
      },
    });
  } catch (err) {
    const code = err?.code || err?.original?.code;
    if (code === "P2002" && (err?.meta?.target || []).includes("email")) {
      throw new Error("Email already in use");
    }
    throw err;
  }

  const receptionist = await prisma.receptionist.create({
    data: {
      userId: user.id,
      clinicId,
      isActive: true,
    },
    include: { user: true, clinic: true },
  });

  await sendEmail({
    to: payload.email,
    subject: "Votre compte Réceptionniste - MedFlow",
    text: `Bonjour ${payload.name},\nVotre compte réceptionniste a été créé pour la clinique ${receptionist.clinic.name}.\nEmail: ${payload.email}\nMot de passe temporaire: ${tempPassword}`,
    html: `<p>Bonjour ${payload.name},</p><p>Votre compte réceptionniste a été créé pour la clinique <strong>${receptionist.clinic.name}</strong>.</p><ul><li><strong>Email:</strong> ${payload.email}</li><li><strong>Mot de passe temporaire:</strong> ${tempPassword}</li></ul><p>Merci, MedFlow</p>`,
  });

  return receptionist;
}

export async function getReceptionists({
  search = "",
  page = 1,
  limit = 10,
  clinicId,
} = {}) {
  const skip = (page - 1) * limit;
  const q = search.trim();

  const where = {
    ...(clinicId && { clinicId }),
    isActive: true,
    ...(q && {
      OR: [
        { user: { is: { name: { contains: q, mode: "insensitive" } } } },
        { user: { is: { email: { contains: q, mode: "insensitive" } } } },
      ],
    }),
  };

  const total = await prisma.receptionist.count({ where });

  const data = await prisma.receptionist.findMany({
    where,
    include: { user: true, clinic: true },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const mapped = data.map((r) => ({
    id: r.id,
    userId: r.userId,
    clinicId: r.clinicId,
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    name: r.user?.name || null,
    email: r.user?.email || null,
  }));

  return { data: mapped, total, page, limit };
}

export async function updateReceptionist(id, data) {
  if (!id) throw new Error("Receptionist id is required");
  const parsed = updateUserSchema.parse(data);
  const userData = {};
  if (parsed.name) userData.name = parsed.name;
  if (parsed.email) userData.email = parsed.email;
  if (parsed.password)
    userData.password = await bcrypt.hash(parsed.password, 10);

  try {
    return await prisma.receptionist.update({
      where: { id: Number(id) },
      data: { user: { update: userData } },
      include: { user: true },
    });
  } catch (err) {
    const code = err?.code || err?.original?.code;
    if (code === "P2002" && (err?.meta?.target || []).includes("email"))
      throw new Error("Email already in use");
    throw err;
  }
}

export async function deleteReceptionist(id) {
  if (!id) throw new Error("Receptionist id is required");
  await prisma.receptionist.update({
    where: { id: Number(id) },
    data: { isActive: false },
  });
  return { message: "Receptionist deactivated successfully" };
}

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

  const { name, email } = payload;

  if (!name || !email) throw new Error("Name and email are required");

  // Get admin clinic
  const adminRecord = await prisma.adminClinic.findFirst({
    where: { userId: adminUserId },
    include: { clinic: true },
  });
  if (!adminRecord || !adminRecord.clinic)
    throw new Error("Admin clinic not found");

  const clinicId = adminRecord.clinic.id;

  // Generate temp password
  const tempPassword = crypto.randomBytes(4).toString("hex");
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "RECEPTIONIST",
    },
  });

  // Create receptionist
  const receptionist = await prisma.receptionist.create({
    data: {
      userId: user.id,
      clinicId,
      isActive: true,
    },
    include: { user: true, clinic: true },
  });

  // Send email
  await sendEmail({
    to: email,
    subject: "Votre compte Réceptionniste - MedFlow",
    text: `Bonjour ${name},\nVotre compte réceptionniste a été créé pour la clinique ${receptionist.clinic.name}.\nEmail: ${email}\nMot de passe temporaire: ${tempPassword}`,
    html: `<p>Bonjour ${name},</p><p>Votre compte réceptionniste a été créé pour la clinique <strong>${receptionist.clinic.name}</strong>.</p><ul><li><strong>Email:</strong> ${email}</li><li><strong>Mot de passe temporaire:</strong> ${tempPassword}</li></ul><p>Merci, MedFlow</p>`,
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

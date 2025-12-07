"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { loginSchema } from "@/lib/validation";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Vérifie les credentials et retourne un JWT + infos utilisateur
 */
export async function verifyLogin(rawInput) {
  // === Validation avec Zod ===
  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    const message = parsed.error.errors
      .map((e) => `${e.path.join(".") || "input"}: ${e.message}`)
      .join("; ");
    throw new Error(message);
  }

  const { email, password } = parsed.data;

  // === Recherche de l'utilisateur ===
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) throw new Error("Invalid credentials");

  // === Vérification du mot de passe ===
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Invalid credentials");

  // === Vérifier si le compte est actif pour certains rôles ===
  if (["DOCTOR", "RECEPTIONIST", "ADMIN_CLINIC"].includes(user.role)) {
    let roleRecord;
    switch (user.role) {
      case "DOCTOR":
        roleRecord = await prisma.doctor.findUnique({
          where: { userId: user.id },
        });
        break;
      case "RECEPTIONIST":
        roleRecord = await prisma.receptionist.findUnique({
          where: { userId: user.id },
        });
        break;
      case "ADMIN_CLINIC":
        roleRecord = await prisma.adminClinic.findUnique({
          where: { userId: user.id },
        });
        break;
    }
    if (!roleRecord || !roleRecord.isActive) {
      throw new Error(
        "Votre compte n'est pas actif. Veuillez contacter l'administrateur."
      );
    }
  }

  // === Création du token JWT ===
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" } // expire dans 1 jour
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

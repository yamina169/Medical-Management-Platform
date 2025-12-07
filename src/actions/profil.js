import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { updateUserSchema } from "@/lib/validation";
import bcrypt from "bcrypt"; // ✅ Ajouter cette ligne

export async function updateUserProfile(userId, data) {
  if (!userId) throw new Error("userId is required");

  // Validation avec Zod
  const parsed = updateUserSchema.parse(data);

  const payload = {};
  if (parsed.name) payload.name = parsed.name;
  if (parsed.email) payload.email = parsed.email;
  if (parsed.password) {
    const hashed = await bcrypt.hash(parsed.password, 10); // Hash du mot de passe
    payload.password = hashed;
  }
  payload.updatedAt = new Date();

  const updatedUser = await prisma.user.update({
    where: { id: Number(userId) },
    data: payload,
    select: { id: true, name: true, email: true, updatedAt: true },
  });

  return updatedUser;
}

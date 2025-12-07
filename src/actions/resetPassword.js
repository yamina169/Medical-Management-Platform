import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/lib/email";
import { requestResetSchema, resetSchema } from "@/lib/validation";

const SALT_ROUNDS = 10;
const RESET_SECRET = process.env.RESET_SECRET || "resetsecret"; // à mettre en .env

// === Request password reset ===
export async function requestPasswordReset(rawInput) {
  // Validation Zod (sécurisée si parsed.error undefined)
  const parsed = requestResetSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errs = parsed.error?.errors ?? [];
    const message =
      errs
        .map((e) => `${e.path.join(".") || "input"}: ${e.message}`)
        .join("; ") || "Validation invalide";
    throw new Error(message);
  }

  const { email: rawEmail } = parsed.data;
  const email = String(rawEmail).toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Aucun utilisateur trouvé pour cet email");

  // Générer token JWT temporaire
  const token = jwt.sign({ userId: user.id }, RESET_SECRET, {
    expiresIn: "1h",
  });

  const resetUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/reset-password?token=${encodeURIComponent(
    token
  )}&email=${encodeURIComponent(email)}`;

  // Envoi email (catch possible erreur d'envoi)
  try {
    await sendEmail({
      to: email,
      subject: "Demande de réinitialisation de mot de passe",
      text: `Pour réinitialiser votre mot de passe, cliquez sur : ${resetUrl}`,
      html: `<p>Pour réinitialiser votre mot de passe, cliquez sur : <a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  } catch (e) {
    console.error("❌ sendEmail error:", e);
    // Ne pas exposer l'erreur d'email à l'utilisateur en clair
    throw new Error("Impossible d'envoyer l'email de réinitialisation");
  }

  return { ok: true, token };
}

// === Reset password ===
export async function resetPassword(rawInput) {
  const parsed = resetSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errs = parsed.error?.errors ?? [];
    const message =
      errs
        .map((e) => `${e.path.join(".") || "input"}: ${e.message}`)
        .join("; ") || "Validation invalide";
    throw new Error(message);
  }

  const { token, newPassword } = parsed.data;

  let payload;
  try {
    payload = jwt.verify(token, RESET_SECRET);
  } catch (err) {
    console.error("❌ jwt.verify error:", err);
    throw new Error("Token invalide ou expiré");
  }

  // payload peut être string ou object, gérer les deux cas
  const userId =
    typeof payload === "object" && payload !== null ? payload.userId : null;
  if (!userId) throw new Error("Token invalide (userId manquant)");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur introuvable");

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  // Notifier l'utilisateur
  try {
    await sendEmail({
      to: user.email,
      subject: "Mot de passe modifié",
      text: `Votre mot de passe a bien été modifié.`,
      html: `<p>Votre mot de passe a bien été modifié. Si vous n'êtes pas à l'origine de ce changement, contactez le support.</p>`,
    });
  } catch (e) {
    console.error("❌ sendEmail after reset error:", e);
    // On laisse l'opération réussir même si l'email échoue
  }

  return { ok: true };
}

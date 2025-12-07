// src/actions/register.js
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/email";

const SALT_ROUNDS = 10;

// Durée des plans d'abonnement en mois
const SUBSCRIPTION_DURATION_MONTHS = { FREE: 0, PRO: 3, ENTERPRISE: 12 };

/**
 * Fonction pour enregistrer un utilisateur selon son rôle
 */
export async function registerUser(rawInput) {
  if (!rawInput || typeof rawInput !== "object") {
    throw new Error("Input missing or invalid");
  }

  // Validation Zod
  const parsed = registerSchema.safeParse(rawInput);
  if (!parsed.success) {
    const message = parsed.error.errors
      .map((e) => `${e.path.join(".") || "input"}: ${e.message}`)
      .join("; ");
    throw new Error(message);
  }

  const {
    name,
    email,
    password,
    role,
    clinic: clinicData,
    clinicId,
    specialization,
    registeredBy,
  } = parsed.data;

  // Vérification email unique
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use");

  const generatedPassword = password || Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(generatedPassword, SALT_ROUNDS);

  // Transaction Prisma pour créer user + clinic (optionnelle) + role spécifique
  const result = await prisma.$transaction(async (tx) => {
    // 1) Créer l'utilisateur central
    const user = await tx.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    // 2) Gestion ADMIN_CLINIC
    if (role === "ADMIN_CLINIC") {
      let clinic = null;

      if (role === "ADMIN_CLINIC") {
        let clinic = null;

        if (clinicData) {
          // Vérifier unicité du nom
          const existingClinic = await tx.clinic.findUnique({
            where: { name: clinicData.name },
          });
          if (existingClinic)
            throw new Error("Clinic with this name already exists");

          // Vérifier unicité du taxId
          const existingTaxId = await tx.clinic.findUnique({
            where: { taxId: clinicData.taxId },
          });
          if (existingTaxId)
            throw new Error("Clinic with this taxId already exists");

          const now = new Date();
          let subscriptionStart = now;
          let subscriptionEnd = now;
          let subscriptionStatus = "ACTIVE"; // par défaut TRIAL

          if (clinicData.subscriptionType === "FREE") {
            subscriptionStatus = "ACTIVE";
            subscriptionEnd = null; // pas de fin pour FREE
          } else {
            // Pour PRO ou ENTERPRISE, calculer fin selon durée du plan
            const months =
              SUBSCRIPTION_DURATION_MONTHS[clinicData.subscriptionType] || 0;
            subscriptionEnd = new Date(now.setMonth(now.getMonth() + months));
          }

          // Création clinique
          clinic = await tx.clinic.create({
            data: {
              name: clinicData.name,
              taxId: clinicData.taxId,
              address: clinicData.address || null,
              phone: clinicData.phone || null,
              subscriptionType: clinicData.subscriptionType,
              subscriptionStart,
              subscriptionEnd,
              subscriptionStatus,
            },
          });
        }

        const adminClinic = await tx.adminClinic.create({
          data: {
            userId: user.id,
            clinicId: clinic ? clinic.id : clinicId || null,
            isActive: false, // reste false jusqu'à activation
          },
        });

        return { user, adminClinic, clinic, generatedPassword };
      }

      const adminClinic = await tx.adminClinic.create({
        data: {
          userId: user.id,
          clinicId: clinic ? clinic.id : clinicId || null,
          isActive: false, // reste false jusqu'à activation
        },
      });

      return { user, adminClinic, clinic, generatedPassword };
    }

    // 3) Gestion DOCTOR
    if (role === "DOCTOR") {
      if (!clinicId || !specialization)
        throw new Error("clinicId and specialization required for doctor");

      const doctor = await tx.doctor.create({
        data: { userId: user.id, clinicId, specialization, isActive: true },
      });
      return { user, doctor, generatedPassword };
    }

    // 4) Gestion RECEPTIONIST
    if (role === "RECEPTIONIST") {
      if (!clinicId) throw new Error("clinicId required for receptionist");

      const receptionist = await tx.receptionist.create({
        data: { userId: user.id, clinicId, isActive: true },
      });
      return { user, receptionist, generatedPassword };
    }

    // 5) Gestion PATIENT
    if (role === "PATIENT") {
      if (!clinicId || !registeredBy)
        throw new Error("clinicId and registeredBy required for patient");

      const patient = await tx.patient.create({
        data: { userId: user.id, clinicId, registeredBy },
      });
      return { user, patient, generatedPassword };
    }

    // 6) Gestion SUPERADMIN
    if (role === "SUPERADMIN") {
      const superAdmin = await tx.superAdmin.create({
        data: { userId: user.id },
      });
      return { user, superAdmin, generatedPassword };
    }

    return { user, generatedPassword };
  }); // fin transaction

  // 7) Envoi email hors transaction
  await sendEmail({
    to: email,
    subject: "Votre compte a été créé",
    text: `Bonjour ${name},\n\nVotre compte a été créé.\nEmail: ${email}\nMot de passe: ${result.generatedPassword}`,
  });

  return { message: "Création réussie", ...result };
}

/**
 * Activer un compte AdminClinic par un SuperAdmin
 */

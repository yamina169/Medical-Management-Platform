import { z } from "zod";

// === Enum pour les plans d'abonnement ===
export const subscriptionTypeEnum = z.enum(["FREE", "PRO", "ENTERPRISE"]);

// === Roles disponibles ===
export const roles = [
  "PATIENT",
  "DOCTOR",
  "RECEPTIONIST",
  "ADMIN_CLINIC",
  "SUPERADMIN",
];

/**
 * Register schema: validations générales + règles spécifiques selon role
 */
export const registerSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6).optional(),
    role: z
      .enum(["PATIENT", "DOCTOR", "RECEPTIONIST", "ADMIN_CLINIC", "SUPERADMIN"])
      .default("PATIENT"),
    clinicId: z.number().int().positive().optional(),
    registeredBy: z.number().int().positive().optional(),
    specialization: z.string().min(1).optional(),
    // Nouvelle clinique pour AdminClinic
    clinic: z
      .object({
        name: z.string().min(1),
        taxId: z.string().min(1, "Matricule fiscale requis"),
        address: z.string().optional(),
        phone: z.string().optional(),
        subscriptionType: subscriptionTypeEnum,
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // ADMIN_CLINIC: doit fournir soit clinic (nouvelle) soit clinicId (existante)
    if (data.role === "ADMIN_CLINIC" && !data.clinic && !data.clinicId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Pour ADMIN_CLINIC, fournir clinic (nouvelle) ou clinicId (existante)",
        path: ["clinic"],
      });
    }

    // Si clinic est fourni, taxId obligatoire
    if (data.role === "ADMIN_CLINIC" && data.clinic && !data.clinic.taxId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Matricule fiscale obligatoire pour ADMIN_CLINIC",
        path: ["clinic", "taxId"],
      });
    }

    // Doctor requires clinicId and specialization
    if (data.role === "DOCTOR") {
      if (!data.clinicId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "clinicId est requis pour DOCTOR",
          path: ["clinicId"],
        });
      }
      if (!data.specialization) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "specialization est requis pour DOCTOR",
          path: ["specialization"],
        });
      }
    }

    // Receptionist requires clinicId
    if (data.role === "RECEPTIONIST" && !data.clinicId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "clinicId est requis pour RECEPTIONIST",
        path: ["clinicId"],
      });
    }

    // SUPERADMIN n'a pas besoin de clinicId ou registeredBy
  });

/** login */
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

/** request reset */
export const requestResetSchema = z.object({
  email: z.string().email("Email invalide"),
});

/** reset password */
export const resetSchema = z.object({
  token: z.string().min(1, "Token requis"),
  newPassword: z.string().min(6, "Mot de passe trop court"),
});

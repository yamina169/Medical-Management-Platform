// /lib/validation.js
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

/**
 * ===== validations partagées pour clinics (migrées depuis actions/clinics.js) =====
 */

/** subscriptionStatus enum (exporté pour réutilisation) */
export const subscriptionStatusEnum = z.enum([
  "ACTIVE",
  "PENDING_PAYMENT",
  "EXPIRED",
  "TRIAL",
]);

/**
 * Query params pour getClinics (coercition + defaults)
 * - page, limit: coercés en integer >= 1
 * - search: string
 * - sort: string (ex: "createdAt:desc")
 */
export const getClinicsQuerySchema = z.object({
  page: z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return 1;
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(1, Math.trunc(n)) : 1;
  }, z.number().int().min(1)),
  limit: z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return 10;
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(1, Math.trunc(n)) : 10;
  }, z.number().int().min(1)),
  search: z.preprocess((v) => (v == null ? "" : String(v)), z.string()),
  sort: z.preprocess(
    (v) => (v == null ? "createdAt:desc" : String(v)),
    z.string()
  ),
});

/**
 * Payload pour updateClinic
 * - accepte ISO strings ou Date pour subscriptionStart / subscriptionEnd
 * - vérifie qu'au moins un champ est fourni
 */
export const updateClinicSchema = z
  .object({
    name: z.string().min(1).optional(),
    taxId: z.string().min(1).optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    subscriptionType: subscriptionTypeEnum.optional(),
    subscriptionStatus: subscriptionStatusEnum.optional(),
    subscriptionStart: z.preprocess((v) => {
      if (v == null) return undefined;
      const d = v instanceof Date ? v : new Date(String(v));
      return isNaN(d.getTime()) ? undefined : d;
    }, z.date().optional()),
    subscriptionEnd: z.preprocess((v) => {
      if (v == null) return undefined;
      const d = v instanceof Date ? v : new Date(String(v));
      return isNaN(d.getTime()) ? undefined : d;
    }, z.date().optional()),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour",
  });

// /lib/validation.js (ajouter à la fin)
export const updateUserSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour",
  });

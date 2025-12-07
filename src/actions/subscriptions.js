import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { updateClinicSchema, subscriptionStatusEnum } from "@/lib/validation";

export const SUBSCRIPTION_DURATION_MONTHS = {
  FREE: 1,
  PRO: 3,
  ENTERPRISE: 12,
};

export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Met à jour automatiquement les subscriptions selon la date et le type
 */
export async function autoUpdateSubscriptions() {
  const now = new Date();

  // 1) FREE subscriptions → toujours ACTIVE ou TRIAL
  const freeClinics = await prisma.clinic.findMany({
    where: { subscriptionType: "FREE" },
  });

  for (const clinic of freeClinics) {
    const start = clinic.subscriptionStart || now;
    const end =
      clinic.subscriptionEnd ||
      addMonths(start, SUBSCRIPTION_DURATION_MONTHS.FREE);

    const payload = {
      subscriptionStatus: "ACTIVE",
      subscriptionStart: start,
      subscriptionEnd: end,
    };

    const parsed = updateClinicSchema.safeParse(payload);
    if (!parsed.success) {
      console.error(
        "Validation failed for FREE clinic:",
        clinic.id,
        parsed.error
      );
      continue;
    }

    await prisma.clinic.update({ where: { id: clinic.id }, data: parsed.data });
  }

  // 2) Expire subscriptions dépassées
  await expireOverdueSubscriptions();

  // 3) Envoie alertes pour les abonnements proches de la fin
  const alerts = await sendSubscriptionExpiryAlerts(7);

  return { updatedFree: freeClinics.length, alerts };
}

/**
 * Marque les cliniques EXPIRED si subscriptionEnd dépassé
 */
export async function expireOverdueSubscriptions() {
  const now = new Date();

  const clinics = await prisma.clinic.findMany({
    where: {
      subscriptionEnd: { lt: now },
      subscriptionStatus: { not: "EXPIRED" },
    },
    include: { admins: { include: { user: true } } },
  });

  for (const clinic of clinics) {
    const payload = { subscriptionStatus: "EXPIRED" };
    const parsed = updateClinicSchema.safeParse(payload);
    if (!parsed.success) continue;

    await prisma.clinic.update({ where: { id: clinic.id }, data: parsed.data });

    const adminEmails =
      clinic.admins?.map((a) => a.user?.email).filter(Boolean) || [];
    const subject = `Votre abonnement pour ${clinic.name} est expiré`;
    const body = `Bonjour,

Votre abonnement pour la clinique "${
      clinic.name
    }" est expiré depuis le ${clinic.subscriptionEnd?.toISOString()}.
Merci de renouveler pour réactiver les services.

Cordialement,
L'équipe MedFlow`;

    for (const to of adminEmails) {
      await sendEmail({ to, subject, text: body });
    }
  }

  return clinics.map((c) => ({ clinicId: c.id, notified: c.admins.length }));
}

/**
 * Envoie des alertes aux admins pour les abonnements arrivant à expiration
 */
export async function sendSubscriptionExpiryAlerts(daysBefore = 7) {
  const now = new Date();
  const upper = new Date();
  upper.setDate(now.getDate() + daysBefore);

  const clinics = await prisma.clinic.findMany({
    where: {
      subscriptionEnd: { gte: now, lte: upper },
      subscriptionStatus: { not: "EXPIRED" },
    },
    include: {
      admins: { include: { user: true } },
    },
  });

  for (const clinic of clinics) {
    const adminEmails =
      clinic.admins?.map((a) => a.user?.email).filter(Boolean) || [];
    const subject = `Alerte: abonnement bientôt expiré pour ${clinic.name}`;
    const body = `Bonjour,

L'abonnement de la clinique "${
      clinic.name
    }" expire le ${clinic.subscriptionEnd?.toISOString()}.
Merci de renouveler le paiement pour éviter toute interruption.

Type d'abonnement: ${clinic.subscriptionType}
Statut actuel: ${clinic.subscriptionStatus}

Lien pour payer: <LIEN_DE_PAIEMENT>

Cordialement,
L'équipe MedFlow`;

    for (const to of adminEmails) {
      await sendEmail({ to, subject, text: body });
    }
  }

  return clinics.map((c) => ({ clinicId: c.id, notified: c.admins.length }));
}

/**
 * Active un abonnement après paiement
 */
export async function activateSubscription(clinicId) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: Number(clinicId) },
  });
  if (!clinic) throw new Error("Clinic not found");

  const now = new Date();
  const start = clinic.subscriptionStart || now;
  const end =
    clinic.subscriptionEnd ||
    addMonths(
      start,
      SUBSCRIPTION_DURATION_MONTHS[clinic.subscriptionType] || 0
    );

  const payload = {
    subscriptionStatus: "ACTIVE",
    subscriptionStart: start,
    subscriptionEnd: end,
  };

  const parsed = updateClinicSchema.safeParse(payload);
  if (!parsed.success) throw new Error("Invalid subscription data");

  const updated = await prisma.clinic.update({
    where: { id: clinic.id },
    data: parsed.data,
  });

  // notify admins
  const admins = await prisma.adminClinic.findMany({
    where: { clinicId: clinic.id },
    include: { user: true },
  });
  for (const a of admins) {
    await sendEmail({
      to: a.user.email,
      subject: `Abonnement activé pour ${clinic.name}`,
      text: `Votre abonnement ${
        clinic.subscriptionType
      } a été activé. Fin prévue: ${end.toISOString()}`,
    });
  }

  return updated;
}
// 🔍 Filtrer les abonnements
export async function getFilteredSubscriptions({
  page = 1,
  limit = 10,
  search = "",
  type = "",
  status = "",
}) {
  const skip = (page - 1) * limit;

  const where = {};

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  if (type) {
    where.subscriptionType = type;
  }

  if (status) {
    where.subscriptionStatus = status;
  }

  const [clinics, total] = await Promise.all([
    prisma.clinic.findMany({
      where,
      include: { admins: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.clinic.count({ where }),
  ]);

  return { clinics, total };
}

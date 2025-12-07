// /actions/subscriptions.js

import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { updateClinicSchema } from "@/lib/validation";

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

export async function autoUpdateSubscriptions() {
  const now = new Date();

  // Update FREE subscriptions
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
    if (!parsed.success) continue;

    await prisma.clinic.update({ where: { id: clinic.id }, data: parsed.data });
  }

  await expireOverdueSubscriptions();
  await sendSubscriptionExpiryAlerts(7);
}

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
    const body = `Bonjour,\n\nVotre abonnement pour la clinique "${
      clinic.name
    }" est expiré depuis le ${clinic.subscriptionEnd?.toISOString()}.\nMerci de renouveler pour réactiver les services.\n\nCordialement,\nL'équipe MedFlow`;

    for (const to of adminEmails) {
      await sendEmail({ to, subject, text: body });
    }
  }

  return clinics.map((c) => ({ clinicId: c.id, notified: c.admins.length }));
}

export async function sendSubscriptionExpiryAlerts(daysBefore = 7) {
  const now = new Date();
  const upper = new Date();
  upper.setDate(now.getDate() + daysBefore);

  const clinics = await prisma.clinic.findMany({
    where: {
      subscriptionEnd: { gte: now, lte: upper },
      subscriptionStatus: { not: "EXPIRED" },
    },
    include: { admins: { include: { user: true } } },
  });

  for (const clinic of clinics) {
    const adminEmails =
      clinic.admins?.map((a) => a.user?.email).filter(Boolean) || [];
    const subject = `Alerte: abonnement bientôt expiré pour ${clinic.name}`;
    const body = `Bonjour,\n\nL'abonnement de la clinique "${
      clinic.name
    }" expire le ${clinic.subscriptionEnd?.toISOString()}.\nMerci de renouveler le paiement pour éviter toute interruption.\n\nType d'abonnement: ${
      clinic.subscriptionType
    }\nStatut actuel: ${
      clinic.subscriptionStatus
    }\n\nLien pour payer: <LIEN_DE_PAIEMENT>\n\nCordialement,\nL'équipe MedFlow`;

    for (const to of adminEmails) {
      await sendEmail({ to, subject, text: body });
    }
  }

  return clinics.map((c) => ({ clinicId: c.id, notified: c.admins.length }));
}

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

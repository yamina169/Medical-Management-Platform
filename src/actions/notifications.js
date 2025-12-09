// /actions/notifications.js
import prisma from "@/lib/prisma";

/**
 * Récupère les alertes pour le superadmin
 * - abonnements expirés ou expirant
 * - nouveaux comptes AdminClinic non activés
 */
export async function getSuperadminSubscriptionAlerts() {
  const now = new Date();
  const upcoming = new Date();
  upcoming.setDate(now.getDate() + 7);

  // Cliniques expirées
  const expiredClinics = await prisma.clinic.findMany({
    where: { subscriptionStatus: "EXPIRED" },
    select: { id: true, name: true, subscriptionEnd: true },
  });

  // Cliniques dont l'abonnement arrive à expiration
  const expiringClinics = await prisma.clinic.findMany({
    where: {
      subscriptionStatus: { not: "EXPIRED" },
      subscriptionEnd: { gte: now, lte: upcoming },
    },
    select: { id: true, name: true, subscriptionEnd: true },
  });

  // Nouveaux comptes AdminClinic non activés
  const pendingClinicAdmins = await prisma.user.findMany({
    where: {
      role: "ADMIN_CLINIC", // <- enum exact
      adminClinic: { isActive: false },
    },
    select: {
      id: true,
      name: true,
      email: true,
      adminClinic: {
        select: {
          clinicId: true,
        },
      },
    },
  });

  return {
    expired: expiredClinics,
    expiring: expiringClinics,
    pendingAdmins: pendingClinicAdmins,
  };
}

/**
 * Récupère les alertes pour un admin de clinique
 * - abonnement expiré
 * - abonnement expirant dans moins d'une semaine
 * @param {number} adminUserId - id de l'utilisateur ADMIN_CLINIC
 */
export async function getAdminClinicSubscriptionAlert(adminUserId) {
  // Récupérer la clinique de l'admin
  const adminRecord = await prisma.adminClinic.findFirst({
    where: { userId: adminUserId },
    select: { clinicId: true },
  });
  if (!adminRecord) {
    return { error: "Admin clinic not found" };
  }

  const clinicId = adminRecord.clinicId;
  const now = new Date();
  const upcoming = new Date();
  upcoming.setDate(now.getDate() + 7);

  // Récupérer la clinique
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: {
      id: true,
      name: true,
      subscriptionEnd: true,
      subscriptionStatus: true,
    },
  });

  if (!clinic) return { error: "Clinic not found" };

  let alert = null;

  if (clinic.subscriptionStatus === "EXPIRED") {
    alert = {
      type: "expired",
      message: `Votre abonnement pour la clinique "${clinic.name}" est expiré.`,
      subscriptionEnd: clinic.subscriptionEnd,
    };
  } else if (
    clinic.subscriptionEnd &&
    clinic.subscriptionEnd >= now &&
    clinic.subscriptionEnd <= upcoming
  ) {
    alert = {
      type: "expiring",
      message: `Votre abonnement pour la clinique "${
        clinic.name
      }" expirera le ${clinic.subscriptionEnd.toLocaleDateString()}.`,
      subscriptionEnd: clinic.subscriptionEnd,
    };
  }

  return alert;
}

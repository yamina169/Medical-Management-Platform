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

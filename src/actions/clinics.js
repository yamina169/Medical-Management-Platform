import prisma from "@/lib/prisma";
import { updateClinicSchema } from "@/lib/validation";

/** helper pour formatter les erreurs Zod */
function formatZodError(err) {
  if (!err || !err.errors) return String(err);
  return err.errors
    .map((e) => `${e.path.join(".") || "(root)"}: ${e.message}`)
    .join("; ");
}

/* ===========================================================
    1.   STATS GLOBALES  des clincs (SUPERADMIN DASHBOARD)
   =========================================================== */

/** Static prices for each subscription type */
const SUBSCRIPTION_PRICES = {
  FREE: 0,
  PRO: 150,
  ENTERPRISE: 280,
};

export async function getClinicsStats() {
  // Active clinics
  const activeClinics = await prisma.clinic.count({
    where: { isActive: true },
  });

  // Active subscriptions (PRO and ENTERPRISE)
  const activeSubscriptions = await prisma.clinic.count({
    where: {
      subscriptionType: { in: ["PRO", "ENTERPRISE"] },
      subscriptionStatus: "ACTIVE",
    },
  });

  // Fetch all PRO/ENTERPRISE subscriptions (any status)
  const subscriptions = await prisma.clinic.findMany({
    where: {
      subscriptionType: { in: ["PRO", "ENTERPRISE"] },
      subscriptionStart: { not: null },
    },
    select: {
      subscriptionType: true,
      subscriptionStart: true,
      subscriptionEnd: true,
    },
  });

  // Calculate revenue per month (only in the start month)
  const revenueMap = {}; // { "2025-01": 450, "2025-02": 300, ... }

  subscriptions.forEach((sub) => {
    const price = SUBSCRIPTION_PRICES[sub.subscriptionType] || 0;
    if (!sub.subscriptionStart) return;

    const start = new Date(sub.subscriptionStart);
    const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    revenueMap[key] = (revenueMap[key] || 0) + price;
  });

  // Convert revenueMap to an array sorted by month
  const monthlyRevenue = Object.keys(revenueMap)
    .sort()
    .map((month) => ({ month, revenue: revenueMap[month] }));

  return {
    activeClinics,
    activeSubscriptions,
    monthlyRevenue,
  };
}

/* ===========================================================
    2.   LISTE FILTRÉE DES CLINIQUES (SUPERADMIN PAGE)
   =========================================================== */
export async function getFilteredClinics({
  page = 1,
  limit = 10,
  search = "",
  sort = "createdAt:desc",
} = {}) {
  const take = Math.max(1, Number(limit));
  const skip = (page - 1) * take;

  const where = {
    isActive: true,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { taxId: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const total = await prisma.clinic.count({ where });

  const clinics = await prisma.clinic.findMany({
    where,
    skip,
    take,
    orderBy: {
      [sort.split(":")[0]]: sort.split(":")[1] === "asc" ? "asc" : "desc",
    },
    include: {
      admins: {
        where: { isActive: true },
        select: { user: { select: { email: true } } },
      },
    },
  });

  const dataWithAdminEmail = clinics.map((clinic) => ({
    ...clinic,
    adminEmail: clinic.admins[0]?.user?.email || "N/A",
    admins: undefined,
  }));

  return {
    meta: {
      total,
      page,
      limit: take,
      pages: Math.max(Math.ceil(total / take), 1),
    },
    data: dataWithAdminEmail,
  };
}

/* ===========================================================
    3.   GET CLINIC BY ID
   =========================================================== */
export async function getClinicById(id) {
  // ICI id = userId
  if (!id) throw new Error("User id is required");

  const userId = Number(id);
  if (isNaN(userId)) throw new Error("User id must be numeric");

  // 1) Trouver le clinicId depuis AdminClinic
  const adminRecord = await prisma.adminClinic.findUnique({
    where: { userId },
    select: { clinicId: true },
  });

  if (!adminRecord) {
    throw new Error("No clinic found for this user");
  }

  if (!adminRecord.clinicId) {
    throw new Error("User is admin but clinicId is null");
  }

  const clinicId = adminRecord.clinicId;

  // 2) Récupérer les infos de la clinique
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: {
      admins: { include: { user: true } },
      doctors: { include: { user: true } },
      receptionists: { include: { user: true } },
      patients: { include: { user: true } },
    },
  });

  if (!clinic) throw new Error("Clinic not found");

  // 3) Comptages (counts)
  // 3) Comptages (counts)
  const [
    adminsCount,
    doctorsCount,
    receptionistsCount,
    patientsCount,
    appointmentsCount,
    invoicesCount,
    invoices,
  ] = await Promise.all([
    prisma.adminClinic.count({
      where: { clinicId: clinic.id, isActive: true },
    }),
    prisma.doctor.count({ where: { clinicId: clinic.id, isActive: true } }),
    prisma.receptionist.count({
      where: { clinicId: clinic.id, isActive: true },
    }),
    prisma.patient.count({ where: { clinicId: clinic.id, isActive: true } }),
    prisma.appointment.count({ where: { clinicId: clinic.id } }),
    prisma.invoice.count({ where: { clinicId: clinic.id, status: "PAID" } }),
    prisma.invoice.findMany({
      where: { clinicId: clinic.id, status: "PAID" },
      select: { amount: true, createdAt: true },
    }),
  ]);

  // 4) Calcul total + revenue par mois
  const monthlyAmounts = {};
  let totalAmount = 0;

  invoices.forEach((inv) => {
    totalAmount += inv.amount;
    const d = new Date(inv.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    monthlyAmounts[key] = (monthlyAmounts[key] || 0) + inv.amount;
  });

  const revenueByMonth = Object.keys(monthlyAmounts)
    .sort()
    .map((month) => ({
      month,
      amount: monthlyAmounts[month],
    }));

  // 5) Retour formaté identique à ton ancienne version
  return {
    clinic: {
      ...clinic,
      adminEmail: clinic.admins[0]?.user?.email || "N/A",
      admins: undefined,
    },
    counts: {
      staff: adminsCount + doctorsCount + receptionistsCount,
      admins: adminsCount,
      doctors: doctorsCount,
      receptionists: receptionistsCount,
      patients: patientsCount,
      appointments: appointmentsCount,
      invoices: invoicesCount,
    },
    totals: {
      invoicesAmount: totalAmount,
      revenueByMonth,
    },
  };
}

/* ===========================================================
    4.   UPDATE CLINIC
   =========================================================== */
export async function updateClinic(userId, data) {
  if (!userId) throw new Error("User id is required");

  const idUser = Number(userId);
  if (isNaN(idUser)) throw new Error("User id must be numeric");

  // 1) Trouver le clinicId depuis AdminClinic
  const adminRecord = await prisma.adminClinic.findUnique({
    where: { userId: idUser },
    select: { clinicId: true },
  });

  if (!adminRecord || !adminRecord.clinicId) {
    throw new Error("No clinic found for this user");
  }

  const clinicId = adminRecord.clinicId;

  // 2) Valider les données
  const parsed = updateClinicSchema.parse(data);
  const payload = { ...parsed, updatedAt: new Date() };

  // 3) Mettre à jour la clinique
  const updatedClinic = await prisma.clinic.update({
    where: { id: clinicId },
    data: payload,
  });

  return updatedClinic;
}

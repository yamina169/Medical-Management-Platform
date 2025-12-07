import prisma from "@/lib/prisma";
import { getClinicsQuerySchema, updateClinicSchema } from "@/lib/validation";

/** helper pour formatter les erreurs Zod */
function formatZodError(err) {
  if (!err || !err.errors) return String(err);
  return err.errors
    .map((e) => `${e.path.join(".") || "(root)"}: ${e.message}`)
    .join("; ");
}

/**
 * Récupérer toutes les cliniques avec pagination, tri et recherche
 * Inclut l'email du premier admin actif
 */
export async function getClinics({
  page = 1,
  limit = 10,
  search = "",
  sort = "createdAt:desc",
} = {}) {
  const parsed = getClinicsQuerySchema.parse({ page, limit, search, sort });
  const take = parsed.limit;
  const skip = (parsed.page - 1) * take;

  const where = parsed.search
    ? {
        OR: [
          { name: { contains: parsed.search, mode: "insensitive" } },
          { taxId: { contains: parsed.search, mode: "insensitive" } },
        ],
      }
    : {};

  const total = await prisma.clinic.count({ where });

  const clinics = await prisma.clinic.findMany({
    where,
    skip,
    take,
    orderBy: {
      [parsed.sort.split(":")[0]]:
        parsed.sort.split(":")[1] === "asc" ? "asc" : "desc",
    },
    include: {
      admins: {
        where: { isActive: true }, // <-- seulement admins actifs
        select: {
          user: { select: { email: true } }, // récupérer email
        },
      },
    },
  });

  const dataWithAdminEmail = clinics.map((clinic) => ({
    ...clinic,
    adminEmail: clinic.admins[0]?.user?.email || "N/A",
    admins: undefined, // optionnel : supprimer la liste complète
  }));

  return {
    meta: {
      total,
      page: parsed.page,
      limit: take,
      pages: Math.max(Math.ceil(total / take), 1),
    },
    data: dataWithAdminEmail,
  };
}

/**
 * Récupérer les cliniques filtrées pour CLINIC_ADMIN ou liste publique
 * Inclut email du premier admin actif
 */
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

/**
 * Récupérer une clinique par ID
 */
export async function getClinicById(id) {
  if (!id) throw new Error("Clinic id is required");

  const clinic = await prisma.clinic.findUnique({
    where: { id: Number(id) },
    include: {
      admins: { include: { user: true } },
      doctors: { include: { user: true } },
      receptionists: { include: { user: true } },
      patients: { include: { user: true } },
    },
  });

  if (!clinic) throw new Error("Clinic not found");

  const [
    adminsCount,
    doctorsCount,
    receptionistsCount,
    patientsCount,
    appointmentsCount,
    invoicesCount,
    totalInvoicesAmount,
  ] = await Promise.all([
    prisma.adminClinic.count({ where: { clinicId: clinic.id } }),
    prisma.doctor.count({ where: { clinicId: clinic.id } }),
    prisma.receptionist.count({ where: { clinicId: clinic.id } }),
    prisma.patient.count({ where: { clinicId: clinic.id } }),
    prisma.appointment.count({ where: { clinicId: clinic.id } }),
    prisma.invoice.count({ where: { clinicId: clinic.id } }),
    prisma.invoice.aggregate({
      where: { clinicId: clinic.id },
      _sum: { amount: true },
    }),
  ]);

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
      invoicesAmount: totalInvoicesAmount._sum.amount ?? 0,
    },
  };
}

export async function updateClinic(id, data) {
  if (!id) throw new Error("clinic id is required");

  // Validation et update...
  const parsed = updateClinicSchema.parse(data);
  const payload = { ...parsed, updatedAt: new Date() };

  const updated = await prisma.clinic.update({
    where: { id: Number(id) },
    data: payload,
  });

  return updated;
}

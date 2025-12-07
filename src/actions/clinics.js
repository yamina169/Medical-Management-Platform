// src/actions/clinics.js
import prisma from "@/lib/prisma";
import { getClinicsQuerySchema, updateClinicSchema } from "@/lib/validation";

/** helper local pour formater erreurs Zod en message lisible */
function formatZodError(err) {
  if (!err || !err.errors) return String(err);
  return err.errors
    .map((e) => `${e.path.join(".") || "(root)"}: ${e.message}`)
    .join("; ");
}

/**
 * Récupère une page de clinics (pour SUPERADMIN).
 * options: { page, limit, search, sort }
 */
export async function getClinics({
  page = 1,
  limit = 10,
  search = "",
  sort = "createdAt:desc",
} = {}) {
  // validate / coerce query params using the schema from lib/validation
  const parsed = getClinicsQuerySchema.parse({ page, limit, search, sort });
  const take = parsed.limit;
  const p = parsed.page;
  const skip = (p - 1) * take;

  // simple search sur name/taxId
  const where = parsed.search
    ? {
        OR: [
          { name: { contains: parsed.search, mode: "insensitive" } },
          { taxId: { contains: parsed.search, mode: "insensitive" } },
        ],
      }
    : {};

  // parse sort e.g. createdAt:desc or name:asc
  let orderBy = { createdAt: "desc" };
  try {
    const [field, dir] = parsed.sort.split(":");
    orderBy = { [field]: dir === "asc" ? "asc" : "desc" };
  } catch (e) {
    // keep default
  }

  // total count pour pagination
  const total = await prisma.clinic.count({ where });

  const clinics = await prisma.clinic.findMany({
    where,
    orderBy,
    skip,
    take,
    select: {
      id: true,
      name: true,
      taxId: true,
      address: true,
      phone: true,
      subscriptionType: true,
      subscriptionStatus: true,
      subscriptionStart: true,
      subscriptionEnd: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // pour chaque clinic, calculer les counts (optimisable en batch si besoin)
  const clinicsWithCounts = await Promise.all(
    clinics.map(async (c) => {
      const [
        adminsCount,
        doctorsCount,
        receptionistsCount,
        patientsCount,
        appointmentsCount,
        invoicesCount,
      ] = await Promise.all([
        prisma.adminClinic.count({ where: { clinicId: c.id } }),
        prisma.doctor.count({ where: { clinicId: c.id } }),
        prisma.receptionist.count({ where: { clinicId: c.id } }),
        prisma.patient.count({ where: { clinicId: c.id } }),
        prisma.appointment.count({ where: { clinicId: c.id } }),
        prisma.invoice.count({ where: { clinicId: c.id } }),
      ]);

      return {
        ...c,
        counts: {
          staff: adminsCount + doctorsCount + receptionistsCount,
          admins: adminsCount,
          doctors: doctorsCount,
          receptionists: receptionistsCount,
          patients: patientsCount,
          appointments: appointmentsCount,
          invoices: invoicesCount,
        },
      };
    })
  );

  return {
    meta: {
      total,
      page: p,
      limit: take,
      pages: Math.ceil(total / take) || 1,
    },
    data: clinicsWithCounts,
  };
}

/**
 * Récupérer une clinic par id (avec counts et relations essentielles).
 * Si besoin d'autorisation côté route, gère là avant d'appeler cette fonction.
 */
export async function getClinicById(id) {
  if (!id) throw new Error("clinic id is required");

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

    // SOMME DES MONTANTS DES FACTURES
    prisma.invoice.aggregate({
      where: { clinicId: clinic.id },
      _sum: { amount: true },
    }),
  ]);

  return {
    clinic,
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

/**
 * Mettre à jour une clinic (patch)
 * data: { name, taxId, address, phone, subscriptionType, subscriptionStatus, subscriptionEnd, subscriptionStart }
 */
export async function updateClinic(id, data) {
  if (!id) throw new Error("clinic id is required");

  // validate payload with zod schema imported from lib/validation
  try {
    const parsed = updateClinicSchema.parse(data);

    // build payload only with validated fields
    const payload = {};
    for (const key of Object.keys(parsed)) {
      payload[key] = parsed[key];
    }
    payload.updatedAt = new Date();

    const updated = await prisma.clinic.update({
      where: { id: Number(id) },
      data: payload,
    });

    return updated;
  } catch (err) {
    // if zod validation failed, rethrow with a nicer message
    if (err.name === "ZodError") {
      throw new Error(formatZodError(err));
    }
    throw err;
  }
}

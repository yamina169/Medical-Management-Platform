import prisma from "@/lib/prisma";

/**
 * Récupère le medical record pour un doctor et un patient spécifique dans la même clinique
 */
export async function getMedicalRecordByPatient(patientId) {
  if (!patientId) throw new Error("PatientId is required");

  // Vérifie que le patient existe
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { userId: true },
  });
  if (!patient) throw new Error("Patient not found");

  // Récupère le record sans filtrer ni inclure le doctor
  const record = await prisma.medicalRecord.findFirst({
    where: { patientId },
    include: {
      patient: { select: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return null;

  return {
    id: record.id,
    description: record.description,
    prescriptions: record.prescriptions,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    patientName: record.patient.user.name,
    patientId: record.patientId,
  };
}

export async function updateMedicalRecord(id, data) {
  const record = await prisma.medicalRecord.findUnique({ where: { id } });
  if (!record) throw new Error("Medical record not found");

  return prisma.medicalRecord.update({ where: { id }, data });
}

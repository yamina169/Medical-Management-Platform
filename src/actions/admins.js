// Correct pour ton setup actuel
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { updateUserSchema } from "@/lib/validation";

// Activer un AdminClinic par SuperAdmin
export async function activateAdminClinicBySuperAdmin(adminId, superAdminId) {
  if (!adminId) throw new Error("adminId is required");
  if (!superAdminId) throw new Error("superAdminId is required");

  // Vérifier le SuperAdmin
  const superAdmin = await prisma.superAdmin.findUnique({
    where: { userId: superAdminId },
  });
  if (!superAdmin) throw new Error("SuperAdmin not found");

  // Récupérer l'AdminClinic avec sa clinique
  const adminClinic = await prisma.adminClinic.findUnique({
    where: { id: adminId },
    include: { clinic: true },
  });

  if (!adminClinic) throw new Error("AdminClinic not found");

  // Activer l'AdminClinic et sa clinique
  const updatedClinic = adminClinic.clinic
    ? await prisma.clinic.update({
        where: { id: adminClinic.clinic.id },
        data: { isActive: true, updatedAt: new Date() },
      })
    : null;

  const updatedAdminClinic = await prisma.adminClinic.update({
    where: { id: adminId },
    data: { isActive: true, updatedAt: new Date() },
  });

  // Notifier l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: updatedAdminClinic.userId },
  });

  if (user) {
    await sendEmail({
      to: user.email,
      subject: "Votre compte Admin Clinique est activé",
      text: `Bonjour ${user.name},\n\nVotre compte Admin Clinique a été activé par le SuperAdmin. Vous pouvez maintenant vous connecter.\n\nCordialement.`,
    });
  }

  return { updatedAdminClinic, updatedClinic };
}

export async function getAdminsClinic() {
  try {
    return await prisma.adminClinic.findMany({
      select: {
        id: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        clinic: {
          select: {
            id: true,
            name: true,
            taxId: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching ADMIN_CLINIC:", error);
    throw new Error("Failed to load Admin Clinics");
  }
}

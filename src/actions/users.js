// Correct pour ton setup actuel
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Activer un AdminClinic par SuperAdmin
export async function activateAdminClinicBySuperAdmin(adminId, superAdminId) {
  if (!adminId) throw new Error("adminId is required");
  if (!superAdminId) throw new Error("superAdminId is required");

  // Vérifier le SuperAdmin
  const superAdmin = await prisma.superAdmin.findUnique({
    where: { userId: superAdminId },
  });
  if (!superAdmin) throw new Error("SuperAdmin not found");

  // Activer l'AdminClinic
  const adminClinic = await prisma.adminClinic.update({
    where: { id: adminId },
    data: { isActive: true, updatedAt: new Date() },
  });

  // Notifier l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: adminClinic.userId },
  });

  if (user) {
    await sendEmail({
      to: user.email,
      subject: "Votre compte Admin Clinique est activé",
      text: `Bonjour ${user.name},\n\nVotre compte Admin Clinique a été activé par le SuperAdmin. Vous pouvez maintenant vous connecter.\n\nCordialement.`,
    });
  }

  return adminClinic;
}
export async function getUsersByRole(role) {
  if (!role) throw new Error("Role is required");

  switch (role) {
    case "SUPER_ADMIN":
      return await prisma.superAdmin.findMany({
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    case "ADMIN_CLINIC":
      return await prisma.adminClinic.findMany({
        select: {
          id: true,
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
              taxId: true, // Ajouté ici
            },
          },
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    case "DOCTOR":
      return await prisma.doctor.findMany({
        select: {
          id: true,
          specialty: true,
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
              taxId: true, // Ajouté ici
            },
          },
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    case "RECEPTIONIST":
      return await prisma.receptionist.findMany({
        select: {
          id: true,
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
              taxId: true, // Ajouté ici
            },
          },
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    case "PATIENT":
      return await prisma.patient.findMany({
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    default:
      throw new Error("Invalid role");
  }
}

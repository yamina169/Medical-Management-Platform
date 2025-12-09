import { prisma } from "@/lib/prisma";

// CREATE
export async function createSpecialization(data) {
  return await prisma.specialization.create({
    data,
  });
}

// READ ALL
export async function getSpecializations() {
  return await prisma.specialization.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// READ ONE
export async function getSpecializationById(id) {
  return await prisma.specialization.findUnique({
    where: { id: Number(id) },
  });
}

// UPDATE
export async function updateSpecialization(id, data) {
  return await prisma.specialization.update({
    where: { id: Number(id) },
    data,
  });
}

// DELETE
export async function deleteSpecialization(id) {
  return await prisma.specialization.delete({
    where: { id: Number(id) },
  });
}

import prisma from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const email = "rezguiyamina1692001@gmail.com";

  // Vérifier si le superAdmin existe déjà
  const existing = await prisma.superAdmin.findFirst({
    where: { user: { email } },
    include: { user: true },
  });

  if (existing) {
    console.log("SuperAdmin already exists");
    return;
  }

  // Créer le User
  const hashedPassword = await bcrypt.hash("SuperAdmin123!", 10);

  const user = await prisma.user.create({
    data: {
      name: "Yamina",
      email,
      password: hashedPassword,
      role: "SUPERADMIN",
    },
  });

  // Créer le SuperAdmin
  const superAdmin = await prisma.superAdmin.create({
    data: {
      userId: user.id,
    },
  });

  console.log("SuperAdmin created:", superAdmin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

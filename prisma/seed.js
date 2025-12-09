import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Fonction utilitaire pour hasher
async function hash(pwd) {
  return await bcrypt.hash(pwd, 10);
}

async function main() {
  console.log("🚀 Starting database seeding...");
  const now = new Date();

  // ===========================
  // USERS
  // ===========================
  const superAdminUser = await prisma.user.create({
    data: {
      name: "Yamina Rezgui",
      email: "rezguiyamina1692001@gmail.com",
      password: await hash("dadadada"),
      role: "SUPERADMIN",
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      name: "Yamina Rezgui",
      email: "yamina.rezgui01@gmail.com",
      password: await hash("dada"),
      role: "ADMIN_CLINIC",
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      name: "Mohamed Ben Ali",
      email: "mohamed.benali01@gmail.com",
      password: await hash("pwd123"),
      role: "ADMIN_CLINIC",
    },
  });

  // Doctors
  await prisma.user.createMany({
    data: [
      {
        name: "Ahmed Ben Ali",
        email: "ahmed.benali01@gmail.com",
        password: await hash("pwd1"),
        role: "DOCTOR",
      },
      {
        name: "Houssem Jebali",
        email: "houssem.jebali@gmail.com",
        password: await hash("pwd2"),
        role: "DOCTOR",
      },
      {
        name: "Rania Gharbi",
        email: "rania.gharbi@gmail.com",
        password: await hash("pwd3"),
        role: "DOCTOR",
      },
      {
        name: "Khaled Trabelsi",
        email: "khaled.trabelsi@gmail.com",
        password: await hash("pwd4"),
        role: "DOCTOR",
      },
      {
        name: "Sami Ben Youssef",
        email: "sami.by@gmail.com",
        password: await hash("pwd5"),
        role: "DOCTOR",
      },
    ],
  });

  // Receptionists
  await prisma.user.createMany({
    data: [
      {
        name: "Sami Trabelsi",
        email: "sami.trabelsi@gmail.com",
        password: await hash("pass1"),
        role: "RECEPTIONIST",
      },
      {
        name: "Nadia Ben Youssef",
        email: "nadia.by@gmail.com",
        password: await hash("pass2"),
        role: "RECEPTIONIST",
      },
      {
        name: "Leila Feki",
        email: "leila.feki@gmail.com",
        password: await hash("pass3"),
        role: "RECEPTIONIST",
      },
      {
        name: "Omar Gharbi",
        email: "omar.gharbi@gmail.com",
        password: await hash("pass4"),
        role: "RECEPTIONIST",
      },
    ],
  });

  // Patients
  await prisma.user.createMany({
    data: [
      {
        name: "Fatma Khaldi",
        email: "fatma.khaldi@gmail.com",
        password: await hash("pwd1"),
        role: "PATIENT",
      },
      {
        name: "Ali Hammami",
        email: "ali.hammami@gmail.com",
        password: await hash("pwd2"),
        role: "PATIENT",
      },
      {
        name: "Amira Feki",
        email: "amira.feki@gmail.com",
        password: await hash("pwd3"),
        role: "PATIENT",
      },
      {
        name: "Omar Ben Ali",
        email: "omar.benali@gmail.com",
        password: await hash("pwd4"),
        role: "PATIENT",
      },
      {
        name: "Salma Trabelsi",
        email: "salma.trabelsi@gmail.com",
        password: await hash("pwd5"),
        role: "PATIENT",
      },
      {
        name: "Khalil Feki",
        email: "khalil.feki@gmail.com",
        password: await hash("pwd6"),
        role: "PATIENT",
      },
      {
        name: "Meriem Gharbi",
        email: "meriem.gharbi@gmail.com",
        password: await hash("pwd7"),
        role: "PATIENT",
      },
      {
        name: "Youssef Ben Ali",
        email: "youssef.benali@gmail.com",
        password: await hash("pwd8"),
        role: "PATIENT",
      },
      {
        name: "Ines Khaldi",
        email: "ines.khaldi@gmail.com",
        password: await hash("pwd9"),
        role: "PATIENT",
      },
      {
        name: "Amine Hammami",
        email: "amine.hammami@gmail.com",
        password: await hash("pwd10"),
        role: "PATIENT",
      },
    ],
  });

  // ===========================
  // SUPERADMIN
  // ===========================
  await prisma.superAdmin.create({ data: { userId: superAdminUser.id } });

  // ===========================
  // CLINICS
  // ===========================
  const clinicsData = [
    {
      name: "Clinique El Manar",
      address: "Rue de Tunis, Tunis",
      phone: "+216 71 123 456",
      subscriptionType: "PRO",
      taxId: "TAX001",
      months: 3,
    },
    {
      name: "Clinique La Marsa",
      address: "Avenue Habib Bourguiba, La Marsa",
      phone: "+216 71 654 321",
      subscriptionType: "PRO",
      taxId: "TAX002",
      months: 3,
    },
    {
      name: "Clinique Sfax",
      address: "Rue de Sfax, Sfax",
      phone: "+216 74 123 987",
      subscriptionType: "ENTERPRISE",
      taxId: "TAX003",
      months: 6,
    },
  ];

  const clinics = [];

  for (const c of clinicsData) {
    const start = now;
    const end = new Date(new Date().setMonth(now.getMonth() + c.months));
    const clinic = await prisma.clinic.create({
      data: {
        name: c.name,
        address: c.address,
        phone: c.phone,
        subscriptionType: c.subscriptionType,
        subscriptionStatus: "ACTIVE",
        taxId: c.taxId,
        isActive: true,
        subscriptionStart: start,
        subscriptionEnd: end,
      },
    });
    clinics.push(clinic);
  }

  // ===========================
  // ADMIN CLINICS
  // ===========================
  await prisma.adminClinic.create({
    data: { userId: admin1.id, clinicId: clinics[0].id, isActive: true },
  });
  await prisma.adminClinic.create({
    data: { userId: admin2.id, clinicId: clinics[1].id, isActive: true },
  });

  // ===========================
  // SPECIALIZATIONS
  // ===========================
  const specializations = [
    "Cardiologie",
    "Dermatologie",
    "Pédiatrie",
    "Ophtalmologie",
  ];
  const specializationsCreated = [];

  for (const name of specializations) {
    const spec = await prisma.specialization.create({ data: { name } });
    specializationsCreated.push(spec);
  }

  // ===========================
  // DOCTORS
  // ===========================
  const allDoctorUsers = await prisma.user.findMany({
    where: { role: "DOCTOR" },
  });

  for (let i = 0; i < allDoctorUsers.length; i++) {
    await prisma.doctor.create({
      data: {
        userId: allDoctorUsers[i].id,
        clinicId: clinics[i % clinics.length].id,
        specializationId:
          specializationsCreated[i % specializationsCreated.length].id,
        isActive: true,
      },
    });
  }

  // ===========================
  // RECEPTIONISTS
  // ===========================
  const allReceptionists = await prisma.user.findMany({
    where: { role: "RECEPTIONIST" },
  });
  for (let i = 0; i < allReceptionists.length; i++) {
    await prisma.receptionist.create({
      data: {
        userId: allReceptionists[i].id,
        clinicId: clinics[i % clinics.length].id,
        isActive: true,
      },
    });
  }

  // ===========================
  // PATIENTS
  // ===========================
  const allPatients = await prisma.user.findMany({
    where: { role: "PATIENT" },
  });
  for (let i = 0; i < allPatients.length; i++) {
    await prisma.patient.create({
      data: {
        userId: allPatients[i].id,
        clinicId: clinics[i % clinics.length].id,
      },
    });
  }

  // ===========================
  // APPOINTMENTS
  // ===========================
  const patients = await prisma.patient.findMany();
  const doctors = await prisma.doctor.findMany();
  const receptionists = await prisma.receptionist.findMany();

  for (let i = 0; i < 10; i++) {
    await prisma.appointment.create({
      data: {
        patientId: patients[i % patients.length].id,
        doctorId: doctors[i % doctors.length].id,
        receptionistId: receptionists[i % receptionists.length].id,
        clinicId: clinics[i % clinics.length].id,
        date: new Date(Date.now() + (i + 1) * 86400000),
        status: "SCHEDULED",
      },
    });
  }

  // ===========================
  // MEDICAL RECORDS
  // ===========================
  for (let i = 0; i < 10; i++) {
    await prisma.medicalRecord.create({
      data: {
        patientId: patients[i % patients.length].id,
        doctorId: doctors[i % doctors.length].id,
        description: `Consultation ${i + 1}`,
        prescriptions: { medicaments: ["Paracetamol", "Vitamin C"] },
      },
    });
  }

  // ===========================
  // INVOICES
  // ===========================
  for (let i = 0; i < 10; i++) {
    await prisma.invoice.create({
      data: {
        patientId: patients[i % patients.length].id,
        clinicId: clinics[i % clinics.length].id,
        amount: Math.floor(Math.random() * 300) + 50,
        status: i % 2 === 0 ? "PAID" : "PENDING",
        paymentMethod: i % 2 === 0 ? "CASH" : "CARD",
      },
    });
  }

  console.log(
    "✅ Database fully seeded with hashed passwords and active doctors!"
  );
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

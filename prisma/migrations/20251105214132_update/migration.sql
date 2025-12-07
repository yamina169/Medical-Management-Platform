-- DropForeignKey
ALTER TABLE "AdminClinic" DROP CONSTRAINT "AdminClinic_clinicId_fkey";

-- AlterTable
ALTER TABLE "AdminClinic" ALTER COLUMN "clinicId" DROP NOT NULL,
ALTER COLUMN "isActive" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "AdminClinic" ADD CONSTRAINT "AdminClinic_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

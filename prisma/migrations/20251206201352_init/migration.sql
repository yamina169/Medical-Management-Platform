/*
  Warnings:

  - You are about to drop the column `logo` on the `Clinic` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[taxId]` on the table `Clinic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `taxId` to the `Clinic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clinic" DROP COLUMN "logo",
ADD COLUMN     "taxId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_taxId_key" ON "Clinic"("taxId");

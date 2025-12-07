/*
  Warnings:

  - The values [PRO_6M,ENTERPRISE_12M] on the enum `SubscriptionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionType_new" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
ALTER TABLE "public"."Clinic" ALTER COLUMN "subscriptionType" DROP DEFAULT;
ALTER TABLE "Clinic" ALTER COLUMN "subscriptionType" TYPE "SubscriptionType_new" USING ("subscriptionType"::text::"SubscriptionType_new");
ALTER TYPE "SubscriptionType" RENAME TO "SubscriptionType_old";
ALTER TYPE "SubscriptionType_new" RENAME TO "SubscriptionType";
DROP TYPE "public"."SubscriptionType_old";
ALTER TABLE "Clinic" ALTER COLUMN "subscriptionType" SET DEFAULT 'FREE';
COMMIT;

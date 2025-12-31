/*
  Warnings:

  - The values [ONBOARDING,VERIFIED] on the enum `ReviewStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReviewStatus_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'ACTIVE', 'REJECTED', 'SUSPENDED', 'CLOSED');
ALTER TABLE "public"."RiderDocument" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Vendor" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "RiderDocument" ALTER COLUMN "status" TYPE "ReviewStatus_new" USING ("status"::text::"ReviewStatus_new");
ALTER TABLE "Vendor" ALTER COLUMN "status" TYPE "ReviewStatus_new" USING ("status"::text::"ReviewStatus_new");
ALTER TABLE "VendorDocument" ALTER COLUMN "status" TYPE "ReviewStatus_new" USING ("status"::text::"ReviewStatus_new");
ALTER TABLE "Business" ALTER COLUMN "status" TYPE "ReviewStatus_new" USING ("status"::text::"ReviewStatus_new");
ALTER TABLE "BusinessDocument" ALTER COLUMN "status" TYPE "ReviewStatus_new" USING ("status"::text::"ReviewStatus_new");
ALTER TYPE "ReviewStatus" RENAME TO "ReviewStatus_old";
ALTER TYPE "ReviewStatus_new" RENAME TO "ReviewStatus";
DROP TYPE "public"."ReviewStatus_old";
ALTER TABLE "RiderDocument" ALTER COLUMN "status" SET DEFAULT 'PENDING';
ALTER TABLE "Vendor" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
ALTER TYPE "ServiceOperation" ADD VALUE 'PICKUP';

-- AlterTable
ALTER TABLE "Business" ALTER COLUMN "brandType" DROP NOT NULL,
ALTER COLUMN "registrationNumber" DROP NOT NULL,
ALTER COLUMN "taxId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- DropEnum
DROP TYPE "CuisineType";

-- DropEnum
DROP TYPE "MealType";

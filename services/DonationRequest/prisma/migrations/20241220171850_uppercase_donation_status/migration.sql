/*
  Warnings:

  - The `status` column on the `DonationRequested` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DONATION_STATUS" AS ENUM ('REQUEST', 'PROGRESS', 'READY', 'HOLD', 'COMPLETED', 'DECLINED');

-- AlterTable
ALTER TABLE "DonationRequested" DROP COLUMN "status",
ADD COLUMN     "status" "DONATION_STATUS" NOT NULL DEFAULT 'REQUEST';

-- DropEnum
DROP TYPE "donation_status";

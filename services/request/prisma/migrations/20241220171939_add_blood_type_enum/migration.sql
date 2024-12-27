/*
  Warnings:

  - Changed the type of `blood` on the `DonationRequested` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BLOOD_TYPE" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE');

-- AlterTable
ALTER TABLE "DonationRequested" DROP COLUMN "blood",
ADD COLUMN     "blood" "BLOOD_TYPE" NOT NULL;

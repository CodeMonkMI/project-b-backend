-- CreateEnum
CREATE TYPE "donation_status" AS ENUM ('REQUEST', 'PROGRESS', 'READY', 'HOLD', 'COMPLETED', 'DECLINED');

-- CreateTable
CREATE TABLE "DonationRequested" (
    "id" TEXT NOT NULL,
    "requestedById" TEXT,
    "donorId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "blood" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "verifiedById" TEXT,
    "status" "donation_status" NOT NULL,
    "deleteAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationRequested_pkey" PRIMARY KEY ("id")
);

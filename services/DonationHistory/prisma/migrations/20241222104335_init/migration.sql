-- CreateEnum
CREATE TYPE "DONATION_ACTIVITY_STATUS" AS ENUM ('REQUEST', 'APPROVE', 'PROGRESS', 'READY', 'HOLD', 'COMPLETED', 'DECLINED', 'DELETED');

-- CreateTable
CREATE TABLE "DonationHistory" (
    "_id" TEXT NOT NULL,
    "type" "DONATION_ACTIVITY_STATUS" NOT NULL DEFAULT 'REQUEST',
    "message" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "deleteAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationHistory_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE INDEX "requestId" ON "DonationHistory"("requestId");

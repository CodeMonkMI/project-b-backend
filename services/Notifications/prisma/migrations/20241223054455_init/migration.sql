-- CreateEnum
CREATE TYPE "NOTIFICATION_TYPE" AS ENUM ('ACCOUNT', 'REQUEST', 'SYSTEM');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NOTIFICATION_TYPE" NOT NULL DEFAULT 'REQUEST',
    "message" TEXT NOT NULL,
    "receivers" TEXT[],
    "readers" TEXT[],
    "isAll" BOOLEAN NOT NULL DEFAULT false,
    "deleteAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

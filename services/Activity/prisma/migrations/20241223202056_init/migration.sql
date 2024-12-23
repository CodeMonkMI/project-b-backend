-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('BLOOD_DONATED', 'UPDATE_SETTINGS', 'PROMOTED', 'DEMOTED', 'NEW_REQUEST', 'NEW_USER');

-- CreateTable
CREATE TABLE "Activity" (
    "_id" TEXT NOT NULL,
    "type" "ActivityStatus" NOT NULL DEFAULT 'NEW_REQUEST',
    "message" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "deleteAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("_id")
);

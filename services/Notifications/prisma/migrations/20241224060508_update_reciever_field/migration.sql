/*
  Warnings:

  - You are about to drop the column `receiver` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "receiver",
ADD COLUMN     "receivers" TEXT[];

/*
  Warnings:

  - You are about to drop the column `readers` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `receivers` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `receiver` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "readers",
DROP COLUMN "receivers",
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "receiver" TEXT NOT NULL;

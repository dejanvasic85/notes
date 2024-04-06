/*
  Warnings:

  - You are about to drop the column `acceptedAt` on the `UserInvite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserInvite" DROP COLUMN "acceptedAt",
ADD COLUMN     "status" TEXT;

/*
  Warnings:

  - You are about to drop the column `status` on the `UserInvite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserInvite" DROP COLUMN "status",
ADD COLUMN     "acceptedAt" TIMESTAMP(3);

/*
  Warnings:

  - You are about to drop the column `authId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_authId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authId";

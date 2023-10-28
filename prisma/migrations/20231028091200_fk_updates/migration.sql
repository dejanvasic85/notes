/*
  Warnings:

  - Made the column `boardId` on table `Note` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "boardId" SET NOT NULL;

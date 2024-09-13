/*
  Warnings:

  - Added the required column `selected` to the `NoteEditor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NoteEditor" ADD COLUMN     "selected" BOOLEAN NOT NULL;

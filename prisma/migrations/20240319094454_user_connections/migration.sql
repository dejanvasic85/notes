/*
  Warnings:

  - You are about to drop the `NoteCollaborator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NoteInvite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NoteCollaborator" DROP CONSTRAINT "NoteCollaborator_noteId_fkey";

-- DropForeignKey
ALTER TABLE "NoteCollaborator" DROP CONSTRAINT "NoteCollaborator_userId_fkey";

-- DropForeignKey
ALTER TABLE "NoteInvite" DROP CONSTRAINT "NoteInvite_noteId_fkey";

-- DropTable
DROP TABLE "NoteCollaborator";

-- DropTable
DROP TABLE "NoteInvite";

-- CreateTable
CREATE TABLE "UserConnection" (
    "userFirstId" TEXT NOT NULL,
    "userSecondId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "UserConnection_pkey" PRIMARY KEY ("userFirstId","userSecondId")
);

-- CreateTable
CREATE TABLE "NoteEditor" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "NoteEditor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserConnection" ADD CONSTRAINT "UserConnection_userFirstId_fkey" FOREIGN KEY ("userFirstId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConnection" ADD CONSTRAINT "UserConnection_userSecondId_fkey" FOREIGN KEY ("userSecondId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteEditor" ADD CONSTRAINT "NoteEditor_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteEditor" ADD CONSTRAINT "NoteEditor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

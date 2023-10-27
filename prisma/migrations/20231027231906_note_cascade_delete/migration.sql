-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_boardId_fkey";

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Occurrence" ADD CONSTRAINT "Occurrence_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

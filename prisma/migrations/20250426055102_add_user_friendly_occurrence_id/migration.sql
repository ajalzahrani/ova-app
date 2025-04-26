/*
  Warnings:

  - A unique constraint covering the columns `[occurrenceId]` on the table `Occurrence` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Occurrence" ADD COLUMN     "occurrenceId" TEXT NOT NULL DEFAULT 'OCC25-0000';

-- CreateIndex
CREATE UNIQUE INDEX "Occurrence_occurrenceId_key" ON "Occurrence"("occurrenceId");

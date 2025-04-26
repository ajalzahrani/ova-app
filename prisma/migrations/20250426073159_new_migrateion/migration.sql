/*
  Warnings:

  - You are about to drop the column `occurrenceId` on the `Occurrence` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[occurrenceNo]` on the table `Occurrence` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Occurrence_occurrenceId_key";

-- AlterTable
ALTER TABLE "Occurrence" DROP COLUMN "occurrenceId",
ADD COLUMN     "occurrenceNo" TEXT NOT NULL DEFAULT 'OCC25-0000';

-- CreateIndex
CREATE UNIQUE INDEX "Occurrence_occurrenceNo_key" ON "Occurrence"("occurrenceNo");

-- AlterTable
ALTER TABLE "Occurrence" ADD COLUMN     "locationId" TEXT;

-- CreateTable
CREATE TABLE "OccurrenceLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,

    CONSTRAINT "OccurrenceLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Occurrence" ADD CONSTRAINT "Occurrence_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "OccurrenceLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

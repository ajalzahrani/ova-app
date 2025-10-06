-- AlterTable
ALTER TABLE "Occurrence" ADD COLUMN     "isPatientInvolve" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "mrn" DROP NOT NULL;

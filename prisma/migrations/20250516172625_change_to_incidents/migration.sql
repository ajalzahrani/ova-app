/*
  Warnings:

  - You are about to drop the column `incidentTypes` on the `NotificationPreference` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NotificationPreference" DROP COLUMN "incidentTypes",
ADD COLUMN     "incidents" TEXT[];

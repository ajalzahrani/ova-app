/*
  Warnings:

  - You are about to drop the column `email` on the `NotificationPreference` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `NotificationPreference` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NotificationPreference" DROP COLUMN "email",
DROP COLUMN "mobile";

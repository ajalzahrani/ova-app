-- AlterTable
ALTER TABLE "OccurrenceAssignment" ADD COLUMN     "feedbackId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "feedbackId" TEXT;

-- CreateTable
CREATE TABLE "FeedbackToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "respondedById" TEXT,
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackToken_token_key" ON "FeedbackToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackToken_assignmentId_key" ON "FeedbackToken"("assignmentId");

-- AddForeignKey
ALTER TABLE "FeedbackToken" ADD CONSTRAINT "FeedbackToken_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "OccurrenceAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackToken" ADD CONSTRAINT "FeedbackToken_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackToken" ADD CONSTRAINT "FeedbackToken_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

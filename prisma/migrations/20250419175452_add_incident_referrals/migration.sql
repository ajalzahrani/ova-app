-- CreateTable
CREATE TABLE "incident_referrals" (
    "id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL,
    "root_cause" TEXT,
    "recommendations" TEXT,
    "referred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "incident_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "incident_referrals_incident_id_department_id_key" ON "incident_referrals"("incident_id", "department_id");

-- AddForeignKey
ALTER TABLE "incident_referrals" ADD CONSTRAINT "incident_referrals_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_referrals" ADD CONSTRAINT "incident_referrals_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

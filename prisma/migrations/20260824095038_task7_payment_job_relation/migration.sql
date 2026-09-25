-- Add jobId as nullable so existing payment records can be backfilled.
ALTER TABLE "Payment"
ADD COLUMN "jobId" INTEGER;

-- Associate existing Task 6 test payments with the existing published job.
UPDATE "Payment"
SET "jobId" = 1
WHERE "jobId" IS NULL;

-- jobId is required for all new payments.
ALTER TABLE "Payment"
ALTER COLUMN "jobId" SET NOT NULL;

-- Index payments by job.
CREATE INDEX "Payment_jobId_idx" ON "Payment"("jobId");

-- Add the Payment -> Job relationship.
ALTER TABLE "Payment"
ADD CONSTRAINT "Payment_jobId_fkey"
FOREIGN KEY ("jobId")
REFERENCES "Job"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
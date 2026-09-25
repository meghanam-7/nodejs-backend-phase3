-- Add the column as nullable first so existing defects can be backfilled.
ALTER TABLE "Defect"
ADD COLUMN "idempotencyKey" TEXT;

-- Backfill existing defects with deterministic keys.
UPDATE "Defect"
SET "idempotencyKey" = 'legacy-defect-' || "id";

-- Make the column required.
ALTER TABLE "Defect"
ALTER COLUMN "idempotencyKey" SET NOT NULL;

-- Add the unique constraint.
CREATE UNIQUE INDEX "Defect_idempotencyKey_key"
ON "Defect"("idempotencyKey");
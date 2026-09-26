-- CreateTable
CREATE TABLE "Slo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "description" TEXT,
    "availabilityTarget" DOUBLE PRECISION NOT NULL,
    "latencyTargetMs" INTEGER NOT NULL,
    "correctnessTarget" DOUBLE PRECISION NOT NULL,
    "window" TEXT NOT NULL DEFAULT '30d',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SloMeasurement" (
    "id" SERIAL NOT NULL,
    "sloId" INTEGER NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "latencyP95Ms" DOUBLE PRECISION,
    "availability" DOUBLE PRECISION,
    "correctness" DOUBLE PRECISION,
    "errorBudgetUsed" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SloMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Slo_enabled_idx" ON "Slo"("enabled");

-- CreateIndex
CREATE INDEX "Slo_endpoint_idx" ON "Slo"("endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "Slo_method_endpoint_key" ON "Slo"("method", "endpoint");

-- CreateIndex
CREATE INDEX "SloMeasurement_sloId_idx" ON "SloMeasurement"("sloId");

-- CreateIndex
CREATE INDEX "SloMeasurement_windowStart_idx" ON "SloMeasurement"("windowStart");

-- CreateIndex
CREATE INDEX "SloMeasurement_windowEnd_idx" ON "SloMeasurement"("windowEnd");

-- CreateIndex
CREATE UNIQUE INDEX "SloMeasurement_sloId_windowStart_windowEnd_key" ON "SloMeasurement"("sloId", "windowStart", "windowEnd");

-- AddForeignKey
ALTER TABLE "SloMeasurement" ADD CONSTRAINT "SloMeasurement_sloId_fkey" FOREIGN KEY ("sloId") REFERENCES "Slo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

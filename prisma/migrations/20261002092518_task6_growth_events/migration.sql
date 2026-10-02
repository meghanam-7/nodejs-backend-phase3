-- CreateTable
CREATE TABLE "GrowthEvent" (
    "id" SERIAL NOT NULL,
    "eventType" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "GrowthEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GrowthEvent_idempotencyKey_key" ON "GrowthEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "GrowthEvent_status_createdAt_idx" ON "GrowthEvent"("status", "createdAt");

-- CreateIndex
CREATE INDEX "GrowthEvent_eventType_createdAt_idx" ON "GrowthEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "GrowthEvent_aggregateType_aggregateId_idx" ON "GrowthEvent"("aggregateType", "aggregateId");

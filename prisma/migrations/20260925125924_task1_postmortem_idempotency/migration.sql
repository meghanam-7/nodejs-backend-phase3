/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `Postmortem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idempotencyKey` to the `Postmortem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Postmortem" ADD COLUMN     "idempotencyKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Postmortem_idempotencyKey_key" ON "Postmortem"("idempotencyKey");

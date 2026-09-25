/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `BacklogItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idempotencyKey` to the `BacklogItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BacklogItem" ADD COLUMN     "idempotencyKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BacklogItem_idempotencyKey_key" ON "BacklogItem"("idempotencyKey");

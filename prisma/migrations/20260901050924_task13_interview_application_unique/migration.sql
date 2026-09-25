/*
  Warnings:

  - A unique constraint covering the columns `[applicationId]` on the table `Interview` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Interview_applicationId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Interview_applicationId_key" ON "Interview"("applicationId");

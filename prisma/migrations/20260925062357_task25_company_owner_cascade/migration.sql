-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_ownerUserId_fkey";

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

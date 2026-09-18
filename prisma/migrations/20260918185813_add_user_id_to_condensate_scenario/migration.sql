-- AlterTable
ALTER TABLE "CondensateScenario" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "CondensateScenario" ADD CONSTRAINT "CondensateScenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

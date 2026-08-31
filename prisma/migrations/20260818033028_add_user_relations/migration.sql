-- AlterTable
ALTER TABLE "HeavyOilInputs" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Scenario" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeavyOilInputs" ADD CONSTRAINT "HeavyOilInputs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

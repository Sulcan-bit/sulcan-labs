/*
  Warnings:

  - A unique constraint covering the columns `[inputsId]` on the table `Scenario` will be added. If there are existing duplicate values, this will fail.
  - Made the column `inputsId` on table `Scenario` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Scenario" DROP CONSTRAINT "Scenario_inputsId_fkey";

-- AlterTable
ALTER TABLE "Scenario" ALTER COLUMN "inputsId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Scenario_inputsId_key" ON "Scenario"("inputsId");

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_inputsId_fkey" FOREIGN KEY ("inputsId") REFERENCES "HeavyOilInputs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

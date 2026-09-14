/*
  Warnings:

  - You are about to drop the column `enb_ref_temp` on the `MonthlyData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MonthlyData" DROP COLUMN "enb_ref_temp";

-- CreateTable
CREATE TABLE "EnbridgeRefTemp" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "refTemp" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EnbridgeRefTemp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CondensateScenario" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "scenario_name" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "source_location" TEXT,
    "trucking_time_hours" DOUBLE PRECISION,
    "destination" TEXT,
    "heavy_stream" TEXT,
    "month_name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "inputs" JSONB NOT NULL,
    "results" JSONB NOT NULL,

    CONSTRAINT "CondensateScenario_pkey" PRIMARY KEY ("id")
);

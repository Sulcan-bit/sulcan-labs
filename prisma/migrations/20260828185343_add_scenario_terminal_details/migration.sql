/*
  Warnings:

  - You are about to drop the column `name` on the `Scenario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HeavyOilInputs" ALTER COLUMN "cond1_transport_tt2_cad_m3" DROP NOT NULL,
ALTER COLUMN "tt2_fee_cad_m3" DROP NOT NULL,
ALTER COLUMN "pipeline_toll_tt2_cad_m3" DROP NOT NULL,
ALTER COLUMN "tt2_diluent_sharing_pct" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Scenario" DROP COLUMN "name",
ADD COLUMN     "created_at_text" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "scenario_name" TEXT,
ADD COLUMN     "shrinkage_model" TEXT,
ADD COLUMN     "terminal_location" TEXT,
ADD COLUMN     "terminal_operator" TEXT;

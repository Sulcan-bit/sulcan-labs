/*
  Warnings:

  - You are about to drop the column `comp_tt2_toll_cad_m3` on the `HeavyOilInputs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HeavyOilInputs" DROP COLUMN "comp_tt2_toll_cad_m3",
ALTER COLUMN "tt2_diluent_sharing_pct" DROP DEFAULT;

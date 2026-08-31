/*
  Warnings:

  - Added the required column `heavy_oil_stream` to the `HeavyOilInputs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HeavyOilInputs" ADD COLUMN     "heavy_oil_stream" TEXT NOT NULL;

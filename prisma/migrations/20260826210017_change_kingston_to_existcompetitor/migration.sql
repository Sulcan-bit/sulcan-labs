-- 1. Add the new column (NULL allowed temporarily)
ALTER TABLE "HeavyOilInputs"
ADD COLUMN "pipeline_toll_existcompetitor_cad_m3" DOUBLE PRECISION;

-- 2. Copy old Kingston values into the new column
UPDATE "HeavyOilInputs"
SET "pipeline_toll_existcompetitor_cad_m3" = "pipeline_toll_kingston_cad_m3";

-- 3. Make the new column required
ALTER TABLE "HeavyOilInputs"
ALTER COLUMN "pipeline_toll_existcompetitor_cad_m3" SET NOT NULL;

-- 4. Drop the old column
ALTER TABLE "HeavyOilInputs"
DROP COLUMN "pipeline_toll_kingston_cad_m3";

/*
  Manual migration fix:
  - Add inputsId as NULLABLE first
  - Drop old JSON column
  - Add foreign key
  - DO NOT add UNIQUE yet
  - DO NOT add NOT NULL yet
*/

-- Step 1: Drop old JSON column
ALTER TABLE "Scenario" DROP COLUMN "inputs";

-- Step 2: Add inputsId as NULLABLE
ALTER TABLE "Scenario" ADD COLUMN "inputsId" INTEGER;

-- Step 3: Add foreign key constraint
ALTER TABLE "Scenario"
ADD CONSTRAINT "Scenario_inputsId_fkey"
FOREIGN KEY ("inputsId") REFERENCES "HeavyOilInputs"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

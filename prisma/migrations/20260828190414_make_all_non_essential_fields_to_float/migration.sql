-- AlterTable
ALTER TABLE "HeavyOilInputs" ALTER COLUMN "comp_pipeline_diluent_sharing_pct" DROP NOT NULL,
ALTER COLUMN "comp_tt1_toll_cad_m3" DROP NOT NULL,
ALTER COLUMN "comp_pipeline_fee_cad_m3" DROP NOT NULL,
ALTER COLUMN "comp_tt_fee_cad_m3" DROP NOT NULL,
ALTER COLUMN "comp_pipeline_loss_allowance_pct" DROP NOT NULL,
ALTER COLUMN "pipeline_toll_existcompetitor_cad_m3" DROP NOT NULL;

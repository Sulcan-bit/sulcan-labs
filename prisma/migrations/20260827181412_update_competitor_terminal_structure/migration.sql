ALTER TABLE "HeavyOilInputs"
    DROP COLUMN "cond1_transport_tt3_cad_m3",
    DROP COLUMN "cond2_transport_tt3_cad_m3",
    DROP COLUMN "tt3_fee_cad_m3";

ALTER TABLE "HeavyOilInputs"
    ADD COLUMN "cond1_transport_comp_cad_m3" DOUBLE PRECISION,
    ADD COLUMN "cond2_transport_comp_cad_m3" DOUBLE PRECISION,
    ADD COLUMN "tt_competitor_fee_cad_m3" DOUBLE PRECISION,
    ADD COLUMN "tt2_diluent_sharing_pct" DOUBLE PRECISION NOT NULL DEFAULT 0;


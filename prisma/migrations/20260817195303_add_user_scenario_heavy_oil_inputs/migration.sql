-- CreateTable
CREATE TABLE "Scenario" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "monthId" INTEGER NOT NULL,
    "inputs" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeavyOilInputs" (
    "id" SERIAL NOT NULL,
    "monthId" INTEGER NOT NULL,
    "producer_name" TEXT NOT NULL,
    "producer_volume_m3" DOUBLE PRECISION NOT NULL,
    "producer_density_kg_m3" DOUBLE PRECISION NOT NULL,
    "producer_TAN" DOUBLE PRECISION NOT NULL,
    "cond1_density_kg_m3" DOUBLE PRECISION NOT NULL,
    "cond1_sulphur_pct" DOUBLE PRECISION NOT NULL,
    "cond1_load_fee_cad_m3" DOUBLE PRECISION NOT NULL,
    "cond1_transport_tt1_cad_m3" DOUBLE PRECISION NOT NULL,
    "cond1_transport_tt2_cad_m3" DOUBLE PRECISION NOT NULL,
    "cond1_transport_tt3_cad_m3" DOUBLE PRECISION NOT NULL,
    "cond2_density_kg_m3" DOUBLE PRECISION NOT NULL,
    "cond2_sulphur_pct" DOUBLE PRECISION NOT NULL,
    "c4_landed_tt1_pct_wti" DOUBLE PRECISION,
    "c4_landed_tt2_pct_wti" DOUBLE PRECISION,
    "c4_trucking_adder_tt2_cad_m3" DOUBLE PRECISION,
    "butane_injection_rate_pct" DOUBLE PRECISION NOT NULL,
    "actual_blend_density_kg_m3" DOUBLE PRECISION,
    "paper_blend_density_kg_m3" DOUBLE PRECISION,
    "tt1_fee_cad_m3" DOUBLE PRECISION NOT NULL,
    "tt2_fee_cad_m3" DOUBLE PRECISION NOT NULL,
    "pipeline_power_surcharge_cad_m3" DOUBLE PRECISION NOT NULL,
    "pipeline_loss_allowance_pct" DOUBLE PRECISION NOT NULL,
    "pipeline_toll_tt1_cad_m3" DOUBLE PRECISION NOT NULL,
    "pipeline_toll_tt2_cad_m3" DOUBLE PRECISION NOT NULL,
    "pipeline_toll_kingston_cad_m3" DOUBLE PRECISION NOT NULL,
    "tt1_diluent_sharing_pct" DOUBLE PRECISION NOT NULL,
    "comp_pipeline_diluent_sharing_pct" DOUBLE PRECISION NOT NULL,
    "comp_tt1_toll_cad_m3" DOUBLE PRECISION NOT NULL,
    "comp_pipeline_fee_cad_m3" DOUBLE PRECISION NOT NULL,
    "comp_tt_fee_cad_m3" DOUBLE PRECISION NOT NULL,
    "comp_tt2_toll_cad_m3" DOUBLE PRECISION NOT NULL,
    "comp_pipeline_loss_allowance_pct" DOUBLE PRECISION NOT NULL,
    "raw_crude_trucking_rate_cad_m3" DOUBLE PRECISION NOT NULL,
    "raw_crude_truck_volume_m3" DOUBLE PRECISION NOT NULL,
    "cond_trucking_rate_cad_m3" DOUBLE PRECISION NOT NULL,
    "cond_truck_volume_m3" DOUBLE PRECISION NOT NULL,
    "c4_trucking_rate_cad_m3" DOUBLE PRECISION NOT NULL,
    "c4_truck_volume_m3" DOUBLE PRECISION NOT NULL,
    "premium_crude_value_usd_bbl" DOUBLE PRECISION NOT NULL,
    "hardisty_premium_crude_value_usd_bbl" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeavyOilInputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "MonthlyData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeavyOilInputs" ADD CONSTRAINT "HeavyOilInputs_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "MonthlyData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "StreamInfo" (
    "id" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreamInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyData" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "days_in_month" INTEGER NOT NULL,
    "msw_stream_id" TEXT,
    "c5_stream_id" TEXT,
    "ftsk_stream_id" TEXT,
    "peace_stream_id" TEXT,
    "kaps_stream_id" TEXT,
    "wcs_stream_id" TEXT,
    "c4_stream_id" TEXT,
    "wti_cma_usd_bbl" DOUBLE PRECISION,
    "fx_cad_usd" DOUBLE PRECISION,
    "msw_diff_usd_bbl" DOUBLE PRECISION,
    "msw_wadf_cad_m3" DOUBLE PRECISION,
    "msw_par_base_price_usd_bbl" DOUBLE PRECISION,
    "msw_par_base_price_cad_m3" DOUBLE PRECISION,
    "msw_stream_price_cad_m3" DOUBLE PRECISION,
    "msw_to_wti_pct" DOUBLE PRECISION,
    "c5_vs_msw_diff_usd_bbl" DOUBLE PRECISION,
    "ftsk_c5_diff_usd_bbl" DOUBLE PRECISION,
    "ftsk_c5_par_base_price_usd_bbl" DOUBLE PRECISION,
    "ftsk_c5_par_base_price_cad_m3" DOUBLE PRECISION,
    "ftsk_c5_stream_price_cad_m3" DOUBLE PRECISION,
    "ftsk_c5_to_wti_pct" DOUBLE PRECISION,
    "peace_c5_diff_usd_bbl" DOUBLE PRECISION,
    "peace_c5_par_base_price_usd_bbl" DOUBLE PRECISION,
    "peace_c5_par_base_price_cad_m3" DOUBLE PRECISION,
    "peace_c5_stream_price_cad_m3" DOUBLE PRECISION,
    "peace_c5_to_wti_pct" DOUBLE PRECISION,
    "kaps_c5_diff_usd_bbl" DOUBLE PRECISION,
    "crw_c5_enb_wadf_cad_m3" DOUBLE PRECISION,
    "c5_density_slope_cad_m3_per_kg_m3" DOUBLE PRECISION,
    "c5_allow_price_cad_m3" DOUBLE PRECISION,
    "wcs_diff_usd_bbl" DOUBLE PRECISION,
    "wcs_price_cad_m3" DOUBLE PRECISION,
    "wcs_price_usd_bbl" DOUBLE PRECISION,
    "msw_vs_wcs_diff_usd_bbl" DOUBLE PRECISION,
    "wcs_vs_wti_usd_bbl" DOUBLE PRECISION,
    "hvy_all_price_cad_m3" DOUBLE PRECISION,
    "wcs_vs_c5_diluent_cost_usd_bbl" DOUBLE PRECISION,
    "enb_ref_temp" DOUBLE PRECISION,
    "c4_to_wti_usd_bbl" DOUBLE PRECISION,
    "c4_price_usd_bbl" DOUBLE PRECISION,
    "c4_price_cad_m3" DOUBLE PRECISION,
    "c4_landed_marten_hills_pct_wti" DOUBLE PRECISION,
    "msy_diff_index_usd_bbl" DOUBLE PRECISION,
    "msy_to_msw_diff_usd_bbl" DOUBLE PRECISION,
    "mse_diff_index_usd_bbl" DOUBLE PRECISION,
    "mse_vs_msw_diff_usd_bbl" DOUBLE PRECISION,
    "cal_diff_usd_bbl" DOUBLE PRECISION,
    "cal_wadf_cad_m3" DOUBLE PRECISION,
    "cal_par_base_price_usd_bbl" DOUBLE PRECISION,
    "cal_par_base_price_cad_m3" DOUBLE PRECISION,
    "cal_stream_price_cad_m3" DOUBLE PRECISION,
    "cal_to_wti_pct" DOUBLE PRECISION,
    "lsb_diff_usd_bbl" DOUBLE PRECISION,
    "lsb_wadf_cad_m3" DOUBLE PRECISION,
    "lsb_par_base_price_usd_bbl" DOUBLE PRECISION,
    "lsb_par_base_price_cad_m3" DOUBLE PRECISION,
    "lsb_stream_price_cad_m3" DOUBLE PRECISION,
    "lsb_to_wti_pct" DOUBLE PRECISION,
    "brn_diff_usd_bbl" DOUBLE PRECISION,
    "brn_wadf_cad_m3" DOUBLE PRECISION,
    "brn_par_base_price_usd_bbl" DOUBLE PRECISION,
    "brn_par_base_price_cad_m3" DOUBLE PRECISION,
    "brn_stream_price_cad_m3" DOUBLE PRECISION,
    "brn_to_wti_pct" DOUBLE PRECISION,
    "brs_diff_usd_bbl" DOUBLE PRECISION,
    "brs_wadf_cad_m3" DOUBLE PRECISION,
    "brs_par_base_price_usd_bbl" DOUBLE PRECISION,
    "brs_par_base_price_cad_m3" DOUBLE PRECISION,
    "brs_stream_price_cad_m3" DOUBLE PRECISION,
    "brs_to_wti_pct" DOUBLE PRECISION,
    "chv_diff_usd_bbl" DOUBLE PRECISION,
    "chv_price_usd_bbl" DOUBLE PRECISION,
    "chv_price_cad_m3" DOUBLE PRECISION,
    "cwh_diff_usd_bbl" DOUBLE PRECISION,
    "cwh_price_usd_bbl" DOUBLE PRECISION,
    "cwh_price_cad_m3" DOUBLE PRECISION,
    "llb_diff_usd_bbl" DOUBLE PRECISION,
    "llb_price_usd_bbl" DOUBLE PRECISION,
    "llb_price_cad_m3" DOUBLE PRECISION,
    "wcb_diff_usd_bbl" DOUBLE PRECISION,
    "wcb_price_usd_bbl" DOUBLE PRECISION,
    "wcb_price_cad_m3" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "scenario_name" TEXT,
    "terminal_operator" TEXT,
    "terminal_location" TEXT,
    "shrinkage_model" TEXT,
    "notes" TEXT,
    "created_at_text" TEXT,
    "model" TEXT NOT NULL,
    "monthId" INTEGER NOT NULL,
    "inputsId" INTEGER NOT NULL,
    "inputsJson" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioResults" (
    "id" SERIAL NOT NULL,
    "scenarioId" INTEGER NOT NULL,
    "partA_wti_usd_bbl" DOUBLE PRECISION,
    "partA_fx_cad_usd" DOUBLE PRECISION,
    "partA_heavy_stream_index_usd_bbl" DOUBLE PRECISION,
    "partA_premium_heavy_usd_bbl" DOUBLE PRECISION,
    "partA_heavy_stream_price_cad_m3" DOUBLE PRECISION,
    "partA_condensate_index_usd_bbl" DOUBLE PRECISION,
    "partA_condensate_par_price_cad_m3" DOUBLE PRECISION,
    "partA_condensate_stream_price_cad_m3" DOUBLE PRECISION,
    "partA_condensate_eq_credit_cad_m3" DOUBLE PRECISION,
    "partA_condensate_price_after_eq_cad_m3" DOUBLE PRECISION,
    "partA_c4_price_pct_wti" DOUBLE PRECISION,
    "partA_c4_purchase_price_usd_bbl" DOUBLE PRECISION,
    "partA_c4_diff_to_wti_usd_bbl" DOUBLE PRECISION,
    "partA_c4_price_cad_m3" DOUBLE PRECISION,
    "partB_condensate_est_volume_m3" DOUBLE PRECISION,
    "partB_total_receipts_m3" DOUBLE PRECISION,
    "partB_weighted_avg_density_kg_m3" DOUBLE PRECISION,
    "partB_shrink_pct_cond" DOUBLE PRECISION,
    "partB_shrink_pct_oil" DOUBLE PRECISION,
    "partB_shrink_pct_butane" DOUBLE PRECISION,
    "partB_shrink_vol_cond_m3" DOUBLE PRECISION,
    "partB_shrink_vol_oil_m3" DOUBLE PRECISION,
    "partB_shrink_vol_butane_m3" DOUBLE PRECISION,
    "partB_total_shrinkage_m3" DOUBLE PRECISION,
    "partB_net_volume_m3" DOUBLE PRECISION,
    "partB_total_shrinkage_pct" DOUBLE PRECISION,
    "partB_final_shrink_pct" DOUBLE PRECISION,
    "partC_net_sales" DOUBLE PRECISION,
    "partC_net_blend_volume_m3" DOUBLE PRECISION,
    "partC_total_shrinkage_m3" DOUBLE PRECISION,
    "partC_raw_crude_volume_m3" DOUBLE PRECISION,
    "partC_condensate_volume_m3" DOUBLE PRECISION,
    "partC_net_price_per_m3_raw" DOUBLE PRECISION,
    "partC_net_price_per_bbl_cad" DOUBLE PRECISION,
    "partC_net_price_per_bbl_usd" DOUBLE PRECISION,
    "partC_diff_to_wti_usd_bbl" DOUBLE PRECISION,
    "partC_diff_to_wcs_usd_bbl" DOUBLE PRECISION,
    "partC_diluent_fee_m3_raw" DOUBLE PRECISION,
    "partC_diluent_cost_m3_blend" DOUBLE PRECISION,
    "partD_butane_volume_m3" DOUBLE PRECISION,
    "partD_condensate_volume_m3" DOUBLE PRECISION,
    "partD_raw_crude_volume_m3" DOUBLE PRECISION,
    "partD_total_receipts_m3" DOUBLE PRECISION,
    "partD_total_shrinkage_m3" DOUBLE PRECISION,
    "partD_net_blend_volume_m3" DOUBLE PRECISION,
    "partD_weighted_density_kg_m3" DOUBLE PRECISION,
    "partE_net_sales" DOUBLE PRECISION,
    "partE_net_price_per_m3_raw" DOUBLE PRECISION,
    "partE_net_price_per_bbl_cad" DOUBLE PRECISION,
    "partE_net_price_per_bbl_usd" DOUBLE PRECISION,
    "partE_diff_to_wti_usd_bbl" DOUBLE PRECISION,
    "partE_diff_to_wcs_usd_bbl" DOUBLE PRECISION,
    "partE_diluent_fee_m3_raw" DOUBLE PRECISION,
    "partE_diluent_cost_m3_blend" DOUBLE PRECISION,
    "partE_c5_diluent_cost_m3_blend" DOUBLE PRECISION,
    "partE_c4_diluent_cost_m3_blend" DOUBLE PRECISION,
    "partF_financial_benefit_cad" DOUBLE PRECISION,
    "partF_blend_revenue_change" DOUBLE PRECISION,
    "partF_diluent_cost_savings" DOUBLE PRECISION,
    "partF_transport_savings" DOUBLE PRECISION,
    "partF_loss_allowance_savings" DOUBLE PRECISION,
    "partF_netBenefit_per_m3_raw" DOUBLE PRECISION,
    "partF_netBenefit_per_m3_blend" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeavyOilInputs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "monthId" INTEGER NOT NULL,
    "producer_name" TEXT NOT NULL,
    "producer_volume_m3" DOUBLE PRECISION NOT NULL,
    "producer_density_kg_m3" DOUBLE PRECISION NOT NULL,
    "producer_TAN" DOUBLE PRECISION NOT NULL,
    "cond1_density_kg_m3" DOUBLE PRECISION NOT NULL,
    "cond1_sulphur_pct" DOUBLE PRECISION NOT NULL,
    "cond1_load_fee_cad_m3" DOUBLE PRECISION NOT NULL,
    "cond1_transport_tt1_cad_m3" DOUBLE PRECISION NOT NULL,
    "cond1_transport_tt2_cad_m3" DOUBLE PRECISION,
    "cond1_transport_comp_cad_m3" DOUBLE PRECISION,
    "condensate_index_choice" TEXT,
    "cond2_density_kg_m3" DOUBLE PRECISION NOT NULL,
    "cond2_sulphur_pct" DOUBLE PRECISION NOT NULL,
    "cond2_load_fee_cad_m3" DOUBLE PRECISION,
    "cond2_transport_tt1_cad_m3" DOUBLE PRECISION,
    "cond2_transport_tt2_cad_m3" DOUBLE PRECISION,
    "cond2_transport_comp_cad_m3" DOUBLE PRECISION,
    "c4_landed_tt1_pct_wti" DOUBLE PRECISION,
    "c4_landed_tt2_pct_wti" DOUBLE PRECISION,
    "c4_trucking_adder_tt2_cad_m3" DOUBLE PRECISION,
    "butane_injection_rate_pct" DOUBLE PRECISION NOT NULL,
    "actual_blend_density_kg_m3" DOUBLE PRECISION,
    "paper_blend_density_kg_m3" DOUBLE PRECISION,
    "target_blend_density" DOUBLE PRECISION,
    "cond1_est_volume_m3" DOUBLE PRECISION,
    "tt1_fee_cad_m3" DOUBLE PRECISION NOT NULL,
    "tt2_fee_cad_m3" DOUBLE PRECISION,
    "tt_competitor_fee_cad_m3" DOUBLE PRECISION,
    "pipeline_power_surcharge_cad_m3" DOUBLE PRECISION NOT NULL,
    "pipeline_loss_allowance_pct" DOUBLE PRECISION NOT NULL,
    "pipeline_toll_tt1_cad_m3" DOUBLE PRECISION NOT NULL,
    "pipeline_toll_tt2_cad_m3" DOUBLE PRECISION,
    "pipeline_toll_existcompetitor_cad_m3" DOUBLE PRECISION,
    "tt1_diluent_sharing_pct" DOUBLE PRECISION NOT NULL,
    "tt2_diluent_sharing_pct" DOUBLE PRECISION,
    "comp_pipeline_diluent_sharing_pct" DOUBLE PRECISION,
    "comp_tt1_toll_cad_m3" DOUBLE PRECISION,
    "comp_pipeline_fee_cad_m3" DOUBLE PRECISION,
    "comp_tt_fee_cad_m3" DOUBLE PRECISION,
    "comp_pipeline_loss_allowance_pct" DOUBLE PRECISION,
    "raw_crude_trucking_rate_cad_m3" DOUBLE PRECISION NOT NULL,
    "raw_crude_truck_volume_m3" DOUBLE PRECISION NOT NULL,
    "raw_crude_hours_tt1" DOUBLE PRECISION,
    "raw_crude_hours_tt2" DOUBLE PRECISION,
    "raw_crude_hours_comp" DOUBLE PRECISION,
    "cond_trucking_rate_cad_m3" DOUBLE PRECISION NOT NULL,
    "cond_truck_volume_m3" DOUBLE PRECISION NOT NULL,
    "cond1_hours_tt1" DOUBLE PRECISION,
    "cond1_hours_tt2" DOUBLE PRECISION,
    "cond1_hours_comp" DOUBLE PRECISION,
    "cond2_hours_tt1" DOUBLE PRECISION,
    "cond2_hours_tt2" DOUBLE PRECISION,
    "cond2_hours_comp" DOUBLE PRECISION,
    "c4_trucking_rate_cad_m3" DOUBLE PRECISION NOT NULL,
    "c4_truck_volume_m3" DOUBLE PRECISION NOT NULL,
    "c4_hours_tt1" DOUBLE PRECISION,
    "c4_hours_tt2" DOUBLE PRECISION,
    "c4_hours_comp" DOUBLE PRECISION,
    "premium_crude_value_usd_bbl" DOUBLE PRECISION NOT NULL,
    "hardisty_premium_crude_value_usd_bbl" DOUBLE PRECISION NOT NULL,
    "heavy_oil_stream" TEXT NOT NULL,
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
    "sms_code" TEXT,
    "sms_code_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StreamInfo_acronym_key" ON "StreamInfo"("acronym");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyData_year_month_key" ON "MonthlyData"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Scenario_inputsId_key" ON "Scenario"("inputsId");

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioResults_scenarioId_key" ON "ScenarioResults"("scenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "MonthlyData" ADD CONSTRAINT "MonthlyData_msw_stream_id_fkey" FOREIGN KEY ("msw_stream_id") REFERENCES "StreamInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyData" ADD CONSTRAINT "MonthlyData_c5_stream_id_fkey" FOREIGN KEY ("c5_stream_id") REFERENCES "StreamInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyData" ADD CONSTRAINT "MonthlyData_ftsk_stream_id_fkey" FOREIGN KEY ("ftsk_stream_id") REFERENCES "StreamInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyData" ADD CONSTRAINT "MonthlyData_peace_stream_id_fkey" FOREIGN KEY ("peace_stream_id") REFERENCES "StreamInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyData" ADD CONSTRAINT "MonthlyData_kaps_stream_id_fkey" FOREIGN KEY ("kaps_stream_id") REFERENCES "StreamInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyData" ADD CONSTRAINT "MonthlyData_wcs_stream_id_fkey" FOREIGN KEY ("wcs_stream_id") REFERENCES "StreamInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyData" ADD CONSTRAINT "MonthlyData_c4_stream_id_fkey" FOREIGN KEY ("c4_stream_id") REFERENCES "StreamInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "MonthlyData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_inputsId_fkey" FOREIGN KEY ("inputsId") REFERENCES "HeavyOilInputs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioResults" ADD CONSTRAINT "ScenarioResults_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeavyOilInputs" ADD CONSTRAINT "HeavyOilInputs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeavyOilInputs" ADD CONSTRAINT "HeavyOilInputs_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "MonthlyData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ScenarioResults" (
    "id" SERIAL NOT NULL,
    "scenarioId" INTEGER NOT NULL,
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
    "partF_financial_benefit_cad" DOUBLE PRECISION,
    "partF_blend_revenue_change" DOUBLE PRECISION,
    "partF_diluent_cost_savings" DOUBLE PRECISION,
    "partF_transport_savings" DOUBLE PRECISION,
    "partF_loss_allowance_savings" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioResults_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioResults_scenarioId_key" ON "ScenarioResults"("scenarioId");

-- AddForeignKey
ALTER TABLE "ScenarioResults" ADD CONSTRAINT "ScenarioResults_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

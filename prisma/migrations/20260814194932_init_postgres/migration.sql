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

-- CreateIndex
CREATE UNIQUE INDEX "StreamInfo_acronym_key" ON "StreamInfo"("acronym");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyData_year_month_key" ON "MonthlyData"("year", "month");

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

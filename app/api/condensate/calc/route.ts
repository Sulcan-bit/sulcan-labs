// app/api/condensate/calc/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  condensate_sulphur_slope,
  light_oil_conversion_factor,
  edi_fee_cad_m3,
  colc_fee_cad_m3,
} from "@/app/heavy-oil/constants";

// ⭐ EXACT EQ LOGIC FROM Heavy Oil Part A
function computeCondensateEq(
  monthly: any,
  density: number,
  sulphurPct: number,
  c2: number,
  c3: number,
  c4: number
) {
  const condensateDensitySlope =
    monthly.c5_density_slope_cad_m3_per_kg_m3 ?? 0;
  const condensateAllowancePriceCadM3 =
    monthly.c5_allow_price_cad_m3 ?? 0;

  const sulphur = sulphurPct / 100;

  const eqDensity = (750 - density) * condensateDensitySlope;

  const eqSulphur =
    (0.2 - sulphur) * (condensate_sulphur_slope * 10);

  const deemedButanePct = c4 + 3 * (c3 + c2);
  const excessButanePct = Math.max(0, deemedButanePct - 5);

  const butanePenalty =
    (excessButanePct / 100) * condensateAllowancePriceCadM3;

  return eqDensity + eqSulphur - butanePenalty;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      scenario_name,
      month,
      supplier,
      source_location,
      trucking_time_hours,
      destination,
      heavy_stream,
      density_kg_m3,
      sulphur_pct,
      c2_pct,
      c3_pct,
      c4_pct,
      tariff_cad_m3,
      loading_fee_cad_m3,
      loss_allowance_cad_m3,
      premium_discount_cad_m3,
      trucking_cad_m3,
    } = body;

    // -----------------------------
    // 1. Parse month (e.g. "Jul-2024")
    // -----------------------------
    const [monthName, yearStr] = month.split("-");
    const year = Number(yearStr);

    const monthly = await prisma.monthlyData.findUnique({
      where: { year_month: { year, month: monthName } },
    });

    if (!monthly) {
      return NextResponse.json(
        { error: `MonthlyData not found for ${month}` },
        { status: 400 }
      );
    }

    // -----------------------------
    // 2. Condensate Stream Diff + Price
    // -----------------------------
    const diffField = {
      FTSK: "ftsk_c5_diff_usd_bbl",
      CRW: "crw_c5_diff_usd_bbl",
      PEACE_C5: "peace_c5_diff_usd_bbl",
      OTHER: null,
    }[supplier];

    const streamDiffUsdBbl = diffField ? (monthly[diffField] ?? 0) : 0;

    const wti = monthly.wti_cma_usd_bbl ?? 0;
    const fx = monthly.fx_cad_usd ?? 0;

    const streamPriceUsdBbl = wti + streamDiffUsdBbl;

    const streamPriceCadM3 =
      streamPriceUsdBbl * fx * light_oil_conversion_factor;

    // -----------------------------
    // 3. WADF + PAR Price
    // -----------------------------
    const wadfCadM3 = monthly.crw_c5_enb_wadf_cad_m3 ?? 0;

    const parPriceCadM3 =
      streamPriceUsdBbl * fx * light_oil_conversion_factor +
      wadfCadM3;

    // -----------------------------
    // 4. EQ Adjustment
    // -----------------------------
    const eqAdjustmentCadM3 = computeCondensateEq(
      monthly,
      Number(density_kg_m3),
      Number(sulphur_pct),
      Number(c2_pct),
      Number(c3_pct),
      Number(c4_pct)
    );

    // -----------------------------
    // 5. Price Before Trucking
    // -----------------------------
    const priceBeforeTruckingCadM3 =
      streamPriceCadM3 +
      eqAdjustmentCadM3 +
      Number(tariff_cad_m3) +
      Number(loading_fee_cad_m3) +
      Number(loss_allowance_cad_m3) +
      Number(premium_discount_cad_m3) +
      edi_fee_cad_m3 +
      colc_fee_cad_m3;

    // -----------------------------
    // 6. Landed Cost (CAD/m³)
    // -----------------------------
    const landedCostCadM3 =
      priceBeforeTruckingCadM3 +
      Number(trucking_cad_m3);

    // -----------------------------
    // 7. Landed Cost (USD/bbl)
    // -----------------------------
    const landedCostUsdBbl =
      landedCostCadM3 / (fx * light_oil_conversion_factor);

    // -----------------------------
    // 8. Diff to WTI (USD/bbl)
    // -----------------------------
    const landedCostDiffToWtiUsdBbl =
      landedCostUsdBbl - wti;

    // -----------------------------
    // 9. Save Condensate Scenario
    // -----------------------------
    const scenario = await prisma.condensateScenario.create({
      data: {
        scenario_name,
        supplier,
        source_location,
        trucking_time_hours: Number(trucking_time_hours),
        destination,
        heavy_stream,
        month_name: monthName,
        year,

        inputs: {
          density_kg_m3: Number(density_kg_m3),
          sulphur_pct: Number(sulphur_pct),
          c2_pct: Number(c2_pct),
          c3_pct: Number(c3_pct),
          c4_pct: Number(c4_pct),
          tariff_cad_m3: Number(tariff_cad_m3),
          loading_fee_cad_m3: Number(loading_fee_cad_m3),
          loss_allowance_cad_m3: Number(loss_allowance_cad_m3),
          premium_discount_cad_m3: Number(premium_discount_cad_m3),
          trucking_cad_m3: Number(trucking_cad_m3),
        },

        results: {
          wti_usd_bbl: wti,
          fx_cad_usd: fx,

          stream_diff_usd_bbl: streamDiffUsdBbl,
          stream_price_usd_bbl: streamPriceUsdBbl,
          stream_price_cad_m3: streamPriceCadM3,

          wadf_cad_m3: wadfCadM3,
          par_price_cad_m3: parPriceCadM3,

          eq_adjustment_cad_m3: eqAdjustmentCadM3,

          price_before_trucking_cad_m3: priceBeforeTruckingCadM3,
          landed_cost_cad_m3: landedCostCadM3,
          landed_cost_usd_bbl: landedCostUsdBbl,
          landed_cost_diff_to_wti_usd_bbl: landedCostDiffToWtiUsdBbl,
        },
      },
    });

    return NextResponse.json({ scenarioId: scenario.id });
  } catch (err: any) {
    console.error("Condensate calc error:", err);
    return NextResponse.json(
      { error: "Server error calculating condensate economics." },
      { status: 500 }
    );
  }
}

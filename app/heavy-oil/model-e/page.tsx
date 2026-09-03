// app/heavy-oil/model-e/page.tsx

import { prisma } from "@/lib/prisma";
import {
  heavy_oil_conversion_factor,
  light_oil_conversion_factor,
  butane_density_kg_m3,
  edi_fee_cad_m3,
  colc_fee_cad_m3,
  condensate_sulphur_slope,
} from "@/app/heavy-oil/constants";

type PageProps = {
  searchParams: Promise<{ scenarioId?: string }>;
};

export default async function HeavyOilModelEPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const scenarioId = searchParams?.scenarioId;

  if (!scenarioId) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Heavy Oil Diluent Optimization – Part E: Butane & Condensate Net Sales
          </h1>
          <p className="text-red-600">Missing scenarioId in query string.</p>
          <a href="/models" className="mt-4 inline-block text-blue-600 underline">
            ← Back to Models
          </a>
        </div>
      </main>
    );
  }

  const scenario = await prisma.scenario.findUnique({
    where: { id: Number(scenarioId) },
    include: { month: true },
  });

  if (!scenario) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Heavy Oil Diluent Optimization – Part E: Butane & Condensate Net Sales
          </h1>
          <p className="text-red-600">Scenario not found.</p>
          <a href="/models" className="mt-4 inline-block text-blue-600 underline">
            ← Back to Models
          </a>
        </div>
      </main>
    );
  }

  const inputs = await prisma.heavyOilInputs.findUnique({
    where: { id: scenario.inputsId },
  });

  if (!inputs) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Heavy Oil Diluent Optimization – Part E: Butane & Condensate Net Sales
          </h1>
          <p className="text-red-600">
            HeavyOilInputs not found for this scenario.
          </p>
          <a href="/models" className="mt-4 inline-block text-blue-600 underline">
            ← Back to Models
          </a>
        </div>
      </main>
    );
  }

  const monthly = scenario.month;

  // ============================
  // PART E INPUTS FROM PART D
  // ============================

  const rawCrudeVol = inputs.producer_volume_m3 ?? 0;
  const rawCrudeDensity = inputs.producer_density_kg_m3 ?? 0;

  const butaneInjectionRatePct = inputs.butane_injection_rate_pct ?? 0;
  const butaneVol = rawCrudeVol * (butaneInjectionRatePct / 100);
  const butaneDensity = butane_density_kg_m3;

  const condDensity = inputs.cond1_density_kg_m3 ?? 0;

  // Condensate volume from Part D physical blend formula
  const targetBlendDensity = inputs.target_blend_density ?? 0;

  const condVol = Math.max(
    0,
    (
      rawCrudeVol * rawCrudeDensity +
      butaneVol * butaneDensity -
      targetBlendDensity * rawCrudeVol -
      targetBlendDensity * butaneVol
    ) / (targetBlendDensity - condDensity)
  );

  // Pre-shrink blend volume
  const blendPreShrinkVol = rawCrudeVol + condVol + butaneVol;

  // Weighted density
  const blendPreShrinkDensity =
    blendPreShrinkVol > 0
      ? (
          rawCrudeVol * rawCrudeDensity +
          condVol * condDensity +
          butaneVol * butaneDensity
        ) / blendPreShrinkVol
      : 0;

  // ============================
  // SHRINKAGE (API 12.3)
  // ============================

  function shrinkagePercent(F: number, I: number, J: number): number {
    return F === 0
      ? 0
      : 26900 * F * Math.pow(100 - F, 0.819) * Math.pow(I - J, 2.28);
  }

  const inv_dH = 1 / rawCrudeDensity;
  const inv_dL_cond = 1 / condDensity;
  const inv_dL_butane = 1 / butaneDensity;

  const sumVolButane = rawCrudeVol + butaneVol;
  const X_butane = sumVolButane > 0 ? (butaneVol / sumVolButane) * 100 : 0;

  const shrinkPctButane = shrinkagePercent(X_butane, inv_dL_butane, inv_dH);
  const shrinkVolButane = (shrinkPctButane / 100) * sumVolButane;
  const resultantVolButane = sumVolButane - shrinkVolButane;

  const sumVolCond = resultantVolButane + condVol;
  const X_cond = sumVolCond > 0 ? (condVol / sumVolCond) * 100 : 0;

  const shrinkPctCond = shrinkagePercent(X_cond, inv_dL_cond, inv_dH);
  const shrinkVolCond = (shrinkPctCond / 100) * sumVolCond;
  const resultantVolCond = sumVolCond - shrinkVolCond;

  const sumVolOil = resultantVolCond;
  const shrinkPctOil = 0;
  const shrinkVolOil = 0;
  const resultantVolOil = sumVolOil;

  const totalShrinkageM3 = shrinkVolButane + shrinkVolCond + shrinkVolOil;
  const netBlendVol = resultantVolOil;

  // ============================
  // PRICING
  // ============================

  const wti = monthly.wti_cma_usd_bbl ?? 0;
  const fx = monthly.fx_cad_usd ?? 0;

  const heavyStreamIndexUsdBbl = (() => {
    switch (inputs.heavy_oil_stream ?? "WCS") {
      case "CHV": return monthly.chv_diff_usd_bbl ?? 0;
      case "LLB": return monthly.llb_diff_usd_bbl ?? 0;
      case "CWH": return monthly.cwh_diff_usd_bbl ?? 0;
      case "WCB": return monthly.wcb_diff_usd_bbl ?? 0;
      default: return 0;
    }
  })();

  const premiumHeavyPriceUsdBbl = 0;

  const heavyStreamPriceCadM3 =
    (wti + heavyStreamIndexUsdBbl + premiumHeavyPriceUsdBbl) *
    heavy_oil_conversion_factor *
    fx;

  // Condensate pricing
  const condensateIndexUsdBbl = (() => {
    switch (inputs.condensate_index_choice ?? "CRW") {
      case "CRW": return 0;
      case "FTSK": return monthly.ftsk_c5_diff_usd_bbl ?? 0;
      case "PEACE_C5": return monthly.peace_c5_diff_usd_bbl ?? 0;
      default: return 0;
    }
  })();

  const condensateWadfCadM3 = monthly.crw_c5_enb_wadf_cad_m3 ?? 0;

  const condensateParPriceCadM3 =
    (wti + condensateIndexUsdBbl + premiumHeavyPriceUsdBbl) *
      light_oil_conversion_factor *
      fx +
    condensateWadfCadM3;

  const condensateStreamPriceCadM3 =
    condensateParPriceCadM3 - condensateWadfCadM3;

  const condensateSulphur = (inputs.cond1_sulphur_pct ?? 0) / 100;
  const condensateDensitySlope =
    monthly.c5_density_slope_cad_m3_per_kg_m3 ?? 0;

  const condensateEqCredit =
    (750 - condDensity) * condensateDensitySlope +
    (0.2 - condensateSulphur) * (condensate_sulphur_slope * 10);

  const condensatePriceAfterEqCadM3 =
    condensateStreamPriceCadM3 + condensateEqCredit;

  // Butane price
  const c4PricePctWti = monthly.c4_to_wti_usd_bbl ?? 0;
  const c4PriceCadM3 =
    wti * c4PricePctWti * light_oil_conversion_factor * fx;

  // ============================
  // TRANSPORTATION & LOSS ALLOWANCE
  // ============================

  const c5TransportRate =
    Number(inputs.cond1_load_fee_cad_m3 ?? 0) +
    Number(inputs.cond1_transport_tt1_cad_m3 ?? 0);

  const c5Transport_CAD = condVol * c5TransportRate;

  const blendTransportBaseCadM3 =
    Number(inputs.tt1_fee_cad_m3 ?? 0) +
    Number(inputs.pipeline_toll_tt1_cad_m3 ?? 0) +
    Number(inputs.pipeline_power_surcharge_cad_m3 ?? 0) +
    edi_fee_cad_m3 +
    colc_fee_cad_m3;

  const pipelineLossAllowancePct =
    Number(inputs.pipeline_loss_allowance_pct ?? 0) / 100;

  const lossAllowanceVolume =
    pipelineLossAllowancePct * blendPreShrinkVol;

  const lossAllowance_CAD =
    lossAllowanceVolume * heavyStreamPriceCadM3;

  const blendTransportRate = blendTransportBaseCadM3;
  const blendTransport_CAD =
    blendPreShrinkVol * blendTransportRate;

  // ============================
  // NET SALES CALCULATION
  // ============================

  const saleOfNetBlend_CAD = netBlendVol * heavyStreamPriceCadM3;
  const c5Cost_CAD = condVol * condensatePriceAfterEqCadM3;
  const c4Cost_CAD = butaneVol * c4PriceCadM3;

  const netRevenue_CAD =
    saleOfNetBlend_CAD -
    c5Cost_CAD -
    c4Cost_CAD -
    c5Transport_CAD -
    blendTransport_CAD -
    lossAllowance_CAD;




  // ============================
  // NET PRICE METRICS
  // ============================

  const netPrice_per_m3_raw =
    rawCrudeVol > 0 ? netRevenue_CAD / rawCrudeVol : 0;

  const netPrice_per_bbl_CAD =
    netPrice_per_m3_raw / heavy_oil_conversion_factor;

  const netPrice_per_bbl_USD =
    netPrice_per_bbl_CAD / fx;

  const diffToWTI = netPrice_per_bbl_USD - wti;
  const diffToWCS = diffToWTI - heavyStreamIndexUsdBbl;

  const diluentFee_per_m3_raw =
    netPrice_per_m3_raw -
    (
      heavyStreamPriceCadM3 +
      (-blendTransportRate) +
      (lossAllowanceVolume / netBlendVol) *
        (-heavyStreamPriceCadM3)
    );

  const netBlendVol_afterShrink =
    rawCrudeVol + condVol + butaneVol - totalShrinkageM3;

  const diluentCost_per_m3_blend =
    -((c5Cost_CAD + c4Cost_CAD + c5Transport_CAD) /
      netBlendVol_afterShrink);

  const diluentFee_per_m3_raw_heavy =
  (
    ((condVol + butaneVol - totalShrinkageM3 - lossAllowanceVolume) *
      heavyStreamPriceCadM3) -
    ((condVol * condensatePriceAfterEqCadM3) +
      (butaneVol * c4PriceCadM3))
  ) / rawCrudeVol;

  // ============================
// EXCEL B126–B127 — DILUENT COST BREAKDOWN
// ============================

// C5 Diluent COST per m³ of Blended Crude (Excel B126)
const c5DiluentCost_per_m3_blend =
  -((c5Cost_CAD + c5Transport_CAD) / netBlendVol);

// C4 Diluent COST per m³ of Blended Crude (Excel B127)
// (No C4 transport charge in your model, so only cost)
const c4DiluentCost_per_m3_blend =
  -((c4Cost_CAD + 0) / netBlendVol);

const diluentFee_per_m3_raw_crude =
  netPrice_per_m3_raw -
  (
    heavyStreamPriceCadM3 +
    blendTransportRate +
    (lossAllowanceVolume / blendPreShrinkVol) * heavyStreamPriceCadM3
  );

// ============================
// EXCEL B128 — Diluent Fee per m³ of Blended Crude
// ============================
//
// B128 = (E124 * C101) / C106
//
// Mapping:
// E124 = diluentFee_per_m3_raw_crude
// C101 = rawCrudeVol
// C106 = netBlendVol

const diluentFee_per_m3_blend =
  (diluentFee_per_m3_raw * rawCrudeVol) / netBlendVol_afterShrink;


  // ============================
  // SAVE PART E NET SALES
  // ============================

await prisma.scenarioResults.upsert({
  where: { scenarioId: Number(scenarioId) },
  update: {
    partE_net_sales: netRevenue_CAD,
    partE_net_price_per_m3_raw: netPrice_per_m3_raw,
    partE_net_price_per_bbl_cad: netPrice_per_bbl_CAD,
    partE_net_price_per_bbl_usd: netPrice_per_bbl_USD,
    partE_diff_to_wti_usd_bbl: diffToWTI,
    partE_diff_to_wcs_usd_bbl: diffToWCS,
    partE_diluent_fee_m3_raw: diluentFee_per_m3_raw,
    partE_diluent_cost_m3_blend: diluentCost_per_m3_blend,
    partE_c5_diluent_cost_m3_blend: c5DiluentCost_per_m3_blend,
    partE_c4_diluent_cost_m3_blend: c4DiluentCost_per_m3_blend,

  },
  create: {
    scenarioId: Number(scenarioId),
    partE_net_sales: netRevenue_CAD,
    partE_net_price_per_m3_raw: netPrice_per_m3_raw,
    partE_net_price_per_bbl_cad: netPrice_per_bbl_CAD,
    partE_net_price_per_bbl_usd: netPrice_per_bbl_USD,
    partE_diff_to_wti_usd_bbl: diffToWTI,
    partE_diff_to_wcs_usd_bbl: diffToWCS,
    partE_diluent_fee_m3_raw: diluentFee_per_m3_raw,
    partE_diluent_cost_m3_blend: diluentCost_per_m3_blend,
    partE_c5_diluent_cost_m3_blend: c5DiluentCost_per_m3_blend,
    partE_c4_diluent_cost_m3_blend: c4DiluentCost_per_m3_blend,
  },
});


  // ============================
  // RENDER PAGE
  // ============================

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          Heavy Oil Diluent Optimization – Part E: Butane & Condensate Net Sales Calculation
        </h1>

        <div className="mb-4 text-sm text-gray-600">
          <div>
            <span className="font-semibold">Scenario:</span> {scenario.scenario_name}
          </div>
          <div>
            <span className="font-semibold">Month:</span>{" "}
            {monthly.year} {monthly.month}
          </div>
        </div>

        {/* Blend Composition */}
        <h2 className="text-lg font-semibold mb-2">
          Butane & Condensate – Blend Composition
        </h2>

        <table className="w-full text-sm border border-gray-200 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Component</th>
              <th className="p-2 text-left">Volume (m³)</th>
              <th className="p-2 text-left">Density (kg/m³)</th>
              <th className="p-2 text-left">% of Blend</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">Raw Crude</td>
              <td className="p-2">{fmt(rawCrudeVol, 1)}</td>
              <td className="p-2">{fmt(rawCrudeDensity, 1)}</td>
              <td className="p-2">
                {fmt((rawCrudeVol / blendPreShrinkVol) * 100, 2)}%
              </td>
            </tr>

            <tr>
              <td className="p-2">C5+ (Condensate)</td>
              <td className="p-2">{condVol.toFixed(1)}</td>
              <td className="p-2">{condDensity.toFixed(1)}</td>
              <td className="p-2">
                {((condVol / blendPreShrinkVol) * 100).toFixed(2)}%
              </td>
            </tr>

            <tr>
              <td className="p-2">C4 (Butane)</td>
              <td className="p-2">{butaneVol.toFixed(1)}</td>
              <td className="p-2">{butaneDensity.toFixed(1)}</td>
              <td className="p-2">
                {((butaneVol / blendPreShrinkVol) * 100).toFixed(2)}%
              </td>
            </tr>

            <tr className="bg-gray-50">
              <td className="p-2 font-semibold">Blend (pre-Shrinkage)</td>
              <td className="p-2 font-semibold">
                {blendPreShrinkVol.toFixed(1)}
              </td>
              <td className="p-2 font-semibold">
                {blendPreShrinkDensity.toFixed(1)}
              </td>
              <td className="p-2 font-semibold">100.00%</td>
            </tr>

            <tr>
              <td className="p-2">Estimated Shrinkage</td>
              <td className="p-2">{totalShrinkageM3.toFixed(1)}</td>
              <td className="p-2"></td>
              <td className="p-2"></td>
            </tr>

            <tr>
              <td className="p-2 font-semibold">NET BLEND</td>
              <td className="p-2 font-semibold">{netBlendVol.toFixed(1)}</td>
              <td className="p-2"></td>
              <td className="p-2"></td>
            </tr>
          </tbody>
        </table>

        {/* Net Sales Calculation */}
        <h2 className="text-lg font-semibold mb-2">
          Butane & Condensate – Net Sales Calculation
        </h2>

        <table className="w-full text-sm border border-gray-200 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-left">Volume (m³)</th>
              <th className="p-2 text-left">Price (CAD/m³)</th>
              <th className="p-2 text-left">Amount (CAD)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">SALE OF NET BLEND</td>
              <td className="p-2">{fmt(netBlendVol)}</td>
              <td className="p-2">{fmt(heavyStreamPriceCadM3)}</td>
<td className="p-2">
  {(netBlendVol * heavyStreamPriceCadM3).toFixed(2)}
</td>
</tr>

<tr>
  <td className="p-2">C5+ Cost</td>
  <td className="p-2">{condVol.toFixed(2)}</td>
  <td className="p-2">{(-condensatePriceAfterEqCadM3).toFixed(2)}</td>
  <td className="p-2">{(-c5Cost_CAD).toFixed(2)}</td>
</tr>

<tr>
  <td className="p-2">C4 Cost</td>
  <td className="p-2">{butaneVol.toFixed(2)}</td>
  <td className="p-2">{(-c4PriceCadM3).toFixed(2)}</td>
  <td className="p-2">{(-c4Cost_CAD).toFixed(2)}</td>
</tr>

<tr>
  <td className="p-2">C5+ Transportation</td>
  <td className="p-2">{condVol.toFixed(2)}</td>
  <td className="p-2">{(-c5TransportRate).toFixed(2)}</td>
  <td className="p-2">{(-c5Transport_CAD).toFixed(2)}</td>
</tr>

<tr>
  <td className="p-2">Blend Transportation</td>
  <td className="p-2">{blendPreShrinkVol.toFixed(2)}</td>
  <td className="p-2">{(-blendTransportRate).toFixed(2)}</td>
  <td className="p-2">{(-blendTransport_CAD).toFixed(2)}</td>
</tr>

<tr>
  <td className="p-2">Loss Allowance</td>
  <td className="p-2">{lossAllowanceVolume.toFixed(2)}</td>
  <td className="p-2">{(-heavyStreamPriceCadM3).toFixed(2)}</td>
  <td className="p-2">{(-lossAllowance_CAD).toFixed(2)}</td>
</tr>

<tr className="bg-gray-50">
  <td className="p-2 font-semibold">NET</td>
  <td className="p-2"></td>
  <td className="p-2"></td>
  <td className="p-2 font-semibold">{netRevenue_CAD.toFixed(2)}</td>
</tr>

</tbody>
</table>

{/* Net Price Metrics */}
<h2 className="text-lg font-semibold mb-2">
  Net Price Metrics – Butane & Condensate Case
</h2>

<table className="w-full text-sm border border-gray-200 mb-6">
  <tbody>

  <tr className="bg-gray-50 font-semibold">
    <td className="p-2">Metric</td>
    <td className="p-2">Value</td>
    <td className="p-2">Details</td>
  </tr>

  {/* Raw Crude Volume */}
  <tr>
    <td className="p-2">m³ Raw Crude Production</td>
    <td className="p-2">{fmt(rawCrudeVol, 1)} m³</td>
    <td className="p-2">
      <details>
        <summary className="cursor-pointer text-blue-600">Explain</summary>
        <div className="mt-1">
          Total raw heavy crude delivered by the producer.
        </div>
      </details>
    </td>
  </tr>

  {/* Net Price per m³ */}
  <tr>
    <td className="p-2">Net Price Received per m³ Raw Crude</td>
    <td className="p-2">{netPrice_per_m3_raw.toFixed(2)} CAD/m³</td>
    <td className="p-2">
      <details>
        <summary className="cursor-pointer text-blue-600">Explain</summary>
        <div className="mt-1">
          <strong>Formula:</strong><br />
          Net Price per m³ = <strong>Net Sales (CAD)</strong> ÷ <strong>Raw Crude Volume (m³)</strong><br /><br />
          Represents the producer’s realized price after diluent costs, blend transport, and loss allowance.
        </div>
      </details>
    </td>
  </tr>

  {/* Net Price per bbl CAD */}
  <tr>
    <td className="p-2">Net Price per bbl (CAD)</td>
    <td className="p-2">{netPrice_per_bbl_CAD.toFixed(2)} CAD/bbl</td>
    <td className="p-2">
      <details>
        <summary className="cursor-pointer text-blue-600">Explain</summary>
        <div className="mt-1">
          <strong>Formula:</strong><br />
          Net Price per bbl (CAD) = <strong>Net Price per m³</strong> ÷ <strong>6.2898</strong><br /><br />
          Converts CAD/m³ to CAD/bbl using the standard heavy‑oil conversion factor.
        </div>
      </details>
    </td>
  </tr>

  {/* Net Price per bbl USD */}
  <tr>
    <td className="p-2">Net Price per bbl (USD)</td>
    <td className="p-2">{netPrice_per_bbl_USD.toFixed(2)} USD/bbl</td>
    <td className="p-2">
      <details>
        <summary className="cursor-pointer text-blue-600">Explain</summary>
        <div className="mt-1">
          <strong>Formula:</strong><br />
          Net Price per bbl (USD) = <strong>Net Price per bbl (CAD)</strong> ÷ <strong>FX Rate</strong><br /><br />
          Converts CAD/bbl to USD/bbl using the monthly foreign exchange rate.
        </div>
      </details>
    </td>
  </tr>

  {/* Diff to WTI */}
  <tr>
    <td className="p-2">Net Price EXPRESSED AS Diff to WTI</td>
    <td className="p-2">{diffToWTI.toFixed(2)} USD/bbl</td>
    <td className="p-2">
      <details>
        <summary className="cursor-pointer text-blue-600">Explain</summary>
        <div className="mt-1">
          <strong>Formula:</strong><br />
          Diff to WTI = <strong>Net Price (USD/bbl)</strong> – <strong>WTI Price</strong><br /><br />
          Shows how the producer’s realized price compares to the WTI benchmark.
        </div>
      </details>
    </td>
  </tr>

  {/* Diff to WCS */}
  <tr>
    <td className="p-2">Net Price EXPRESSED AS Diff to WCS</td>
    <td className="p-2">{diffToWCS.toFixed(2)} USD/bbl</td>
    <td className="p-2">
      <details>
        <summary className="cursor-pointer text-blue-600">Explain</summary>
        <div className="mt-1">
          <strong>Formula:</strong><br />
          Diff to WCS = <strong>Diff to WTI</strong> – <strong>Heavy Index Price</strong><br /><br />
          Shows how the producer’s realized price compares to the WCS heavy benchmark.
        </div>
      </details>
    </td>
  </tr>

  {/* Diluent Fee Raw Crude (Cost) */}
  <tr>
    <td className="p-2">Diluent Fee per m³ of Raw Crude (Cost)</td>
    <td className="p-2">{diluentFee_per_m3_raw.toFixed(2)} CAD/m³</td>
    <td className="p-2">
      <details>
        <summary className="cursor-pointer text-blue-600">Explain</summary>
        <div className="mt-1">
          <strong>Formula:</strong><br />
          Diluent Fee (Cost) = <strong>Net Price per m³</strong><br />
          – <strong>Heavy Stream Price</strong><br />
          – <strong>Blend Transportation</strong><br />
          – <strong>(Loss Allowance ÷ Blend Volume Before Shrinkage) × Heavy Stream Price</strong><br /><br />
          Represents the <em>economic cost</em> of diluent relative to heavy stream price, blend transport, and loss allowance.
        </div>
      </details>
    </td>
  </tr>

  {/* Diluent Fee Raw Heavy (Benefit) */}
  <tr>
    <td className="p-2">Diluent Fee per m³ Raw Heavy (Benefit)</td>
    <td className="p-2">{diluentFee_per_m3_raw_heavy.toFixed(2)} CAD/m³</td>
    <td className="p-2">
      <details>
        <summary className="cursor-pointer text-blue-600">Explain</summary>
        <div className="mt-1">
          <strong>Formula:</strong><br />
          Diluent Fee (Benefit) =<br />
          <strong>(Incremental Blend Value – Incremental Diluent Cost)</strong><br />
          ÷ <strong>Raw Crude Volume</strong><br /><br />
          Measures the <em>economic benefit</em> of using Butane + Condensate instead of Condensate alone.
        </div>
      </details>
    </td>
  </tr>

  {/* C5 Diluent Cost */}
  <tr>
    <td className="p-2">C5 Diluent COST per m³ of Blended Crude</td>
    <td className="p-2">{c5DiluentCost_per_m3_blend.toFixed(2)} CAD/m³</td>
    <td className="p-2">
      <details>
        <summary className="cursor-pointer text-blue-600">Explain</summary>
        <div className="mt-1">
          <strong>Formula:</strong><br />
          C5 Cost per m³ Blend =<br />
          <strong>(C5 Purchase Cost + C5 Transportation Cost)</strong><br />
          ÷ <strong>Net Blend Volume</strong><br /><br />
          Shows the cost contribution of Condensate (C5+) to each m³ of blended crude.
        </div>
      </details>
    </td>
  </tr>

  {/* C4 Diluent Cost */}
  <tr>
    <td className="p-2">C4 Diluent COST per m³ of Blended Crude</td>
    <td className="p-2">{c4DiluentCost_per_m3_blend.toFixed(2)} CAD/m³</td>
    <td className="p-2">
      <details>
        <summary className="cursor-pointer text-blue-600">Explain</summary>
        <div className="mt-1">
          <strong>Formula:</strong><br />
          C4 Cost per m³ Blend = <strong>C4 Purchase Cost</strong> ÷ <strong>Net Blend Volume</strong><br /><br />
          Shows the cost contribution of Butane (C4). No transportation cost applies.
        </div>
      </details>
    </td>
  </tr>

  {/* Diluent Fee per m³ Blend */}
  <tr>
    <td className="p-2">Diluent Fee per m³ of Blended Crude</td>
    <td className="p-2">{diluentFee_per_m3_blend.toFixed(2)} CAD/m³</td>
    <td className="p-2">
      <details>
        <summary className="cursor-pointer text-blue-600">Explain</summary>
        <div className="mt-1">
          <strong>Formula:</strong><br />
          Diluent Fee per m³ Blend =<br />
          <strong>(Diluent Fee per m³ Raw Crude)</strong> × <strong>Raw Crude Volume</strong><br />
          ÷ <strong>Net Blend Volume</strong><br /><br />
          Shows the diluent cost embedded in each m³ of blended crude sold.
        </div>
      </details>
    </td>
  </tr>

</tbody>

</table>


<div className="flex justify-between">
  <a href="/models" className="text-blue-600 underline">
    ← Back to Models
  </a>

  <a
    href={`/heavy-oil/model-f?scenarioId=${scenarioId}`}
    className="text-blue-600 underline"
  >
    Continue to Part F (Net Financial Benefit)
  </a>
</div>

      </div>
    </main>
  );
}

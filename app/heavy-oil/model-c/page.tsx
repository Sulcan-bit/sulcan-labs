// app/heavy-oil/model-c/page.tsx

import { prisma } from "@/lib/prisma";
import {
  heavy_oil_conversion_factor,
  light_oil_conversion_factor,
  butane_density_kg_m3,
  edi_fee_cad_m3,
  colc_fee_cad_m3,
  condensate_sulphur_slope,
} from "@/app/heavy-oil/constants";

const fmt = (n: number | null | undefined, decimals = 2) => {
  if (typeof n !== "number") return "-";
  return n.toLocaleString("en-CA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

function getCondensateIndexUsdBbl(monthly: any, choice?: string | null) {
  switch (choice) {
    case "CRW":
      return 0;
    case "FTSK":
      return monthly.ftsk_c5_diff_usd_bbl ?? 0;
    case "PEACE_C5":
      return monthly.peace_c5_diff_usd_bbl ?? 0;
    case "OTHER":
      return 0;
    default:
      return 0;
  }
}

function getHeavyStreamIndexUsdBbl(monthly: any, stream: string) {
  switch (stream) {
    case "CHV":
      return monthly.chv_diff_usd_bbl ?? 0;
    case "LLB":
      return monthly.llb_diff_usd_bbl ?? 0;
    case "CWH":
      return monthly.cwh_diff_usd_bbl ?? 0;
    case "WCB":
      return monthly.wcb_diff_usd_bbl ?? 0;
    case "WCS":
      return 0;
    default:
      return 0;
  }
}

type PageProps = {
  searchParams: Promise<{ scenarioId?: string }>;
};

export default async function CondensateOnlyNetSalesPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const scenarioId = searchParams?.scenarioId;

  if (!scenarioId) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Heavy Oil Diluent Optimization – Part C: Condensate Only Net Sales
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
            Heavy Oil Diluent Optimization – Part C: Condensate Only Net Sales
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
            Heavy Oil Diluent Optimization – Part C: Condensate Only Net Sales
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

  const wti = monthly.wti_cma_usd_bbl ?? 0;
  const fx = monthly.fx_cad_usd ?? 0;

  const heavyStreamIndexUsdBbl = getHeavyStreamIndexUsdBbl(
    monthly,
    inputs.heavy_oil_stream ?? "WCS"
  );

  const condensateIndexUsdBbl = getCondensateIndexUsdBbl(
    monthly,
    inputs.condensate_index_choice ?? undefined
  );

  const premiumHeavyPriceUsdBbl = 0;

  // Heavy oil stream price (Blend Sales Price)
  const heavyStreamPriceCadM3 =
    (wti + heavyStreamIndexUsdBbl + premiumHeavyPriceUsdBbl) *
    heavy_oil_conversion_factor *
    fx;

  // Condensate pricing (after EQ)
  const condensateWadfCadM3 = monthly.crw_c5_enb_wadf_cad_m3 ?? 0;

  const condensateParPriceCadM3 =
    (wti + condensateIndexUsdBbl + premiumHeavyPriceUsdBbl) *
      light_oil_conversion_factor *
      fx +
    condensateWadfCadM3;

  const condensateStreamPriceCadM3 =
    condensateParPriceCadM3 - condensateWadfCadM3;

  const condensateAllowancePriceCadM3 =
    monthly.c5_allow_price_cad_m3 ?? 0;

  const condensateDensity = inputs.cond1_density_kg_m3 ?? 0;
  const condensateSulphur = (inputs.cond1_sulphur_pct ?? 0) / 100;

  const condensateDensitySlope =
    monthly.c5_density_slope_cad_m3_per_kg_m3 ?? 0;

  const condensateEqCredit =
    (750 - condensateDensity) * condensateDensitySlope +
    (0.2 - condensateSulphur) * (condensate_sulphur_slope * 10);

  const condensatePriceAfterEqCadM3 =
  condensateStreamPriceCadM3 +
  condensateEqCredit;


  // C4 (butane) price – from Pricing Assumptions
  const c4PricePctWti = monthly.c4_to_wti_usd_bbl ?? 0;
  const c4PriceCadM3 =
    wti * c4PricePctWti * light_oil_conversion_factor * fx;

  // Blend composition (Condensate Only)
  const rawCrudeVol = inputs.producer_volume_m3 ?? 0;
  const rawCrudeDensity = inputs.producer_density_kg_m3 ?? 0;

  const condVol = inputs.cond1_est_volume_m3 ?? 0;
  const condDensity = inputs.cond1_density_kg_m3 ?? 0;

  const butaneVol = 0;
  const blendPreShrinkVol = rawCrudeVol + condVol;

  const blendPreShrinkDensity =
    blendPreShrinkVol > 0
      ? (rawCrudeVol * rawCrudeDensity + condVol * condDensity) /
        blendPreShrinkVol
      : 0;

  // Shrinkage – reuse API 12.3 logic (Condensate Only)
  const dL = condDensity;
  const dH = rawCrudeDensity;

  const totalEstimatedBlendedVolumeM3 = blendPreShrinkVol;

  const X =
    totalEstimatedBlendedVolumeM3 > 0
      ? (condVol / totalEstimatedBlendedVolumeM3) * 100
      : 0;

  const inv_dL = dL > 0 ? 1 / dL : 0;
  const inv_dH = dH > 0 ? 1 / dH : 0;

  function shrinkagePercent(F: number, I: number, J: number): number {
    return 26900 * F * Math.pow(100 - F, 0.819) * Math.pow(I - J, 2.28);
  }

  const shrinkPctButane = shrinkagePercent(
    0,
    1 / butane_density_kg_m3,
    1 / rawCrudeDensity
  );
  const shrinkPctCond = shrinkagePercent(X, inv_dL, inv_dH);
  const shrinkPctOil = shrinkagePercent(100, inv_dH, inv_dH); // → 0

  const sumVolButane = rawCrudeVol;
  const sumVolCond = rawCrudeVol + condVol;
  const sumVolOil = sumVolCond;

  const shrinkVolButane = (shrinkPctButane / 100) * sumVolButane;
  const shrinkVolCond = (shrinkPctCond / 100) * sumVolCond;
  const shrinkVolOil = (shrinkPctOil / 100) * sumVolOil;

  const totalShrinkageM3 =
    shrinkVolButane + shrinkVolCond + shrinkVolOil;

  const netBlendVol = blendPreShrinkVol - totalShrinkageM3;

// ------------------------------------------------------------
// TRANSPORTATION & LOSS ALLOWANCE (CORRECTED)
// ------------------------------------------------------------

// C5+ Transportation = Load Fee + Transport TT1
const c5TransportRate =
  Number(inputs.cond1_load_fee_cad_m3 ?? 0) +
  Number(inputs.cond1_transport_tt1_cad_m3 ?? 0);

const c5Transport_CAD = condVol * c5TransportRate;

// Blend Transportation = TT1 Fee + Pipeline Toll TT1 + Power + EDI + COLC + Loss Allowance (CAD/m³)
const blendTransportBaseCadM3 =
  Number(inputs.tt1_fee_cad_m3 ?? 0) +
  Number(inputs.pipeline_toll_tt1_cad_m3 ?? 0) +
  Number(inputs.pipeline_power_surcharge_cad_m3 ?? 0) +
  edi_fee_cad_m3 +
  colc_fee_cad_m3;

// Loss allowance % converted to CAD/m³ using Net Blend Price
const pipelineLossAllowancePct =
  Number(inputs.pipeline_loss_allowance_pct ?? 0) / 100;

const lossAllowancePriceCadM3 =
  pipelineLossAllowancePct * heavyStreamPriceCadM3;

const blendTransportRate =
  blendTransportBaseCadM3

const blendTransport_CAD =
  blendPreShrinkVol * blendTransportRate;

// Loss Allowance volume 
const lossAllowanceVolume =
  pipelineLossAllowancePct * blendPreShrinkVol;


const lossAllowance_CAD =
  lossAllowanceVolume * heavyStreamPriceCadM3;

// ------------------------------------------------------------
// NET SALES CALCULATION (CORRECTED)
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// NET PRICE METRICS (UNCHANGED)
// ------------------------------------------------------------
const netPrice_per_m3_raw =
  rawCrudeVol > 0 ? netRevenue_CAD / rawCrudeVol : 0;

const netPrice_per_bbl_CAD =
  netPrice_per_m3_raw / heavy_oil_conversion_factor;

// Correct USD conversion (CAD ÷ FX)
const netPrice_per_bbl_USD = netPrice_per_bbl_CAD / fx;

const wcsPriceUsdBbl = monthly.wcs_price_usd_bbl ?? 0;

// Correct diffs (now that USD is correct)
const diffToWTI = netPrice_per_bbl_USD - wti;
// Correct Excel logic:
// Diff to WCS = Diff to WTI − Heavy Oil Index
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
  -((c5Cost_CAD + c4Cost_CAD + c5Transport_CAD) / netBlendVol_afterShrink);

const diluentFee_noHub_per_m3_raw =
  (
    ((condVol - totalShrinkageM3 - lossAllowanceVolume) *
      heavyStreamPriceCadM3) -
    (condVol * condensatePriceAfterEqCadM3)
  ) / rawCrudeVol;

await prisma.scenarioResults.upsert({
  where: { scenarioId: scenario.id },
  update: {
    partC_net_sales: netRevenue_CAD,
    partC_net_price_per_m3_raw: netPrice_per_m3_raw,
    partC_diluent_cost_m3_blend: diluentCost_per_m3_blend,
    partC_diluent_fee_m3_raw: diluentFee_per_m3_raw,
    partC_diff_to_wcs_usd_bbl: diffToWCS,
    partD_net_blend_volume_m3: netBlendVol
  },
  create: {
    scenarioId: scenario.id,
    partC_net_sales: netRevenue_CAD,
    partC_net_price_per_m3_raw: netPrice_per_m3_raw,
    partC_diluent_cost_m3_blend: diluentCost_per_m3_blend,
    partC_diluent_fee_m3_raw: diluentFee_per_m3_raw,
    partC_diff_to_wcs_usd_bbl: diffToWCS,
    partD_net_blend_volume_m3: netBlendVol
  }
});

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Heavy Oil Diluent Optimization – Part C: Condensate Only Net Sales Calculation
        </h1>

        <div className="mb-4 text-sm text-gray-600">
          <div>
  <span className="font-semibold">Scenario:</span> {scenario.scenario_name}
</div>
<div>
  <span className="font-semibold">Operator:</span> {scenario.terminal_operator}
</div>
<div>
  <span className="font-semibold">Location:</span> {scenario.terminal_location}
</div>

          <div>
            <span className="font-semibold">Month:</span>{" "}
            {monthly.year} {monthly.month}
          </div>
        </div>

        {/* Blend Composition */}
        <h2 className="text-lg font-semibold mb-2">
          Condensate Only – Blend Composition
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
                {blendPreShrinkVol > 0
                  ? ((rawCrudeVol / blendPreShrinkVol) * 100).toFixed(2)
                  : "0.00"}
                %
              </td>
            </tr>
            <tr>
              <td className="p-2">C5+ (Condensate)</td>
              <td className="p-2">{condVol.toFixed(1)}</td>
              <td className="p-2">{condDensity.toFixed(1)}</td>
              <td className="p-2">
                {blendPreShrinkVol > 0
                  ? ((condVol / blendPreShrinkVol) * 100).toFixed(2)
                  : "0.00"}
                %
              </td>
            </tr>
            <tr>
              <td className="p-2">C4 (Butane)</td>
              <td className="p-2">-</td>
              <td className="p-2">{butane_density_kg_m3.toFixed(1)}</td>
              <td className="p-2">0.00%</td>
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
  Condensate Only – Net Sales Calculation
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
    <td className="p-2">{fmt(saleOfNetBlend_CAD)}</td>
  </tr>

  <tr>
    <td className="p-2">C5+ Cost</td>
    <td className="p-2">{condVol.toFixed(2)}</td>
    <td className="p-2">{(-condensatePriceAfterEqCadM3).toFixed(2)}</td>
    <td className="p-2">{(-c5Cost_CAD).toFixed(2)}</td>
  </tr>

  <tr>
    <td className="p-2">C4 Cost</td>
    <td className="p-2">-</td>
    <td className="p-2">-</td>
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
  Net Price Metrics – Condensate Only Case
</h2>
<table className="w-full text-sm border border-gray-200 mb-6">
  <tbody>
    <tr>
      <td className="p-2">m³ Raw Crude Production</td>
      <td className="p-2">{fmt(rawCrudeVol, 1)} m³</td>
    </tr>
    <tr>
      <td className="p-2">Net Price Received per m³ Raw Crude</td>
      <td className="p-2">
        {netPrice_per_m3_raw.toFixed(2)} CAD/m³
      </td>
    </tr>
    <tr>
      <td className="p-2">Net Price per bbl (CAD)</td>
      <td className="p-2">
        {netPrice_per_bbl_CAD.toFixed(2)} CAD/bbl
      </td>
    </tr>
    <tr>
      <td className="p-2">Net Price per bbl (USD)</td>
      <td className="p-2">
        {netPrice_per_bbl_USD.toFixed(2)} USD/bbl
      </td>
    </tr>
    <tr>
      <td className="p-2">
        Raw Crude Net Price EXPRESSED AS Diff to WTI
      </td>
      <td className="p-2">
        {diffToWTI.toFixed(2)} USD/bbl
      </td>
    </tr>
    <tr>
      <td className="p-2">
        Raw Crude Net Price EXPRESSED AS Diff to WCS
      </td>
      <td className="p-2">
        {diffToWCS.toFixed(2)} USD/bbl
      </td>
    </tr>
    <tr>
      <td className="p-2">Diluent Fee per m³ of Raw Crude</td>
      <td className="p-2">
        {diluentFee_per_m3_raw.toFixed(2)} CAD/m³
      </td>
    </tr>

    {/* ⭐ NEW ROW INSERTED HERE (Excel A70) */}
    <tr>
      <td className="p-2">
        Diluent Fee per m³ of Raw Crude (No C5+ Transport from Hub)
      </td>
      <td className="p-2">
        {diluentFee_noHub_per_m3_raw.toFixed(2)} CAD/m³
      </td>
    </tr>

    <tr>
      <td className="p-2">
        Diluent COST per m³ of Blended Crude
      </td>
      <td className="p-2">
        {diluentCost_per_m3_blend.toFixed(2)} CAD/m³
      </td>
    </tr>
  </tbody>
</table>


        <div className="flex justify-between">
          <a href="/models" className="text-blue-600 underline">
            ← Back to Models
          </a>
          <a
            href={`/heavy-oil/model-d?scenarioId=${scenarioId}`}
            className="text-blue-600 underline"
          >
            Continue to Part D (Butane & Condy Blend – Physical Model)
          </a>
        </div>
      </div>
    </main>
  );
}

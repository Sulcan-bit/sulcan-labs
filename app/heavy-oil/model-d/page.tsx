// app/heavy-oil/model-d/page.tsx

import { prisma } from "@/lib/prisma";
import { butane_density_kg_m3 } from "@/app/heavy-oil/constants";

type PageProps = {
  searchParams: Promise<{ scenarioId?: string }>;
};

export default async function HeavyOilModelDPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const scenarioId = searchParams?.scenarioId;

  if (!scenarioId) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Heavy Oil Diluent Optimization – Part D: Physical Blend
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
            Heavy Oil Diluent Optimization – Part D: Physical Blend
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

  const monthly = scenario.month;

  // RAW CRUDE
  const rawCrudeVol = inputs?.producer_volume_m3 ?? 0;
  const producer_density_kg_m3 = inputs?.producer_density_kg_m3 ?? 0;

  // BUTANE (Primary Diluent)
  const butaneInjectionRatePct = inputs?.butane_injection_rate_pct ?? 0;
  const butaneDensity = butane_density_kg_m3;

  // Butane volume = % of raw crude
  const butaneVol_m3 = rawCrudeVol * (butaneInjectionRatePct / 100);

  // CONDENSATE (Secondary Diluent)
  const cond_density_kg_m3 = inputs?.cond1_density_kg_m3 ?? 0;

  // TARGET BLEND DENSITY (User Input)
  const target_blend_density = inputs?.target_blend_density ?? 0;

  // HISTORICAL ACTUAL BLEND DENSITY (User Input)
  const historicalActualBlendDensity = inputs?.actual_blend_density_kg_m3 ?? 0;

  // Excel: Condensate Volume Formula (API 12.3 Physical Blend)
  const condVol_m3 = Math.max(
    0,
    (
      rawCrudeVol * producer_density_kg_m3 +
      butaneVol_m3 * butaneDensity -
      target_blend_density * rawCrudeVol -
      target_blend_density * butaneVol_m3
    ) / (target_blend_density - cond_density_kg_m3)
  );

  // Total blend volume (Total Receipts)
  const totalBlendVol_m3 = rawCrudeVol + butaneVol_m3 + condVol_m3;

  // % of blend
  const rawPctOfBlend = totalBlendVol_m3 > 0 ? (rawCrudeVol / totalBlendVol_m3) * 100 : 0;
  const butanePctOfBlend = totalBlendVol_m3 > 0 ? (butaneVol_m3 / totalBlendVol_m3) * 100 : 0;
  const condPctOfBlend = totalBlendVol_m3 > 0 ? (condVol_m3 / totalBlendVol_m3) * 100 : 0;

  // % of raw crude (for butane)
  const butanePctOfRaw = rawCrudeVol > 0 ? (butaneVol_m3 / rawCrudeVol) * 100 : 0;

  // Weighted average density
  const weightedAvgDensity =
    totalBlendVol_m3 > 0
      ? (
          rawCrudeVol * producer_density_kg_m3 +
          butaneVol_m3 * butaneDensity +
          condVol_m3 * cond_density_kg_m3
        ) / totalBlendVol_m3
      : 0;

  // ------------------------------------------------------------
  // API 12.3 Sec. 5.3 Shrinkage – Butane + Condensate + Oil
  // ------------------------------------------------------------

  function shrinkagePercent(F: number, I: number, J: number): number {
    return F === 0
      ? 0
      : 26900 * F * Math.pow(100 - F, 0.819) * Math.pow(I - J, 2.28);
  }

  // Row 1 – Butane (B91, D91, F91, I91, J91)
  const sumVolButane = rawCrudeVol + butaneVol_m3; // B91 + D91
  const X_butane = sumVolButane > 0 ? (butaneVol_m3 / sumVolButane) * 100 : 0; // F91
  const inv_dL_butane = 1 / butaneDensity; // I91
  const inv_dH_crude = 1 / producer_density_kg_m3; // J91

  const shrinkPctButane = shrinkagePercent(X_butane, inv_dL_butane, inv_dH_crude); // H79
  const shrinkVolButane = (shrinkPctButane / 100) * sumVolButane; // I79
  const resultantVolButane = sumVolButane - shrinkVolButane; // K79

  // Row 2 – Condensate (B92, D92, F92, I92, J92)
  const crudeVolCondRow = resultantVolButane; // D92 = K79
  const sumVolCond = crudeVolCondRow + condVol_m3; // B92 + D92

  const X_cond = sumVolCond > 0 ? (condVol_m3 / sumVolCond) * 100 : 0; // F92
  const inv_dL_cond = 1 / cond_density_kg_m3; // I92

  const shrinkPctCond = shrinkagePercent(X_cond, inv_dL_cond, inv_dH_crude); // H80
  const shrinkVolCond = (shrinkPctCond / 100) * sumVolCond; // I80
  const resultantVolCond = sumVolCond - shrinkVolCond; // K80

  // Row 3 – Oil (B93, D93, F93, I93, J93)
  const sumVolOil = resultantVolCond; // B93 + D93
  const shrinkPctOil = 0; // H81
  const shrinkVolOil = 0; // I81
  const resultantVolOil = sumVolOil; 

  // Totals (H82, I82, K82)
  const totalShrinkageM3 = shrinkVolButane + shrinkVolCond + shrinkVolOil; 
  const netVolumeM3 = resultantVolOil; 
  const totalShrinkagePct =
    netVolumeM3 > 0 ? (totalShrinkageM3 / netVolumeM3) * 100 : 0; // H82

  const totalReceipts = totalBlendVol_m3; 
  const totalShrinkageSigned = -totalShrinkageM3; 
  const netVolume = netVolumeM3; 
  const totalShrinkageAsPctOfReceipts =
    totalReceipts > 0 ? (totalShrinkageM3 / totalReceipts) * 100 : 0; // H86/I86

await prisma.scenarioResults.upsert({
  where: { scenarioId: scenario.id },
  update: {
    partD_net_blend_volume_m3: netVolumeM3
  },
  create: {
    scenarioId: scenario.id,
    partD_net_blend_volume_m3: netVolumeM3
  }
});


  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          Heavy Oil Diluent Optimization – Part D: Physical Blend (Butane + Condensate)
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

        {/* TEMP CORR. VOLUMES & DENSITY INPUTS */}
        <h2 className="text-lg font-semibold mb-2">
          Temp Corrected Volumes & Density Inputs (Physical Blend – Butane & Condensate)
        </h2>

        <table className="w-full text-sm border border-gray-200 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Component</th>
              <th className="p-2 text-right">Volume (m³)</th>
              <th className="p-2 text-right">Density @ 15°C (kg/m³)</th>
              <th className="p-2 text-right">% of Blend</th>
              <th className="p-2 text-right">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">RAW CRUDE OIL</td>
              <td className="p-2 text-right">{rawCrudeVol.toFixed(1)}</td>
              <td className="p-2 text-right">{producer_density_kg_m3.toFixed(1)}</td>
              <td className="p-2 text-right">{rawPctOfBlend.toFixed(3)}%</td>
              <td className="p-2"></td>
            </tr>

            <tr>
              <td className="p-2">Butane (Primary Diluent)</td>
              <td className="p-2 text-right">{butaneVol_m3.toFixed(1)}</td>
              <td className="p-2 text-right">{butaneDensity.toFixed(1)}</td>
              <td className="p-2 text-right">{butanePctOfBlend.toFixed(3)}%</td>
              <td className="p-2 text-right">{butanePctOfRaw.toFixed(2)}% of Raw</td>
            </tr>

            <tr>
              <td className="p-2">Condensate (Secondary Diluent)</td>
              <td className="p-2 text-right">{condVol_m3.toFixed(1)}</td>
              <td className="p-2 text-right">{cond_density_kg_m3.toFixed(1)}</td>
              <td className="p-2 text-right">{condPctOfBlend.toFixed(3)}%</td>
              <td className="p-2 text-right">
                {target_blend_density.toFixed(1)} kg/m³ target
              </td>
            </tr>

            <tr className="font-semibold">
              <td className="p-2">Total Receipts</td>
              <td className="p-2 text-right">{totalBlendVol_m3.toFixed(1)}</td>
              <td className="p-2"></td>
              <td className="p-2 text-right">100.000%</td>
              <td className="p-2"></td>
            </tr>

            <tr>
              <td className="p-2 font-semibold">Wt. Avg. Density</td>
              <td className="p-2"></td>
              <td className="p-2 text-right font-semibold">
                {weightedAvgDensity.toFixed(1)} kg/m³
              </td>
              <td className="p-2"></td>
              <td className="p-2 text-right">
                {historicalActualBlendDensity.toFixed(1)} kg/m³ historical
              </td>
            </tr>
          </tbody>
        </table>

        {/* API 12.3 Shrinkage Inputs */}
        <h2 className="text-lg font-semibold mb-2">
          API 12.3 Shrinkage Inputs (Butane & Condensate)
        </h2>

        <table className="w-full text-sm border border-gray-200 mb-6">
          <tbody>
            <tr>
              <td className="p-2">dL (Density of Light – Butane)</td>
              <td className="p-2">{butaneDensity.toFixed(2)}</td>
              <td className="p-2">kg/m³</td>
            </tr>
            <tr>
              <td className="p-2">dL (Density of Light – Condensate)</td>
              <td className="p-2">{cond_density_kg_m3.toFixed(2)}</td>
              <td className="p-2">kg/m³</td>
            </tr>
            <tr>
              <td className="p-2">dH (Density of Heavy – Raw Crude)</td>
              <td className="p-2">{producer_density_kg_m3.toFixed(2)}</td>
              <td className="p-2">kg/m³</td>
            </tr>
            <tr>
              <td className="p-2">1/dL (Butane)</td>
              <td className="p-2">{inv_dL_butane.toFixed(5)}</td>
              <td className="p-2">1 / dL</td>
            </tr>
            <tr>
              <td className="p-2">1/dL (Condensate)</td>
              <td className="p-2">{inv_dL_cond.toFixed(5)}</td>
              <td className="p-2">1 / dL</td>
            </tr>
            <tr>
              <td className="p-2">1/dH</td>
              <td className="p-2">{inv_dH_crude.toFixed(5)}</td>
              <td className="p-2">1 / dH</td>
            </tr>
          </tbody>
        </table>

        {/* API 12.3 Sec. 5.3 – Iteration Table */}
        <h2 className="text-lg font-semibold mb-2">
          API 12.3 Sec. 5.3 – Iteration Table (Butane & Condensate)
        </h2>

        <table className="w-full text-sm border border-gray-200 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Component</th>
              <th className="p-2 text-right">Diluent Vol (m³)</th>
              <th className="p-2 text-right">Diluent Density (kg/m³)</th>
              <th className="p-2 text-right">Crude Vol (m³)</th>
              <th className="p-2 text-right">Crude Density (kg/m³)</th>
              <th className="p-2 text-right">X (%)</th>
              <th className="p-2 text-right">XX (%)</th>
              <th className="p-2 text-right">Blend (%)</th>
              <th className="p-2 text-right">1/dL</th>
              <th className="p-2 text-right">1/dH</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">Butane</td>
              <td className="p-2 text-right">{butaneVol_m3.toFixed(1)}</td>
              <td className="p-2 text-right">{butaneDensity.toFixed(2)}</td>
              <td className="p-2 text-right">{rawCrudeVol.toFixed(1)}</td>
              <td className="p-2 text-right">{producer_density_kg_m3.toFixed(2)}</td>
              <td className="p-2 text-right">{X_butane.toFixed(2)}</td>
              <td className="p-2 text-right">
                {(100 - X_butane).toFixed(2)}
              </td>
              <td className="p-2 text-right">100.00</td>
              <td className="p-2 text-right">{inv_dL_butane.toFixed(5)}</td>
              <td className="p-2 text-right">{inv_dH_crude.toFixed(5)}</td>
            </tr>
            <tr>
              <td className="p-2">Condensate</td>
              <td className="p-2 text-right">{condVol_m3.toFixed(1)}</td>
              <td className="p-2 text-right">{cond_density_kg_m3.toFixed(2)}</td>
              <td className="p-2 text-right">{crudeVolCondRow.toFixed(1)}</td>
              <td className="p-2 text-right">{producer_density_kg_m3.toFixed(2)}</td>
              <td className="p-2 text-right">{X_cond.toFixed(2)}</td>
              <td className="p-2 text-right">
                {(100 - X_cond).toFixed(2)}
              </td>
              <td className="p-2 text-right">100.00</td>
              <td className="p-2 text-right">{inv_dL_cond.toFixed(5)}</td>
              <td className="p-2 text-right">{inv_dH_crude.toFixed(5)}</td>
            </tr>
            <tr>
              <td className="p-2">OIL</td>
              <td className="p-2 text-right">{sumVolOil.toFixed(1)}</td>
              <td className="p-2 text-right">{producer_density_kg_m3.toFixed(2)}</td>
              <td className="p-2 text-right">-</td>
              <td className="p-2 text-right">-</td>
              <td className="p-2 text-right">100.00</td>
              <td className="p-2 text-right">-</td>
              <td className="p-2 text-right">100.00</td>
              <td className="p-2 text-right">{inv_dH_crude.toFixed(5)}</td>
              <td className="p-2 text-right">-</td>
            </tr>
          </tbody>
        </table>

 {/* ========================= */}
{/*   RESULTS SECTION (CARD)  */}
{/* ========================= */}

<div className="bg-white p-6 rounded shadow mt-10">
  <h2 className="text-xl font-bold mb-4">RESULTS</h2>

  <table className="w-full text-sm border border-gray-200 mb-6">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-2 text-left">Shrinkage Percent</th>
        <th className="p-2 text-right">Shrinkage (m³)</th>
        <th className="p-2 text-right">Sum of Volumes (m³)</th>
        <th className="p-2 text-right">Resultant Volume (m³)</th>
      </tr>
    </thead>
    <tbody>

      {/* ROW 1 — BUTANE */}
      <tr>
        <td className="p-2">{shrinkPctButane.toFixed(5)}%</td>
        <td className="p-2 text-right">{shrinkVolButane.toFixed(3)}</td>
        <td className="p-2 text-right">{sumVolButane.toFixed(3)}</td>
        <td className="p-2 text-right">{resultantVolButane.toFixed(3)}</td>
      </tr>

      {/* ROW 2 — CONDENSATE */}
      <tr>
        <td className="p-2">{shrinkPctCond.toFixed(5)}%</td>
        <td className="p-2 text-right">{shrinkVolCond.toFixed(3)}</td>
        <td className="p-2 text-right">{sumVolCond.toFixed(3)}</td>
        <td className="p-2 text-right">{resultantVolCond.toFixed(3)}</td>
      </tr>

      {/* ROW 3 — OIL */}
      <tr>
        <td className="p-2">{shrinkPctOil.toFixed(5)}%</td>
        <td className="p-2 text-right">{shrinkVolOil.toFixed(3)}</td>
        <td className="p-2 text-right">{sumVolOil.toFixed(3)}</td>
        <td className="p-2 text-right">{resultantVolOil.toFixed(3)}</td>
      </tr>

      {/* ROW 4 — FINAL SHRINKAGE PERCENT */}
      <tr>
        <td className="p-2">{totalShrinkagePct.toFixed(5)}%</td>
        <td className="p-2 text-right">{totalShrinkageM3.toFixed(3)}</td>
        <td className="p-2 text-right"></td>
        <td className="p-2 text-right">{resultantVolOil.toFixed(3)}</td>
      </tr>

      {/* SUMMARY ROWS */}
      <tr className="bg-gray-50">
        <td></td><td></td>
        <td className="p-2 font-semibold">Total Receipts:</td>
        <td className="p-2 font-semibold">{totalReceipts.toFixed(3)}</td>
      </tr>

      <tr>
        <td></td><td></td>
        <td className="p-2 font-semibold">Total Shrinkage:</td>
        <td className="p-2 font-semibold">{totalShrinkageM3.toFixed(3)}</td>
      </tr>

      <tr>
        <td></td><td></td>
        <td className="p-2 font-semibold">Net Volume:</td>
        <td className="p-2 font-semibold">{netVolume.toFixed(3)}</td>
      </tr>

      <tr>
        <td></td><td></td>
        <td className="p-2 font-semibold">Total Shrinkage as % of Total Receipts:</td>
        <td className="p-2 font-semibold">{totalShrinkageAsPctOfReceipts.toFixed(5)}%</td>
      </tr>

    </tbody>
  </table>
</div>

<div className="flex justify-between">
  <a href="/models" className="text-blue-600 underline">
    ← Back to Models
  </a>

  <a
    href={`/heavy-oil/model-e?scenarioId=${scenarioId}`}
    className="text-blue-600 underline"
  >
    Continue to Part E (Butane & Condensate Net Sales)
  </a>
</div>

      </div>   {/* closes the big white card */}
    </main>
  );
}





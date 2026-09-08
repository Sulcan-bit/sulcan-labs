// app/heavy-oil/model-b/page.tsx

import { prisma } from "@/lib/prisma";
const fmt = (n: number | null | undefined, decimals = 2) => {
  if (typeof n !== "number") return "-";
  return n.toLocaleString("en-CA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};


type PageProps = {
  searchParams: Promise<{ scenarioId?: string }>;
};

export default async function ApiShrinkagePage(props: PageProps) {
  const searchParams = await props.searchParams;
  const scenarioId = searchParams?.scenarioId;



  if (!scenarioId) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Heavy Oil Diluent Optimization – Part B: API 12.3 Shrinkage
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
    include: {
      month: true,
    },
  });

  if (!scenario) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Heavy Oil Diluent Optimization – Part B: API 12.3 Shrinkage
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
            Heavy Oil Diluent Optimization – Part B: API 12.3 Shrinkage
          </h1>
          <p className="text-red-600">
            HeavyOilInputs not found for this scenario/month.
          </p>
          <a href="/models" className="mt-4 inline-block text-blue-600 underline">
            ← Back to Models
          </a>
        </div>
      </main>
    );
  }

  // Raw crude inputs
  const producerVolumeM3 = inputs.producer_volume_m3 ?? 0; // RAW CRUDE OIL volume
  const producerDensityKgM3 = inputs.producer_density_kg_m3 ?? 0; // RAW CRUDE density

  // Condensate density (Condensate 1)
  const condensateDensityKgM3 = inputs.cond1_density_kg_m3 ?? 0;

  // Target blend density (new field you added to HeavyOilInputs)
  const targetBlendDensityKgM3 = inputs.target_blend_density ?? 0;

  // Butane density constant (kg/m3)
  const butaneDensityKgM3 = 575;

  // Condensate-only (Paper Blend) estimated condensate volume
  // cond1_est_volume_m3 = (producer_density - target_blend_density) / (target_blend_density - cond1_density) * producer_volume
  const condensateEstVolumeM3 =
    targetBlendDensityKgM3 > 0 && condensateDensityKgM3 > 0
      ? ((producerDensityKgM3 - targetBlendDensityKgM3) /
          (targetBlendDensityKgM3 - condensateDensityKgM3)) *
        producerVolumeM3
      : 0;

// ⭐ Save calculated condensate volume to HeavyOilInputs
await prisma.heavyOilInputs.update({
  where: { id: inputs.id },
  data: { cond1_est_volume_m3: condensateEstVolumeM3 },
});


  // Total estimated blended volume (Raw Crude + Condensate)
  const totalEstimatedBlendedVolumeM3 =
    producerVolumeM3 + condensateEstVolumeM3;

  // Blend percentages (Paper Blend – no butane)
  const rawCrudePctOfBlend =
    totalEstimatedBlendedVolumeM3 > 0
      ? (producerVolumeM3 / totalEstimatedBlendedVolumeM3) * 100
      : 0;

  const condensatePctOfBlend =
    totalEstimatedBlendedVolumeM3 > 0
      ? (condensateEstVolumeM3 / totalEstimatedBlendedVolumeM3) * 100
      : 0;

  const totalPctOfBlend =
    rawCrudePctOfBlend + condensatePctOfBlend; // should be ~100%

  // Weighted average density (kg/m3) of crude + condensate blend
  const weightedAvgDensityKgM3 =
    totalEstimatedBlendedVolumeM3 > 0
      ? (producerVolumeM3 * producerDensityKgM3 +
          condensateEstVolumeM3 * condensateDensityKgM3) /
        totalEstimatedBlendedVolumeM3
      : 0;

  // API 12.3 shrinkage inputs
  // dL = density of light (condensate)
  // dH = density of heavy (raw crude)
  const dL = condensateDensityKgM3;
  const dH = producerDensityKgM3;

  // X = % concentration of Diluent (condensate) = condensate percentage of total blend
  const X =
    totalEstimatedBlendedVolumeM3 > 0
      ? (condensateEstVolumeM3 / totalEstimatedBlendedVolumeM3) * 100
      : 0;

  // XX = % concentration of Crude = crude percentage of total blend
  const XX =
    totalEstimatedBlendedVolumeM3 > 0
      ? (producerVolumeM3 / totalEstimatedBlendedVolumeM3) * 100
      : 0;

  // 1/dL and 1/dH
  const inv_dL = dL > 0 ? 1 / dL : 0;
  const inv_dH = dH > 0 ? 1 / dH : 0;

  // =========================
  // SHRINKAGE FORMULAS
  // =========================

  function shrinkagePercent(F: number, I: number, J: number): number {
    return 26900 * F * Math.pow(100 - F, 0.819) * Math.pow(I - J, 2.28);
  }

  // Shrinkage Percent (%)
  const shrinkPctButane = shrinkagePercent(
    0,
    1 / butaneDensityKgM3,
    1 / producerDensityKgM3
  );

  const shrinkPctCond = shrinkagePercent(X, inv_dL, inv_dH);

  const shrinkPctOil = shrinkagePercent(100, inv_dH, inv_dH); // (I - J) = 0 → 0

// =========================
// SUM OF VOLUMES (m³)
// =========================
const sumVolButane = producerVolumeM3; 
const sumVolCond = producerVolumeM3 + condensateEstVolumeM3; 

// Resultant Volume (m³)
const resVolButane = sumVolButane - (shrinkPctButane / 100) * sumVolButane;
const resVolCond =
  sumVolCond - (shrinkPctCond / 100) * sumVolCond;
const resVolOil =
  resVolCond - (shrinkPctOil / 100) * resVolCond;

// Use resVolOil as the “Oil” volume in the iteration table
const oilDiluentVolumeM3 = resVolOil;

// ⭐ Correct OIL sum-of-volumes 
const sumVolOil = oilDiluentVolumeM3;

// Shrinkage Volumes (m³)
const shrinkVolButane = (shrinkPctButane / 100) * sumVolButane;
const shrinkVolCond = (shrinkPctCond / 100) * sumVolCond;
const shrinkVolOil = (shrinkPctOil / 100) * sumVolOil;

// Totals
const totalShrinkageM3 = shrinkVolButane + shrinkVolCond + shrinkVolOil;
const totalReceiptsM3 = totalEstimatedBlendedVolumeM3;
const netVolumeM3 = totalReceiptsM3 - totalShrinkageM3;
const totalShrinkagePct = (totalShrinkageM3 / totalReceiptsM3) * 100;

const finalShrinkPct =
  totalShrinkageM3 === 0
    ? 0
    : (totalShrinkageM3 / totalReceiptsM3) * 100;

    await prisma.scenarioResults.upsert({
  where: { scenarioId: scenario.id },
  update: {
    partB_condensate_est_volume_m3: condensateEstVolumeM3,
    partB_total_receipts_m3: totalEstimatedBlendedVolumeM3,
    partB_weighted_avg_density_kg_m3: weightedAvgDensityKgM3,
    partB_shrink_pct_cond: shrinkPctCond,
    partB_shrink_pct_oil: shrinkPctOil,
    partB_shrink_pct_butane: shrinkPctButane,
    partB_shrink_vol_cond_m3: shrinkVolCond,
    partB_shrink_vol_oil_m3: shrinkVolOil,
    partB_shrink_vol_butane_m3: shrinkVolButane,
    partB_total_shrinkage_m3: totalShrinkageM3,
    partB_net_volume_m3: netVolumeM3,
    partB_total_shrinkage_pct: totalShrinkagePct,
    partB_final_shrink_pct: finalShrinkPct,
  },
  create: {
    scenarioId: scenario.id,
    partB_condensate_est_volume_m3: condensateEstVolumeM3,
    partB_total_receipts_m3: totalEstimatedBlendedVolumeM3,
    partB_weighted_avg_density_kg_m3: weightedAvgDensityKgM3,
    partB_shrink_pct_cond: shrinkPctCond,
    partB_shrink_pct_oil: shrinkPctOil,
    partB_shrink_pct_butane: shrinkPctButane,
    partB_shrink_vol_cond_m3: shrinkVolCond,
    partB_shrink_vol_oil_m3: shrinkVolOil,
    partB_shrink_vol_butane_m3: shrinkVolButane,
    partB_total_shrinkage_m3: totalShrinkageM3,
    partB_net_volume_m3: netVolumeM3,
    partB_total_shrinkage_pct: totalShrinkagePct,
    partB_final_shrink_pct: finalShrinkPct,
  }
});


  return (
  <main className="min-h-screen bg-gray-50 p-8">
    <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Heavy Oil Diluent Optimization – Part B: API 12.3 Shrinkage (Condensate Only)
      </h1>

      <div className="mb-4 text-sm text-gray-600">
        <div>
          <span className="font-semibold">Scenario:</span> {scenarioId}
        </div>
        <div>
          <span className="font-semibold">Month:</span>{" "}
          {scenario.month?.year} {scenario.month?.month}
        </div>
      </div>

      {/* TEMP CORR. VOLUMES & DENSITY INPUTS */}
      <h2 className="text-lg font-semibold mb-2">
        Temp Corrected Volumes & Density Inputs (Paper Blend – Condensate Only)
      </h2>

      <table className="w-full text-sm border border-gray-200 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Component</th>
            <th className="p-2 text-left">Volume (m³)</th>
            <th className="p-2 text-left">Density @ 15°C (kg/m³)</th>
            <th className="p-2 text-left">% of Blend</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">Raw Crude Oil</td>
            <td className="p-2">{fmt(producerVolumeM3, 1)}</td>
            <td className="p-2">{fmt(producerDensityKgM3, 1)}</td>
            <td className="p-2">{fmt(rawCrudePctOfBlend, 3)}%</td>
          </tr>

          <tr>
            <td className="p-2">Butane</td>
            <td className="p-2">-</td>
            <td className="p-2">{fmt(butaneDensityKgM3, 1)}</td>
            <td className="p-2">0.000%</td>
          </tr>

          <tr>
            <td className="p-2">Condensate</td>
            <td className="p-2">{fmt(condensateEstVolumeM3, 1)}</td>
            <td className="p-2">{fmt(condensateDensityKgM3, 1)}</td>
            <td className="p-2">{fmt(condensatePctOfBlend, 3)}%</td>
          </tr>

          <tr className="bg-gray-50">
            <td className="p-2 font-semibold">Total Receipts</td>
            <td className="p-2 font-semibold">{fmt(totalEstimatedBlendedVolumeM3, 1)}</td>
            <td className="p-2"></td>
            <td className="p-2 font-semibold">{fmt(totalPctOfBlend, 3)}%</td>
          </tr>

          <tr>
            <td className="p-2">Wt. Avg. Density</td>
            <td className="p-2"></td>
            <td className="p-2">{fmt(weightedAvgDensityKgM3, 1)}</td>
            <td className="p-2"></td>
          </tr>

          <tr>
            <td className="p-2">Target Density</td>
            <td className="p-2"></td>
            <td className="p-2">{fmt(targetBlendDensityKgM3, 1)}</td>
          </tr>
        </tbody>
      </table>

      {/* API 12.3 Shrinkage Inputs */}
      <h2 className="text-lg font-semibold mb-2">
        API 12.3 Shrinkage Inputs (Condensate Only)
      </h2>

      <table className="w-full text-sm border border-gray-200 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Item</th>
            <th className="p-2 text-left">Value</th>
            <th className="p-2 text-left">Units / Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">dL (Density of Light – Condensate)</td>
            <td className="p-2">{fmt(dL, 2)}</td>
            <td className="p-2">kg/m³</td>
          </tr>
          <tr>
            <td className="p-2">dH (Density of Heavy – Raw Crude)</td>
            <td className="p-2">{fmt(dH, 2)}</td>
            <td className="p-2">kg/m³</td>
          </tr>
          <tr>
            <td className="p-2">X (Diluent % of Blend)</td>
            <td className="p-2">{fmt(X, 2)}%</td>
            <td className="p-2">% concentration of Diluent</td>
          </tr>
          <tr>
            <td className="p-2">XX (Crude % of Blend)</td>
            <td className="p-2">{fmt(XX, 2)}%</td>
            <td className="p-2">% concentration of Crude</td>
          </tr>
          <tr>
            <td className="p-2">1/dL</td>
            <td className="p-2">{fmt(inv_dL, 5)}</td>
            <td className="p-2">1 / dL</td>
          </tr>
          <tr>
            <td className="p-2">1/dH</td>
            <td className="p-2">{fmt(inv_dH, 5)}</td>
            <td className="p-2">1 / dH</td>
          </tr>
        </tbody>
      </table>

      {/* Iteration Table */}
      <h2 className="text-lg font-semibold mb-2">
        API 12.3 Sec. 5.3 – Iteration Table (Condensate Only)
      </h2>

      <table className="w-full text-sm border border-gray-200 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Component</th>
            <th className="p-2 text-left">Diluent Vol (m³)</th>
            <th className="p-2 text-left">Diluent Density</th>
            <th className="p-2 text-left">Crude Vol (m³)</th>
            <th className="p-2 text-left">Crude Density</th>
            <th className="p-2 text-left">X (%)</th>
            <th className="p-2 text-left">XX (%)</th>
            <th className="p-2 text-left">Blend (%)</th>
            <th className="p-2 text-left">1/dL</th>
            <th className="p-2 text-left">1/dH</th>
          </tr>
        </thead>
        <tbody>

          {/* BUTANE */}
          <tr>
            <td className="p-2">Butane</td>
            <td className="p-2">0.0</td>
            <td className="p-2">{fmt(butaneDensityKgM3, 2)}</td>
            <td className="p-2">{fmt(producerVolumeM3, 1)}</td>
            <td className="p-2">{fmt(producerDensityKgM3, 1)}</td>
            <td className="p-2">0.00</td>
            <td className="p-2">100.00</td>
            <td className="p-2">100.00</td>
            <td className="p-2">{fmt(1 / butaneDensityKgM3, 5)}</td>
            <td className="p-2">{fmt(inv_dH, 5)}</td>
          </tr>

          {/* CONDENSATE */}
          <tr>
            <td className="p-2">Condensate</td>
            <td className="p-2">{fmt(condensateEstVolumeM3, 1)}</td>
            <td className="p-2">{fmt(condensateDensityKgM3, 1)}</td>
            <td className="p-2">{fmt(producerVolumeM3, 1)}</td>
            <td className="p-2">{fmt(producerDensityKgM3, 1)}</td>
            <td className="p-2">{fmt(X, 2)}</td>
            <td className="p-2">{fmt(XX, 2)}</td>
            <td className="p-2">100.00</td>
            <td className="p-2">{fmt(inv_dL, 5)}</td>
            <td className="p-2">{fmt(inv_dH, 5)}</td>
          </tr>

          {/* OIL */}
          <tr>
            <td className="p-2">OIL</td>
            <td className="p-2">{fmt(oilDiluentVolumeM3, 1)}</td>
            <td className="p-2">{fmt(producerDensityKgM3, 1)}</td>
            <td className="p-2">-</td>
            <td className="p-2">-</td>
            <td className="p-2">100.00</td>
            <td className="p-2">-</td>
            <td className="p-2">100.00</td>
            <td className="p-2">{fmt(inv_dH, 5)}</td>
            <td className="p-2">-</td>
          </tr>

        </tbody>
      </table>

      {/* RESULTS */}
      <div className="bg-white p-6 rounded shadow mt-10">
        <h2 className="text-xl font-bold mb-4">RESULTS</h2>

        <table className="w-full text-sm border border-gray-200 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Shrinkage Percent</th>
              <th className="p-2 text-left">Shrinkage (m³)</th>
              <th className="p-2 text-left">Sum of Volumes (m³)</th>
              <th className="p-2 text-left">Resultant Volume (m³)</th>
            </tr>
          </thead>
          <tbody>

            {/* BUTANE */}
            <tr>
              <td className="p-2">{fmt(shrinkPctButane, 5)}%</td>
              <td className="p-2">{fmt(shrinkVolButane, 3)}</td>
              <td className="p-2">{fmt(sumVolButane, 3)}</td>
              <td className="p-2">{fmt(resVolButane, 3)}</td>
            </tr>

            {/* CONDENSATE */}
            <tr>
              <td className="p-2">{fmt(shrinkPctCond, 5)}%</td>
              <td className="p-2">{fmt(shrinkVolCond, 3)}</td>
              <td className="p-2">{fmt(sumVolCond, 3)}</td>
              <td className="p-2">{fmt(resVolCond, 3)}</td>
            </tr>

            {/* OIL */}
            <tr>
              <td className="p-2">{fmt(shrinkPctOil, 5)}%</td>
              <td className="p-2">{fmt(shrinkVolOil, 3)}</td>
              <td className="p-2">{fmt(sumVolOil, 3)}</td>
              <td className="p-2">{fmt(resVolOil, 3)}</td>
            </tr>

            {/* FINAL SHRINKAGE */}
            <tr>
              <td className="p-2">{fmt(finalShrinkPct, 5)}%</td>
              <td className="p-2">{fmt(totalShrinkageM3, 3)}</td>
              <td className="p-2"></td>
              <td className="p-2">{fmt(resVolOil, 3)}</td>
            </tr>

            {/* SUMMARY */}
            <tr className="bg-gray-50">
              <td></td><td></td>
              <td className="p-2 font-semibold">Total Receipts:</td>
              <td className="p-2 font-semibold">{fmt(totalReceiptsM3, 3)}</td>
            </tr>

            <tr>
              <td></td><td></td>
              <td className="p-2 font-semibold">Total Shrinkage:</td>
              <td className="p-2 font-semibold">{fmt(totalShrinkageM3, 3)}</td>
            </tr>

            <tr>
              <td></td><td></td>
              <td className="p-2 font-semibold">Net Volume:</td>
              <td className="p-2 font-semibold">{fmt(netVolumeM3, 3)}</td>
            </tr>

            <tr>
              <td></td><td></td>
              <td className="p-2 font-semibold">Total Shrinkage as % of Total Receipts:</td>
              <td className="p-2 font-semibold">{fmt(totalShrinkagePct, 5)}%</td>
            </tr>

          </tbody>
        </table>
      </div>

      <div className="flex justify-between">
        <a href="/models" className="text-blue-600 underline">
          ← Back to Models
        </a>
        <a
          href={`/heavy-oil/model-c?scenarioId=${scenarioId}`}
          className="text-blue-600 underline"
        >
          Continue to Part C (Paper Blend – Condensate Only)
        </a>
      </div>
    </div>
  </main>
);
}
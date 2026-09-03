// app/heavy-oil/model-f/page.tsx

import { prisma } from "@/lib/prisma";
import { heavy_oil_conversion_factor } from "@/app/heavy-oil/constants";

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

export default async function HeavyOilModelFPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const scenarioId = Number(searchParams?.scenarioId);

  if (!scenarioId) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Heavy Oil Diluent Optimization – Part F: Net Financial Benefit
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
    where: { id: scenarioId },
    include: {
      month: true,
      results: true,
      inputs: true,
    },
  });

  if (!scenario || !scenario.results || !scenario.inputs) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Heavy Oil Diluent Optimization – Part F: Net Financial Benefit
          </h1>
          <p className="text-red-600">
            Missing results from Part C or Part E. Please complete Parts C–E first.
          </p>
          <a href="/models" className="mt-4 inline-block text-blue-600 underline">
            ← Back to Models
          </a>
        </div>
      </main>
    );
  }

  const r = scenario.results;
  const inputs = scenario.inputs;
  const monthly = scenario.month;

  // RAW VALUES
  const partC_net = r.partC_net_sales ?? 0;
  const partE_net = r.partE_net_sales ?? 0;

  const rawCrudeVol = inputs.producer_volume_m3 ?? 0;
  const netBlendVol = r.partD_net_blend_volume_m3 ?? 0;

  const fx = monthly.fx_cad_usd ?? 0;

  // ============================
  // EXCEL E131 — NET FINANCIAL BENEFIT
  // ============================

  const netFinancialBenefit = partE_net - partC_net;

  // ============================
  // EXCEL E133 — Net Benefit per m³ Raw Crude
  // ============================

  const netBenefit_per_m3_raw = netFinancialBenefit / rawCrudeVol;

  // ============================
  // EXCEL E134 — Net Benefit per bbl (CAD)
  // ============================

  const netBenefit_per_bbl_CAD = netBenefit_per_m3_raw / heavy_oil_conversion_factor;

  // ============================
  // EXCEL E135 — Net Benefit per bbl (USD)
  // ============================

  const netBenefit_per_bbl_USD = netBenefit_per_bbl_CAD / fx;

  // ============================
  // EXCEL E137 — Net Benefit per m³ Blended Crude
  // ============================

  const netBenefit_per_m3_blend = netFinancialBenefit / netBlendVol;

  // ============================
  // SAVE PART F RESULTS
  // ============================

  await prisma.scenarioResults.update({
    where: { scenarioId },
    data: {
      partF_financial_benefit_cad: netFinancialBenefit,
      partF_blend_revenue_change: netFinancialBenefit, // Excel G131
      partF_diluent_cost_savings: 0, // Excel does not compute this separately
      partF_transport_savings: 0,
      partF_loss_allowance_savings: 0,
      partF_netBenefit_per_m3_raw: netBenefit_per_m3_raw,
      partF_netBenefit_per_m3_blend: netBenefit_per_m3_blend,
    },
  });

  // ============================
  // RENDER PAGE — EXACT EXCEL LAYOUT
  // ============================

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          Heavy Oil Diluent Optimization – Part F: Net Financial Benefit – Producer
        </h1>

        <table className="w-full text-sm border border-gray-200 mb-6">
          <tbody>

            {/* E131 */}
            <tr className="bg-gray-50">
              <td className="p-2 font-semibold">NET FINANCIAL BENEFIT</td>
              <td className="p-2 font-semibold">{netFinancialBenefit.toFixed(2)} CAD</td>
            </tr>

            {/* E132 */}
            <tr>
              <td className="p-2">m³ Raw Crude Production</td>
              <td className="p-2">{fmt(rawCrudeVol, 1)} m³</td>
            </tr>

            {/* E133 */}
            <tr>
              <td className="p-2">Net Benefit per m³ Raw Crude</td>
              <td className="p-2">{netBenefit_per_m3_raw.toFixed(2)} CAD/m³</td>
            </tr>

            {/* E134 */}
            <tr>
              <td className="p-2">Net Benefit per bbl (CAD)</td>
              <td className="p-2">{netBenefit_per_bbl_CAD.toFixed(2)} CAD/bbl</td>
            </tr>

            {/* E135 */}
            <tr>
              <td className="p-2">Net Benefit per bbl (USD)</td>
              <td className="p-2">{netBenefit_per_bbl_USD.toFixed(2)} USD/bbl</td>
            </tr>

            {/* E136 */}
            <tr>
              <td className="p-2">m³ Blended Sales Crude Production</td>
              <td className="p-2">{netBlendVol.toFixed(1)} m³</td>
            </tr>

            {/* E137 */}
            <tr>
              <td className="p-2">Net Benefit per m³ Blended Crude</td>
              <td className="p-2">{netBenefit_per_m3_blend.toFixed(2)} CAD/m³</td>
            </tr>

          </tbody>
        </table>

        <div className="flex justify-between">
          <a href="/models" className="text-blue-600 underline">
            ← Back to Models
          </a>
          <a
            href={`/heavy-oil/model-e?scenarioId=${scenarioId}`}
            className="text-blue-600 underline"
          >
            ← Back to Part E
          </a>
        </div>

      </div>
    </main>
  );
}




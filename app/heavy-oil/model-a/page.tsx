// app/heavy-oil/model-a/page.tsx

import { prisma } from "@/lib/prisma";
import {
  condensate_sulphur_slope,
  crude_density_slope,
  crude_sulphur_slope,
  light_oil_conversion_factor,
  heavy_oil_conversion_factor,
} from "@/app/heavy-oil/constants";

function getCondensateIndexUsdBbl(monthly: any, choice?: string | null) {
  switch (choice) {
    case "CRW":
      return monthly.crw_c5_diff_usd_bbl ?? 0;
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

export default async function HeavyOilModelPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const scenarioId = searchParams?.scenarioId;

  if (!scenarioId) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Heavy Oil Diluent Optimization – Monthly Pricing
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
            Heavy Oil Diluent Optimization – Monthly Pricing
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

const cleanedInputs = inputs; // TT1‑only architecture — no cleaning required

  const monthly = scenario.month;

  const wti = monthly.wti_cma_usd_bbl ?? 0;
  const fx = Number((monthly.fx_cad_usd ?? 0).toFixed(5));

  const heavyStreamIndexUsdBbl = getHeavyStreamIndexUsdBbl(
  monthly,
  cleanedInputs?.heavy_oil_stream ?? "WCS"
);


  const condensateIndexUsdBbl = getCondensateIndexUsdBbl(
  monthly,
  cleanedInputs?.condensate_index_choice ?? undefined
);


  const c4PricePctWti = monthly.c4_to_wti_usd_bbl ?? 0;

  const c4Diff = 1 - c4PricePctWti;
  const c4PurchasePriceUsdBbl = wti * c4PricePctWti;
  const c4DiffToWtiUsdBbl = c4PurchasePriceUsdBbl - wti;

  const premiumHeavyPriceUsdBbl = monthly.premium_heavy_price_usd_bbl ?? 0;

  const heavyStreamPriceCadM3 =
    (wti + heavyStreamIndexUsdBbl + premiumHeavyPriceUsdBbl) *
    heavy_oil_conversion_factor *
    fx;

  const condensateWadfCadM3 = monthly.crw_c5_enb_wadf_cad_m3 ?? 0;

  const condensateParPriceCadM3 =
    (wti + condensateIndexUsdBbl + premiumHeavyPriceUsdBbl) *
      light_oil_conversion_factor *
      fx +
    condensateWadfCadM3;

  const condensateStreamPriceCadM3 =
    condensateParPriceCadM3 - condensateWadfCadM3;

  const c4PriceCadM3 = Number(
  (wti * c4PricePctWti * light_oil_conversion_factor * fx).toFixed(2)
);

  const condensateAllowancePriceCadM3 =
    monthly.c5_allow_price_cad_m3 ?? 0;

  const condensateDensity = cleanedInputs?.cond1_density_kg_m3 ?? 0;
  
  // ⭐ FIXED: condensate density slope now comes ONLY from MonthlyData
  const condensateDensitySlope =
    monthly.c5_density_slope_cad_m3_per_kg_m3 ?? 0;

  const condensateSulphur = (cleanedInputs?.cond1_sulphur_pct ?? 0) / 100;

const condensateEqCredit =
  (750 - condensateDensity) * condensateDensitySlope +
  (0.2 - condensateSulphur) * (condensate_sulphur_slope * 10);


  const butaneInjectionRatePct = cleanedInputs?.butane_injection_rate_pct ?? 0;

  const condensateButanePenalty =
    butaneInjectionRatePct > 5 ? "Yes (Butane > 5%)" : "No";

  // ⭐ NEW: Condensate Price After EQ
  const condensatePriceAfterEqCadM3 =
    condensateStreamPriceCadM3 +
    condensateEqCredit;

await prisma.scenarioResults.upsert({
  where: { scenarioId: scenario.id },
  update: {
    partA_wti_usd_bbl: wti,
    partA_fx_cad_usd: fx,
    partA_heavy_stream_index_usd_bbl: heavyStreamIndexUsdBbl,
    partA_premium_heavy_usd_bbl: premiumHeavyPriceUsdBbl,
    partA_heavy_stream_price_cad_m3: heavyStreamPriceCadM3,
    partA_condensate_index_usd_bbl: condensateIndexUsdBbl,
    partA_condensate_par_price_cad_m3: condensateParPriceCadM3,
    partA_condensate_stream_price_cad_m3: condensateStreamPriceCadM3,
    partA_condensate_eq_credit_cad_m3: condensateEqCredit,
    partA_condensate_price_after_eq_cad_m3: condensatePriceAfterEqCadM3,
    partA_c4_price_pct_wti: c4PricePctWti,
    partA_c4_purchase_price_usd_bbl: c4PurchasePriceUsdBbl,
    partA_c4_diff_to_wti_usd_bbl: c4DiffToWtiUsdBbl,
    partA_c4_price_cad_m3: c4PriceCadM3,
  },
  create: {
    scenarioId: scenario.id,
    partA_wti_usd_bbl: wti,
    partA_fx_cad_usd: fx,
    partA_heavy_stream_index_usd_bbl: heavyStreamIndexUsdBbl,
    partA_premium_heavy_usd_bbl: premiumHeavyPriceUsdBbl,
    partA_heavy_stream_price_cad_m3: heavyStreamPriceCadM3,
    partA_condensate_index_usd_bbl: condensateIndexUsdBbl,
    partA_condensate_par_price_cad_m3: condensateParPriceCadM3,
    partA_condensate_stream_price_cad_m3: condensateStreamPriceCadM3,
    partA_condensate_eq_credit_cad_m3: condensateEqCredit,
    partA_condensate_price_after_eq_cad_m3: condensatePriceAfterEqCadM3,
    partA_c4_price_pct_wti: c4PricePctWti,
    partA_c4_purchase_price_usd_bbl: c4PurchasePriceUsdBbl,
    partA_c4_diff_to_wti_usd_bbl: c4DiffToWtiUsdBbl,
    partA_c4_price_cad_m3: c4PriceCadM3,
  }
});


  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Heavy Oil Diluent Optimization – Part A: Monthly Pricing
        </h1>

        <div className="mb-4 text-sm text-gray-600">
          <div>
            <span className="font-semibold">Scenario:</span> {scenario.name}
          </div>
          <div>
            <span className="font-semibold">Month:</span>{" "}
            {monthly.year} {monthly.month}
          </div>
          <div>
            <span className="font-semibold">Heavy Oil Stream:</span>{" "}
            {cleanedInputs?.heavy_oil_stream ?? "N/A"}
          </div>
          <div>
            <span className="font-semibold">Condensate Index Choice:</span>{" "}
            {cleanedInputs?.condensate_index_choice ?? "N/A"}
          </div>
        </div>

        <table className="w-full text-sm border border-gray-200 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-left">Value</th>
              <th className="p-2 text-left">Units / Notes</th>
            </tr>
          </thead>
          <tbody>

            {/* WTI */}
            <tr>
              <td className="p-2">WTI</td>
              <td className="p-2">{wti.toFixed(2)}</td>
              <td className="p-2">USD/bbl</td>
            </tr>

            {/* FX */}
            <tr>
              <td className="p-2">FX</td>
              <td className="p-2">{fx.toFixed(5)}</td>
              <td className="p-2">CAD/USD</td>
            </tr>

            {/* Heavy Stream Index */}
            <tr>
              <td className="p-2">Heavy Stream Index</td>
              <td className="p-2">{heavyStreamIndexUsdBbl.toFixed(2)}</td>
              <td className="p-2">USD/bbl</td>
            </tr>

            {/* Condensate Index */}
            <tr>
              <td className="p-2">Condensate Index</td>
              <td className="p-2">{condensateIndexUsdBbl.toFixed(2)}</td>
              <td className="p-2">USD/bbl</td>
            </tr>

            {/* C4 Price % */}
            <tr>
              <td className="p-2">C4 Price (% of WTI landed)</td>
              <td className="p-2">
                {(c4PricePctWti * 100).toFixed(2)}%
              </td>
              <td className="p-2">Fraction of WTI</td>
            </tr>

            {/* C4 Diff */}
            <tr>
              <td className="p-2">C4 Diff</td>
              <td className="p-2">{(c4Diff * 100).toFixed(2)}%</td>
              <td className="p-2">= 1 − C4 Price</td>
            </tr>

            {/* C4 Purchase Price */}
            <tr>
              <td className="p-2">C4 Purchase Price</td>
              <td className="p-2">{c4PurchasePriceUsdBbl.toFixed(2)}</td>
              <td className="p-2">USD/bbl</td>
            </tr>

            {/* C4 Diff to WTI */}
            <tr>
              <td className="p-2">C4 Diff to WTI</td>
              <td className="p-2">{c4DiffToWtiUsdBbl.toFixed(2)}</td>
              <td className="p-2">USD/bbl</td>
            </tr>

            {/* Heavy Stream Price */}
            <tr>
              <td className="p-2">Heavy Stream Price</td>
              <td className="p-2">{heavyStreamPriceCadM3.toFixed(2)}</td>
              <td className="p-2">CAD/m³</td>
            </tr>

            {/* Condensate WADF */}
            <tr>
              <td className="p-2">Condensate WADF</td>
              <td className="p-2">{condensateWadfCadM3.toFixed(2)}</td>
              <td className="p-2">CAD/m³</td>
            </tr>

            {/* Condensate PAR Price */}
            <tr>
              <td className="p-2">Condensate PAR Price</td>
              <td className="p-2">{condensateParPriceCadM3.toFixed(2)}</td>
              <td className="p-2">CAD/m³</td>
            </tr>

            {/* Condensate Stream Price */}
            <tr>
              <td className="p-2">Condensate Stream Price</td>
              <td className="p-2">{condensateStreamPriceCadM3.toFixed(2)}</td>
              <td className="p-2">CAD/m³</td>
            </tr>

            {/* C4 Price */}
            <tr>
              <td className="p-2">C4 Price</td>
              <td className="p-2">{c4PriceCadM3.toFixed(2)}</td>
              <td className="p-2">CAD/m³</td>
            </tr>

            {/* Condensate Allowance Price */}
            <tr>
              <td className="p-2">Condensate Allowance Price</td>
              <td className="p-2">{condensateAllowancePriceCadM3.toFixed(2)}</td>
              <td className="p-2">CAD/m³</td>
            </tr>

            {/* Condensate Density */}
            <tr>
              <td className="p-2">Condensate Density</td>
              <td className="p-2">{condensateDensity.toFixed(1)}</td>
              <td className="p-2">kg/m³</td>
            </tr>

            {/* Condensate Sulphur */}
            <tr>
              <td className="p-2">Condensate Sulphur</td>
              <td className="p-2">{Number(inputs?.cond1_sulphur_pct).toFixed(3)}%</td>
              <td className="p-2">wt%</td>
            </tr>

            {/* Condensate Density Slope */}
            <tr>
              <td className="p-2">Condensate Density Slope</td>
              <td className="p-2">{condensateDensitySlope.toFixed(2)}</td>
              <td className="p-2">CAD/m³ per kg/m³</td>
            </tr>

            {/* Condensate Sulphur Slope */}
            <tr>
              <td className="p-2">Condensate Sulphur Slope</td>
              <td className="p-2">{condensate_sulphur_slope.toFixed(2)}</td>
              <td className="p-2">CAD/m³ per 0.1 wt%</td>
            </tr>

            {/* Crude Density Slope */}
            <tr>
              <td className="p-2">Crude Density Slope</td>
              <td className="p-2">{crude_density_slope.toFixed(2)}</td>
              <td className="p-2">CAD/m³ per kg/m³</td>
            </tr>

            {/* Crude Sulphur Slope */}
            <tr>
              <td className="p-2">Crude Sulphur Slope</td>
              <td className="p-2">{crude_sulphur_slope.toFixed(2)}</td>
              <td className="p-2">CAD/m³ per 0.1 wt%</td>
            </tr>

            {/* Condensate EQ Credit */}
            <tr>
              <td className="p-2">Condensate EQ Credit</td>
              <td className="p-2">{condensateEqCredit.toFixed(2)}</td>
              <td className="p-2">CAD/m³</td>
            </tr>

            {/* Condensate Butane Penalty */}
            <tr>
              <td className="p-2">Condensate Butane Penalty</td>
              <td className="p-2">{condensateButanePenalty}</td>
              <td className="p-2">If butane injection rate &gt; 5%</td>
            </tr>

            {/* ⭐ NEW ROW — placed directly below Condensate Butane Penalty */}
            <tr className="bg-gray-50">
              <td className="p-2 font-semibold">Condensate Price After EQ</td>
              <td className="p-2 font-semibold">
                {condensatePriceAfterEqCadM3.toFixed(2)}
              </td>
              <td className="p-2 font-semibold">CAD/m³</td>
            </tr>

          </tbody>
        </table>

        <div className="flex justify-between">
          <a href="/models" className="text-blue-600 underline">
            ← Back to Models
          </a>
          <a
            href={`/heavy-oil/model-b?scenarioId=${scenarioId}`}
            className="text-blue-600 underline"
          >
            Continue to Part B (Shrinkage Calculation – API 12.3)
          </a>
        </div>
      </div>
    </main>
  );
}



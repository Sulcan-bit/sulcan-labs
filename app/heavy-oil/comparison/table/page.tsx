// app/heavy-oil/comparison/table/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { edi_fee_cad_m3, colc_fee_cad_m3 } from "@/app/heavy-oil/constants";

export default function ComparisonTablePage() {
  const params = useSearchParams();
  const idsParam = params.get("ids");
  const scenarioIds = idsParam ? idsParam.split(",").map(Number) : [];

  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/heavy-oil/scenarios");
      const data = await res.json();

      const filtered = (data.scenarios || []).filter((s: any) =>
        scenarioIds.includes(s.id)
      );

      setScenarios(filtered);
      setLoading(false);
    }

    load();
  }, [idsParam]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow max-w-md w-full text-center">
          <p className="text-lg font-semibold">Loading comparison…</p>
        </div>
      </main>
    );
  }

  if (scenarios.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow max-w-md w-full text-center">
          <p className="text-lg font-semibold">No scenarios selected.</p>
        </div>
      </main>
    );
  }

  const fmt = (n: number | null | undefined, decimals = 2) =>
    typeof n === "number" ? n.toFixed(decimals) : "-";

  const diffFieldMap: Record<string, string> = {
    CHV: "chv_diff_usd_bbl",
    LLB: "llb_diff_usd_bbl",
    WCB: "wcb_diff_usd_bbl",
    CWH: "cwh_diff_usd_bbl",
    BRN: "brn_diff_usd_bbl",
    BRS: "brs_diff_usd_bbl",
  };

  const priceFieldMap: Record<string, string> = {
    CHV: "chv_price_cad_m3",
    LLB: "llb_price_cad_m3",
    WCB: "wcb_price_cad_m3",
    CWH: "cwh_price_cad_m3",
    BRN: "brn_price_cad_m3",
    BRS: "brs_price_cad_m3",
  };

 const fmtMoney = (n: number | null | undefined, decimals = 2) => {
  if (typeof n !== "number") return "-";
  const val = n.toFixed(decimals);
  return n < 0 ? `(${Math.abs(n).toFixed(decimals)})` : val;
};

const fmtComma = (n: number | null | undefined, decimals = 2) => {
  if (typeof n !== "number") return "-";
  return n.toLocaleString("en-CA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};


return (
  <main className="min-h-screen bg-gray-50 p-6">
    <div className="bg-white p-8 rounded shadow max-w-6xl mx-auto">

      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold mb-6">
        Blended Heavy Oil Netback Comparison
      </h1>

     {/* MODEL NAVIGATION */}
<div className="mb-8">

  {/* Home Link */}
  <div className="mb-4">
    <Link
      href="/heavy-oil"
      className="text-blue-600 underline font-medium"
    >
      ← Heavy Oil Diluent Optimization Home
    </Link>
  </div>

  {/* Scenario Navigation */}
  <div className="bg-gray-100 p-4 rounded-lg border">
    <h2 className="text-lg font-semibold mb-3">Model Sections</h2>

    <div className="space-y-4">

      {scenarios.map((s) => (
        <div key={s.id} className="bg-white p-4 rounded border shadow-sm">

          <p className="font-semibold text-gray-900 mb-2">
            {s.scenario_name}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">

            <Link
              href={`/heavy-oil/model-a?scenarioId=${s.id}`}
              className="text-blue-600 underline"
            >
              Part A – Monthly Pricing
            </Link>

            <Link
              href={`/heavy-oil/api-shrinkage?scenarioId=${s.id}`}
              className="text-blue-600 underline"
            >
              Part B – API Shrinkage
            </Link>

            <Link
              href={`/heavy-oil/model-c?scenarioId=${s.id}`}
              className="text-blue-600 underline"
            >
              Part C – Condensate Net Sales
            </Link>

            <Link
              href={`/heavy-oil/model-d?scenarioId=${s.id}`}
              className="text-blue-600 underline"
            >
              Part D – Physical Blend
            </Link>

            <Link
              href={`/heavy-oil/model-e?scenarioId=${s.id}`}
              className="text-blue-600 underline"
            >
              Part E – Net Sales
            </Link>

            <Link
              href={`/heavy-oil/model-f?scenarioId=${s.id}`}
              className="text-blue-600 underline"
            >
              Part F – Financial Benefit
            </Link>

          </div>
        </div>
      ))}

    </div>
  </div>
</div>



      {/* PRINT BUTTON */}
      <div className="mb-6">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Print to PDF
        </button>
      </div>


        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Metric (Blended Crude)</th>
                {scenarios.map((s) => (
                  <th key={s.id} className="border p-2 text-left">
                    {s.scenario_name}
                    <div className="text-xs text-gray-600">
                      {s.terminal_operator} — {s.terminal_location}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
             {/* Raw Crude Volume */}
<tr>
  <td className="border p-2 font-medium">
    Raw Crude Volume (M3/Month)
  </td>
  {scenarios.map((s) => (
    <td key={s.id} className="border p-2">
      {fmtComma(s.inputs?.producer_volume_m3, 2)}
    </td>
  ))}
</tr>



              {/* Raw Crude Density */}
              <tr>
                <td className="border p-2 font-medium">
                  Raw Crude Density (KG/M3)
                </td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmt(s.inputs?.producer_density_kg_m3, 2)}
                  </td>
                ))}
              </tr>

              {/* Target Blend Density */}
              <tr>
                <td className="border p-2 font-medium">
                  Blended Crude Target Density (KG/M3)
                </td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmt(s.inputs?.target_blend_density, 2)}
                  </td>
                ))}
              </tr>

              {/* Raw Crude TAN */}
              <tr>
                <td className="border p-2 font-medium">Raw Crude TAN</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmt(s.inputs?.producer_TAN, 2)}
                  </td>
                ))}
              </tr>

              {/* Blended Crude TAN (placeholder) */}
              <tr>
                <td className="border p-2 font-medium">Blended Crude TAN</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">-</td>
                ))}
              </tr>

              {/* Condensate Density */}
              <tr>
                <td className="border p-2 font-medium">
                  Condensate Density (KG/M3)
                </td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmt(s.inputs?.cond1_density_kg_m3, 2)}
                  </td>
                ))}
              </tr>

              {/* Stream */}
              <tr>
                <td className="border p-2 font-medium">Stream</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {s.inputs?.heavy_oil_stream}
                  </td>
                ))}
              </tr>

              {/* Month */}
              <tr>
                <td className="border p-2 font-medium">Month</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {s.month
                      ? `${s.month.month}-${String(s.month.year).slice(2)}`
                      : "-"}
                  </td>
                ))}
              </tr>

              {/* WTI */}
<tr>
  <td className="border p-2 font-medium">WTI (USD/BBL)</td>
  {scenarios.map((s) => (
    <td key={s.id} className="border p-2">
      {fmtMoney(s.month?.wti_cma_usd_bbl, 2)}
    </td>
  ))}
</tr>

{/* WCS Diff */}
<tr>
  <td className="border p-2 font-medium">WCS Diff (USD/BBL)</td>
  {scenarios.map((s) => (
    <td key={s.id} className="border p-2">
      {fmtMoney(s.month?.wcs_diff_usd_bbl, 2)}
    </td>
  ))}
</tr>

{/* Stream Diff */}
<tr>
  <td className="border p-2 font-medium">
    {scenarios[0].inputs?.heavy_oil_stream} Diff (USD/BBL)
  </td>
  {scenarios.map((s) => {
    const stream = s.inputs?.heavy_oil_stream;
    const diffField = stream ? diffFieldMap[stream] : undefined;
    return (
      <td key={s.id} className="border p-2">
        {diffField ? fmtMoney(s.month?.[diffField], 2) : "-"}
      </td>
    );
  })}
</tr>


              {/* FX */}
              <tr>
                <td className="border p-2 font-medium">FX (CAD/USD)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmt(s.month?.fx_cad_usd, 5)}
                  </td>
                ))}
              </tr>

  {/* Reference Price */}
<tr>
  <td className="border p-2 font-medium">Reference Price (CAD/M3)</td>
  {scenarios.map((s) => (
    <td key={s.id} className="border p-2">
      {fmtMoney(s.results?.partA_heavy_stream_price_cad_m3, 2)}
    </td>
  ))}
</tr>


              {/* Terminal Fee */}
<tr>
  <td className="border p-2 font-medium">Terminal Fee (CAD/M3 Blended Vol)</td>
  {scenarios.map((s) => (
    <td key={s.id} className="border p-2">
      {fmtMoney(-Math.abs(s.inputs?.tt1_fee_cad_m3 ?? 0), 2)}
    </td>
  ))}
</tr>



{/* C5 Diluent Cost */}
<tr>
  <td className="border p-2 font-medium">C5 Diluent Cost (CAD/M3)</td>
  {scenarios.map((s) => (
    <td key={s.id} className="border p-2">
      {fmtMoney(-Math.abs(s.results?.partE_c5_diluent_cost_m3_blend ?? 0), 2)}
    </td>
  ))}
</tr>

{/* C4 Diluent Cost */}
<tr>
  <td className="border p-2 font-medium">C4 Diluent Cost (CAD/M3)</td>
  {scenarios.map((s) => (
    <td key={s.id} className="border p-2">
      {fmtMoney(-Math.abs(s.results?.partE_c4_diluent_cost_m3_blend ?? 0), 2)}
    </td>
  ))}
</tr>

{/* Pipeline Tariff (CAD/M3 Blended Vol) */}
<tr>
  <td className="border p-2 font-medium">
    Feeder Pipeline Tariff (CAD/M3 Blended Vol)
  </td>
  {scenarios.map((s) => {
    const toll = s.inputs?.pipeline_toll_tt1_cad_m3 ?? 0;
    const power = s.inputs?.pipeline_power_surcharge_cad_m3 ?? 0;
    const tariff = toll + power;
    return (
      <td key={s.id} className="border p-2">
        {fmtMoney(-Math.abs(tariff), 2)}
      </td>
    );
  })}
</tr>

{/* Feeder Pipeline Loss Allowance (CAD/M3 Blended Vol) */}
<tr>
  <td className="border p-2 font-medium">
    Feeder Pipeline L/A (CAD/M3 Blended Vol)
  </td>
  {scenarios.map((s) => {
    const pct = (s.inputs?.pipeline_loss_allowance_pct ?? 0) / 100;
    const blendVol = s.results?.partD_net_blend_volume_m3 ?? 0;
    const refPrice = s.results?.partA_heavy_stream_price_cad_m3 ?? 0;

    // Approx: loss allowance cost per m3 = pct * refPrice
    const lossAllowance = pct * refPrice;

    return (
      <td key={s.id} className="border p-2">
        {fmtMoney(-Math.abs(lossAllowance), 2)}
      </td>
    );
  })}
</tr>

{/* EDI/COLC Fees (CAD/M3 Blended Vol) */}
<tr>
  <td className="border p-2 font-medium">EDI/COLC Fees (CAD/M3 Blended Vol)</td>
  {scenarios.map((s) => {
    const totalFees = edi_fee_cad_m3 + colc_fee_cad_m3;
    return (
      <td key={s.id} className="border p-2">
        {fmtMoney(-Math.abs(totalFees), 2)}
      </td>
    );
  })}
</tr>


{/* Netback (CAD/M3 Blend) */}
<tr className="bg-gray-100">
  <td className="border p-2 font-bold">Netback (CAD/M3 Blend)</td>
  {scenarios.map((s) => {
    const netSales = s.results?.partE_net_sales ?? 0;
    const blendVol = s.results?.partD_net_blend_volume_m3 ?? 1;

    const netbackBlend = netSales / blendVol;

    return (
      <td key={s.id} className="border p-2 font-bold">
        {fmtMoney(netbackBlend, 2)}
      </td>
    );
  })}
</tr>

{/* Netback (CAD/M3 Raw Crude) */}
<tr className="bg-gray-100">
  <td className="border p-2 font-bold">Netback (CAD/M3 Raw)</td>
  {scenarios.map((s) => {
    const netSales = s.results?.partE_net_sales ?? 0;
    const rawVol = s.inputs?.producer_volume_m3 ?? 1;

    const netbackRaw = netSales / rawVol;

    return (
      <td key={s.id} className="border p-2 font-bold">
        {fmtMoney(netbackRaw, 2)}
      </td>
    );
  })}
</tr>


{/* Raw Crude Trucking (CAD/M3 Blended Vol) */}
<tr>
  <td className="border p-2 font-medium">Raw Crude Trucking (CAD/M3)</td>
  {scenarios.map((s) => {
    const inputs = s.inputs;
    const results = s.results;

    const hours =
      (inputs?.raw_crude_hours_tt1 ?? 0) +
      (inputs?.raw_crude_hours_tt2 ?? 0) +
      (inputs?.raw_crude_hours_comp ?? 0);

    const rate = inputs?.raw_crude_trucking_rate_cad_m3 ?? 0;
    const truckVol = inputs?.raw_crude_truck_volume_m3 ?? 1;

    const rawVol = inputs?.producer_volume_m3 ?? 0;
    const blendVol = results?.partD_net_blend_volume_m3 ?? 1;

    const trucking =
      ((hours * rate) / truckVol) *
      (rawVol / blendVol);

    return (
      <td key={s.id} className="border p-2">
        {fmtMoney(-Math.abs(trucking), 2)}
      </td>
    );
  })}
</tr>

{/* Producer Share Diluent Optimization Benefit */}
<tr>
  <td className="border p-2 font-medium">
    Producer Share Diluent Optimization Benefit (CAD/M3)
  </td>
  {scenarios.map((s) => {
    const netBenefitBlend = s.results?.partF_netBenefit_per_m3_blend ?? 0;
    const sharePct = (s.inputs?.tt1_diluent_sharing_pct ?? 0) / 100;

    const benefit = netBenefitBlend * sharePct;

    return (
      <td key={s.id} className="border p-2">
        {fmtMoney(benefit, 2)}
      </td>
    );
  })}
</tr>

             {/* Optimization Benefit */}
<tr>
  <td className="border p-2 font-medium">
    Producer Share Diluent Optimization Benefit (CAD/Month)
  </td>
  {scenarios.map((s) => {
    const benefit = s.results?.partF_financial_benefit_cad;
    const share = s.inputs?.tt1_diluent_sharing_pct;
    const val =
      benefit != null && share != null
        ? benefit * (share / 100)
        : null;
    return (
      <td key={s.id} className="border p-2">
        {fmtComma(val, 2)}
      </td>
    );
  })}
</tr>


{/* Netback (CAD/M3 Blend) – After Trucking & Optimization */}
<tr className="bg-gray-200">
  <td className="border p-2 font-bold">
    Netback (CAD/M3 Blend) – After Trucking & Optimization
  </td>
  {scenarios.map((s) => {
    const netSales = s.results?.partE_net_sales ?? 0;
    const blendVol = s.results?.partD_net_blend_volume_m3 ?? 1;
    const netbackBlend = netSales / blendVol;

    // Raw Crude Trucking (per m3 blend), then rounded to 2 decimals
    const hours =
      (s.inputs?.raw_crude_hours_tt1 ?? 0) +
      (s.inputs?.raw_crude_hours_tt2 ?? 0) +
      (s.inputs?.raw_crude_hours_comp ?? 0);
    const rate = s.inputs?.raw_crude_trucking_rate_cad_m3 ?? 0;
    const truckVol = s.inputs?.raw_crude_truck_volume_m3 ?? 1;
    const rawVol = s.inputs?.producer_volume_m3 ?? 0;

    const truckingExact =
      ((hours * rate) / truckVol) *
      (rawVol / blendVol);
    const trucking = Math.round(truckingExact * 100) / 100; // 16.49

    // Producer share benefit (per m3 blend), rounded to 2 decimals
    const netBenefitBlend = s.results?.partF_netBenefit_per_m3_blend ?? 0;
    const sharePct = (s.inputs?.tt1_diluent_sharing_pct ?? 0) / 100;
    const producerBenefitExact = netBenefitBlend * sharePct;
    const producerBenefit =
      Math.round(producerBenefitExact * 100) / 100; // 5.73

    const finalBlend = netbackBlend - trucking + producerBenefit;

    return (
      <td key={s.id} className="border p-2 font-bold">
        {fmtMoney(finalBlend, 2)}
      </td>
    );
  })}
</tr>

{/* Netback (CAD/M3 Raw) – After Trucking & Optimization */}
<tr className="bg-gray-200">
  <td className="border p-2 font-bold">
    Netback (CAD/M3 Raw) – After Trucking & Optimization
  </td>
  {scenarios.map((s) => {
    const netSales = s.results?.partE_net_sales ?? 0;
    const blendVol = s.results?.partD_net_blend_volume_m3 ?? 1;
    const netbackBlend = netSales / blendVol;

    // Same rounded trucking and benefit as above
    const hours =
      (s.inputs?.raw_crude_hours_tt1 ?? 0) +
      (s.inputs?.raw_crude_hours_tt2 ?? 0) +
      (s.inputs?.raw_crude_hours_comp ?? 0);
    const rate = s.inputs?.raw_crude_trucking_rate_cad_m3 ?? 0;
    const truckVol = s.inputs?.raw_crude_truck_volume_m3 ?? 1;
    const rawVol = s.inputs?.producer_volume_m3 ?? 0;

    const truckingExact =
      ((hours * rate) / truckVol) *
      (rawVol / blendVol);
    const trucking = Math.round(truckingExact * 100) / 100;

    const netBenefitBlend = s.results?.partF_netBenefit_per_m3_blend ?? 0;
    const sharePct = (s.inputs?.tt1_diluent_sharing_pct ?? 0) / 100;
    const producerBenefitExact = netBenefitBlend * sharePct;
    const producerBenefit =
      Math.round(producerBenefitExact * 100) / 100;

    const finalBlend = netbackBlend - trucking + producerBenefit;

    // Excel raw netback: Blend netback × (transport volume / raw volume),
    // with ratio rounded to 4 decimals (to mimic Excel).
    const transportVol = s.results?.partD_total_receipts_m3 ?? blendVol;
    const ratioExact =
      rawVol > 0 ? transportVol / rawVol : 1;
    const ratio = Math.round(ratioExact * 10000) / 10000;

    const finalRaw = finalBlend * ratio;

    return (
      <td key={s.id} className="border p-2 font-bold">
        {fmtMoney(finalRaw, 2)}
      </td>
    );
  })}
</tr>

            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// app/condensate/comparison/table/page.tsx

"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ComparisonTableContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") ?? "";

  const scenarioIds = useMemo(
    () =>
      idsParam
        .split(",")
        .map((n) => Number(n))
        .filter((n) => !Number.isNaN(n)),
    [idsParam]
  );

  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/condensate/scenarios");
      const data = await res.json();

      const filtered = (data.scenarios || []).filter((s: any) =>
        scenarioIds.includes(s.id)
      );

      setScenarios(filtered);
      setLoading(false);
    }

    load();
  }, [scenarioIds]);

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
          <p className="text-lg font-semibold">No condensate scenarios selected.</p>
        </div>
      </main>
    );
  }

  const fmt = (n: number | null | undefined, decimals = 2) =>
    typeof n === "number"
      ? n.toLocaleString("en-CA", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : "-";

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
          Condensate Comparison Model
        </h1>

        {/* NAVIGATION */}
        <div className="mb-6">
          <Link href="/condensate" className="text-blue-600 underline">
            ← Back to Condensate Model Home
          </Link>
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
                <th className="border p-2 text-left">Metric</th>
                {scenarios.map((s) => (
                  <th key={s.id} className="border p-2 text-left">
                    <div className="font-semibold">{s.scenario_name}</div>
                    <div className="text-xs text-gray-600">
                      {s.supplier} — {s.month_name}-{String(s.year).slice(2)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>

              {/* Condensate Supplier */}
              <tr>
                <td className="border p-2 font-medium">Condensate Supplier</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">{s.supplier}</td>
                ))}
              </tr>

              {/* Condensate Source Location */}
              <tr>
                <td className="border p-2 font-medium">Condensate Source Location</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">{s.source_location}</td>
                ))}
              </tr>

              {/* Trucking Time */}
              <tr>
                <td className="border p-2 font-medium">Trucking Time (hrs)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmt(s.trucking_time_hours, 2)}
                  </td>
                ))}
              </tr>

              {/* Destination */}
              <tr>
                <td className="border p-2 font-medium">Destination</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">{s.destination}</td>
                ))}
              </tr>

              {/* Heavy Oil Stream */}
              <tr>
                <td className="border p-2 font-medium">Heavy Oil Stream</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">{s.heavy_stream}</td>
                ))}
              </tr>

              {/* Density */}
              <tr>
                <td className="border p-2 font-medium">Condensate Density (kg/m³)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmt(s.inputs?.density_kg_m3, 1)}
                  </td>
                ))}
              </tr>

              {/* Sulphur */}
              <tr>
                <td className="border p-2 font-medium">Condensate Sulphur (%wt)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmt(s.inputs?.sulphur_pct, 3)}
                  </td>
                ))}
              </tr>

              {/* C2 */}
              <tr>
                <td className="border p-2 font-medium">Condensate C2 (%vol)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmt(s.inputs?.c2_pct, 2)}
                  </td>
                ))}
              </tr>

              {/* C3 */}
              <tr>
                <td className="border p-2 font-medium">Condensate C3 (%vol)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmt(s.inputs?.c3_pct, 2)}
                  </td>
                ))}
              </tr>

              {/* C4 */}
              <tr>
                <td className="border p-2 font-medium">Condensate C4 (%vol)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmt(s.inputs?.c4_pct, 2)}
                  </td>
                ))}
              </tr>

              {/* WTI */}
              <tr>
                <td className="border p-2 font-medium">WTI (USD/bbl)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.results?.wti_usd_bbl, 2)}
                  </td>
                ))}
              </tr>

              {/* FX */}
              <tr>
                <td className="border p-2 font-medium">FX (CAD/USD)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmt(s.results?.fx_cad_usd, 5)}
                  </td>
                ))}
              </tr>

              {/* Stream Diff */}
              <tr>
                <td className="border p-2 font-medium">Stream Diff (USD/bbl)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.results?.stream_diff_usd_bbl, 2)}
                  </td>
                ))}
              </tr>

              {/* Stream Price USD/bbl */}
              <tr>
                <td className="border p-2 font-medium">Stream Price (USD/bbl)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.results?.stream_price_usd_bbl, 2)}
                  </td>
                ))}
              </tr>

              {/* Stream Price CAD/m³ */}
              <tr>
                <td className="border p-2 font-medium">Stream Price (CAD/m³)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.results?.stream_price_cad_m3, 2)}
                  </td>
                ))}
              </tr>

              {/* WADF */}
              <tr>
                <td className="border p-2 font-medium">WADF (CAD/m³)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.results?.wadf_cad_m3, 2)}
                  </td>
                ))}
              </tr>

              {/* PAR Price */}
              <tr>
                <td className="border p-2 font-medium">PAR Price (CAD/m³)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.results?.par_price_cad_m3, 2)}
                  </td>
                ))}
              </tr>

              {/* EQ */}
              <tr>
                <td className="border p-2 font-medium">EQ (CAD/m³)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.results?.eq_adjustment_cad_m3, 2)}
                  </td>
                ))}
              </tr>

              {/* Tariff */}
              <tr>
                <td className="border p-2 font-medium">Tariff (CAD/m³)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.inputs?.tariff_cad_m3, 2)}
                  </td>
                ))}
              </tr>

              {/* Load Fee */}
              <tr>
                <td className="border p-2 font-medium">Load Fee (CAD/m³)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.inputs?.loading_fee_cad_m3, 2)}
                  </td>
                ))}
              </tr>

              {/* Loss Allowance */}
              <tr>
                <td className="border p-2 font-medium">Loss Allowance (CAD/m³)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.inputs?.loss_allowance_cad_m3, 2)}
                  </td>
                ))}
              </tr>

              {/* Premium/Discount */}
              <tr>
                <td className="border p-2 font-medium">Premium/Discount (CAD/m³)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.inputs?.premium_discount_cad_m3, 2)}
                  </td>
                ))}
              </tr>

              {/* Price Before Trucking */}
              <tr className="bg-gray-50">
                <td className="border p-2 font-semibold">Price Before Trucking (CAD/m³)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2 font-semibold">
                    {fmtMoney(s.results?.price_before_trucking_cad_m3, 2)}
                  </td>
                ))}
              </tr>

              {/* Trucking */}
              <tr>
                <td className="border p-2 font-medium">Trucking (CAD/m³)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.inputs?.trucking_cad_m3, 2)}
                  </td>
                ))}
              </tr>

              {/* Landed Cost CAD/m³ */}
              <tr className="bg-gray-100">
                <td className="border p-2 font-bold">Condensate LANDED COST (CAD/m³)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2 font-bold">
                    {fmtMoney(s.results?.landed_cost_cad_m3, 2)}
                  </td>
                ))}
              </tr>

              {/* Landed Cost USD/bbl */}
              <tr>
                <td className="border p-2 font-medium">Condensate LANDED COST (USD/bbl)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.results?.landed_cost_usd_bbl, 2)}
                  </td>
                ))}
              </tr>

              {/* Diff to WTI */}
              <tr>
                <td className="border p-2 font-medium">Diff to WTI (USD/bbl)</td>
                {scenarios.map((s) => (
                  <td key={s.id} className="border p-2">
                    {fmtMoney(s.results?.landed_cost_diff_to_wti_usd_bbl, 2)}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}

export default function CondensateComparisonTablePage() {
  return (
    <Suspense fallback={<div>Loading comparison…</div>}>
      <ComparisonTableContent />
    </Suspense>
  );
}

// app/condensate/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useEffect } from "react"; // add at top if missing

function CondensateInputPageInner() {
  const searchParams = useSearchParams();
  const existingIds = searchParams.get("ids");

  const [form, setForm] = useState({
    scenario_name: "",
    month: "",
    supplier: "",
    source_location: "",
    trucking_time_hours: "",
    density_kg_m3: "",
    sulphur_pct: "",
    c2_pct: "",
    c3_pct: "",
    c4_pct: "",
    destination: "",
    heavy_stream: "",
    tariff_cad_m3: "",
    loading_fee_cad_m3: "",
    loss_allowance_cad_m3: "",
    premium_discount_cad_m3: "",
    trucking_cad_m3: "",
    apply_edi_colc: false,
  });

  const [saving, setSaving] = useState(false);
  const [previousScenarioName, setPreviousScenarioName] = useState("");

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

useEffect(() => {
  if (!existingIds) return;

  const ids = existingIds.split(",");
  const lastId = ids[ids.length - 1];

  fetch(`/api/condensate/scenario/${lastId}`)
    .then((res) => res.json())
    .then((data) => {
      if (data?.scenario_name) {
        setPreviousScenarioName(data.scenario_name);
      }
    })
    .catch(() => {});
}, [existingIds]);

  async function handleSubmit() {
    setSaving(true);

    const res = await fetch("/api/condensate/calc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to calculate condensate economics.");
      setSaving(false);
      return;
    }

    const existing = new URLSearchParams(window.location.search).get("ids");
    const newIds = existing ? `${existing},${data.scenarioId}` : `${data.scenarioId}`;
    window.location.href = `/condensate/comparison/table?ids=${newIds}`;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded shadow max-w-3xl mx-auto">


        <h1 className="text-2xl font-bold mb-6">
          Condensate Comparison Model
        </h1>

        <div className="mb-6">
          <Link href="/models" className="text-blue-600 underline">
            ← Back to Models
          </Link>
        </div>

        <div className="space-y-6">

          {/* Scenario Name */}
<div>
  <label className="block font-medium mb-1">Scenario Name</label>

  {/* Dropdown to reuse previous scenario name */}
  <select
    className="border p-2 rounded w-full mb-2"
    onChange={(e) => update("scenario_name", e.target.value)}
  >
    <option value="">Type a new Scenario Name</option>
    {previousScenarioName && (
      <option value={previousScenarioName}>
        Use previous: {previousScenarioName}
      </option>
    )}
  </select>

  {/* Text input for new scenario name */}
  <input
    className="border p-2 rounded w-full"
    placeholder="Enter Scenario Name"
    value={form.scenario_name}
    onChange={(e) => update("scenario_name", e.target.value)}
  />
</div>


          {/* Month */}
          <div>
            <label className="block font-medium mb-1">Month / Year</label>
            <select
              className="border p-2 rounded w-full"
              value={form.month}
              onChange={(e) => update("month", e.target.value)}
            >
              <option value="">Select Month</option>
              <option value="Jan-2024">January 2024</option>
              <option value="Feb-2024">February 2024</option>
              <option value="Mar-2024">March 2024</option>
              <option value="Apr-2024">April 2024</option>
              <option value="May-2024">May 2024</option>
              <option value="Jun-2024">June 2024</option>
              <option value="Jul-2024">July 2024</option>
              <option value="Aug-2024">August 2024</option>
              <option value="Sep-2024">September 2024</option>
              <option value="Oct-2024">October 2024</option>
              <option value="Nov-2024">November 2024</option>
              <option value="Dec-2024">December 2024</option>
            </select>
          </div>

          {/* Condensate Supplier */}
          <div>
            <label className="block font-medium mb-1">Condensate Supplier</label>
            <select
              className="border p-2 rounded w-full"
              value={form.supplier}
              onChange={(e) => update("supplier", e.target.value)}
            >
              <option value="">Select Supplier</option>
              <option value="FTSK">FTSK</option>
              <option value="CRW">CRW</option>
              <option value="PEACE_C5">Peace C5</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Condensate Source Location */}
          <div>
            <label className="block font-medium mb-1">Condensate Source Location</label>
            <input
              className="border p-2 rounded w-full"
              placeholder="e.g., Enbridge Edmonton CRW Tank"
              value={form.source_location}
              onChange={(e) => update("source_location", e.target.value)}
            />
          </div>

          {/* Trucking Time */}
          <div>
            <label className="block font-medium mb-1">Trucking Time (hours)</label>
            <input
              className="border p-2 rounded w-full"
              placeholder="e.g., 3.25 for 3 hr 15 min"
              value={form.trucking_time_hours}
              onChange={(e) => update("trucking_time_hours", e.target.value)}
            />
          </div>

          {/* Condensate Properties */}
          <div className="bg-gray-100 p-4 rounded border">
            <h2 className="font-semibold mb-3">Condensate Properties</h2>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="block font-medium mb-1">Density (KG/M3)</label>
                <input
                  className="border p-2 rounded w-full"
                  value={form.density_kg_m3}
                  onChange={(e) => update("density_kg_m3", e.target.value)}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Sulphur (%Swt)</label>
                <input
                  className="border p-2 rounded w-full"
                  value={form.sulphur_pct}
                  onChange={(e) => update("sulphur_pct", e.target.value)}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">C2 (%vol)</label>
                <input
                  className="border p-2 rounded w-full"
                  value={form.c2_pct}
                  onChange={(e) => update("c2_pct", e.target.value)}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">C3 (%vol)</label>
                <input
                  className="border p-2 rounded w-full"
                  value={form.c3_pct}
                  onChange={(e) => update("c3_pct", e.target.value)}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">C4 (%vol)</label>
                <input
                  className="border p-2 rounded w-full"
                  value={form.c4_pct}
                  onChange={(e) => update("c4_pct", e.target.value)}
                />
              </div>

            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block font-medium mb-1">Condensate Destination</label>
            <input
              className="border p-2 rounded w-full"
              placeholder="e.g., Heavy Oil Terminal"
              value={form.destination}
              onChange={(e) => update("destination", e.target.value)}
            />
          </div>

          {/* Heavy Oil Stream */}
          <div>
            <label className="block font-medium mb-1">Heavy Oil (Blended) Stream</label>
            <select
              className="border p-2 rounded w-full"
              value={form.heavy_stream}
              onChange={(e) => update("heavy_stream", e.target.value)}
            >
              <option value="">Select Heavy Oil Stream</option>
              <option value="CHV">CHV</option>
              <option value="CWH">CWH</option>
              <option value="LLB">LLB</option>
              <option value="WCB">WCB</option>
              <option value="LLK">LLK</option>
              <option value="CLK">CLK</option>
              <option value="WCS">WCS</option>
            </select>
          </div>

          {/* Cost Inputs */}
<div className="bg-gray-100 p-4 rounded border">
  <h2 className="font-semibold mb-3">Cost Inputs (CAD/M3)</h2>

  <div className="grid grid-cols-2 gap-4">

    <div>
      <label className="block font-medium mb-1">Pipeline Tariff</label>
      <input
        className="border p-2 rounded w-full"
        value={form.tariff_cad_m3}
        onChange={(e) => update("tariff_cad_m3", e.target.value)}
      />
    </div>

    <div>
      <label className="block font-medium mb-1">Load / Unload Fee</label>
      <input
        className="border p-2 rounded w-full"
        value={form.loading_fee_cad_m3}
        onChange={(e) => update("loading_fee_cad_m3", e.target.value)}
      />
    </div>

    <div>
      <label className="block font-medium mb-1">Loss Allowance</label>
      <input
        className="border p-2 rounded w-full"
        value={form.loss_allowance_cad_m3}
        onChange={(e) => update("loss_allowance_cad_m3", e.target.value)}
      />
    </div>

    <div>
      <label className="block font-medium mb-1">Premium / Discount</label>
      <input
        className="border p-2 rounded w-full"
        value={form.premium_discount_cad_m3}
        onChange={(e) => update("premium_discount_cad_m3", e.target.value)}
      />
    </div>

    <div>
      <label className="block font-medium mb-1">Trucking Cost</label>
      <input
        className="border p-2 rounded w-full"
        value={form.trucking_cad_m3}
        onChange={(e) => update("trucking_cad_m3", e.target.value)}
      />
    </div>

    {/* Apply EDI/COLC Fees */}
    <div className="col-span-2 flex items-center space-x-2">
      <input
        type="checkbox"
        checked={form.apply_edi_colc}
        onChange={(e) => update("apply_edi_colc", e.target.checked)}
      />
      <label className="font-medium">
        Apply EDI & COLC Pipeline Fees
      </label>
    </div>

  </div>
</div>

<button
  onClick={handleSubmit}
  disabled={saving}
  className="px-5 py-2 bg-black text-white rounded w-full"
>
  {saving ? "Calculating…" : "Calculate Condensate Economics"}
</button>

</div>
</div>
</main>
);
}

export default function CondensateInputPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <CondensateInputPageInner />
    </Suspense>
  );
}

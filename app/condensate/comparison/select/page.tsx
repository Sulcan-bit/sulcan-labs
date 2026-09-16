// app/condensate/comparison/select/page.tsx

"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type CondensateScenario = {
  id: number;
  scenario_name: string;
  supplier: string;
  source_location: string;
  month_name: string;
  year: number;
  destination: string;
  heavy_stream: string;
  density_kg_m3: number | null;
  sulphur_pct: number | null;
  c2_pct: number | null;
  c3_pct: number | null;
  c4_pct: number | null;
};

export default function CondensateSelectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Existing selected IDs from comparison table
  const idsParam = searchParams.get("ids") ?? "";
  const existingIds = useMemo(
    () =>
      idsParam
        .split(",")
        .map((n) => Number(n))
        .filter((n) => !Number.isNaN(n)),
    [idsParam]
  );

  const [scenarios, setScenarios] = useState<CondensateScenario[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/condensate/scenarios", {
        cache: "no-store",
      });
      const data = await res.json();

      const list: CondensateScenario[] =
        Array.isArray(data) ? data : data.scenarios || [];

      // Option C — hide already-selected scenarios
      const filtered = list.filter((s) => !existingIds.includes(s.id));

      setScenarios(filtered);
    }

    load();
  }, [existingIds]);

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleContinue() {
    if (selected.length === 0) {
      alert("Select at least one scenario.");
      return;
    }

    const combined = [...existingIds, ...selected];
    router.push(`/condensate/comparison/table?ids=${combined.join(",")}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            Add Condensate Sources to Comparison
          </h1>

          <Link
            href="/condensate"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-8">

        <h2 className="text-2xl font-bold mb-8">
          Select Additional Condensate Models
        </h2>

        {/* Scenario List */}
        <div className="space-y-6">
          {scenarios.map((s) => (
            <div
              key={s.id}
              className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition"
            >
              {/* Scenario Name */}
              <h3 className="text-xl font-semibold mb-4">
                {s.scenario_name}
              </h3>

              {/* Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                <div>
                  <p><span className="font-medium">Supplier:</span> {s.supplier}</p>
                  <p><span className="font-medium">Source Location:</span> {s.source_location}</p>
                  <p><span className="font-medium">Month-Year:</span> {s.month_name}-{String(s.year).slice(2)}</p>
                  <p><span className="font-medium">Destination:</span> {s.destination}</p>
                  <p><span className="font-medium">Heavy Stream:</span> {s.heavy_stream}</p>
                </div>

                <div>
                  <p><span className="font-medium">Density:</span> {s.density_kg_m3 ?? "-"} kg/m³</p>
                  <p><span className="font-medium">Sulphur:</span> {s.sulphur_pct ?? "-"}%</p>
                  <p>
                    <span className="font-medium">C2/C3/C4:</span>{" "}
                    {s.c2_pct ?? "-"}% / {s.c3_pct ?? "-"}% / {s.c4_pct ?? "-"}%
                  </p>
                </div>

              </div>

              {/* Checkbox */}
              <div className="mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={selected.includes(s.id)}
                    onChange={() => toggle(s.id)}
                  />
                  <span className="text-sm font-medium">Select this model</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="mt-8 w-full bg-blue-600 text-white p-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          Continue →
        </button>
      </div>
    </main>
  );
}

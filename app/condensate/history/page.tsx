// app/condensate/history/page.tsx

"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";

type CondensateScenario = {
  id: number;
  scenario_name: string;
  supplier: string;
  source_location: string;
  month_name: string;
  year: number;
};

type ScenarioGroups = Record<string, CondensateScenario[]>;

export default function CondensateHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<ScenarioGroups>({});

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/condensate/scenarios", {
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("Failed to load condensate scenarios");
          setLoading(false);
          return;
        }

        const data = await res.json();

        const scenarios: CondensateScenario[] =
          Array.isArray(data) ? data : data.scenarios || [];

        const grouped: ScenarioGroups = scenarios.reduce(
          (acc: ScenarioGroups, s: CondensateScenario) => {
            if (!acc[s.scenario_name]) acc[s.scenario_name] = [];
            acc[s.scenario_name].push(s);
            return acc;
          },
          {}
        );

        setGroups(grouped);
      } catch (err) {
        console.error("Error loading condensate scenarios", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="text-center text-gray-600">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            Condensate Comparison History
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
        <div className="space-y-8">
          {Object.entries(groups).map(([scenarioName, items]) => {
            const ids = items.map((s) => s.id).join(",");

            return (
              <div
                key={scenarioName}
                className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-xl font-semibold mb-2">
                  {scenarioName}
                </h2>

                <p className="text-gray-700 mb-3">
                  {items[0].month_name}-{String(items[0].year).slice(2)}
                </p>

                <div className="mb-4">
                  <h3 className="font-medium mb-1">Condensate Sources:</h3>
                  <ul className="list-disc ml-6 text-gray-700">
                    {items.map((s) => (
                      <li key={s.id}>
                        {s.supplier} — {s.source_location}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/condensate/comparison/table?ids=${ids}`}
                  className="inline-block px-4 py-2 bg-black text-white rounded"
                >
                  View Comparison Table
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}





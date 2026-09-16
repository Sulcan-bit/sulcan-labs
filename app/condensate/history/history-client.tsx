// app/condensate/history/history-client.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CondensateScenario {
  id: number;
  scenario_name: string;
  supplier: string;
  source_location: string;
  month_name: string;
  year: number;
}

type ScenarioGroups = Record<string, CondensateScenario[]>;

export default function HistoryClient() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<ScenarioGroups>({});

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/condensate/scenarios", {
        cache: "no-store",
      });

      const data: CondensateScenario[] = await res.json();

      const grouped: ScenarioGroups = data.reduce(
        (acc: ScenarioGroups, s: CondensateScenario) => {
          if (!acc[s.scenario_name]) acc[s.scenario_name] = [];
          acc[s.scenario_name].push(s);
          return acc;
        },
        {}
      );

      setGroups(grouped);
      setLoading(false);
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
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          Condensate Comparison History
        </h1>

        <div className="space-y-8">

          {Object.entries(groups).map(([scenarioName, items]) => {
            const ids = items.map((s) => s.id).join(",");

            return (
              <div key={scenarioName} className="border rounded p-4 bg-gray-100">

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

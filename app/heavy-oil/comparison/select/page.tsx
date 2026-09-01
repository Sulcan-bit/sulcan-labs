// app/heavy-oil/comparison/select/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ScenarioItem = {
  id: number;
  scenario_name: string;
  terminal_operator: string;
  terminal_location: string;
  inputs?: {
    producer_name?: string;
    producer_density_kg_m3?: number;
  };
  created_at?: string | Date;
  created_at_text?: string;
};

export default function ComparisonSelectPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/heavy-oil/scenarios");
      const data = await res.json();
      setScenarios(data.scenarios || []);
    }
    load();
  }, []);

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

    router.push(`/heavy-oil/comparison/table?ids=${selected.join(",")}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            Blended Heavy Oil Netback Comparison
          </h1>

          <Link
            href="/heavy-oil"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-8">

        <h2 className="text-2xl font-bold mb-8">
          Select Scenarios for Comparison
        </h2>

        {/* Scenario List */}
        <div className="space-y-4">
          {scenarios.map((s) => (
            <div
              key={s.id}
              className="bg-white border rounded-lg p-5 shadow-sm flex items-center justify-between hover:shadow-md transition"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {s.scenario_name}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Terminal Operator:</span>{" "}
                  {s.terminal_operator} — {s.terminal_location}
                </p>

                {/* Producer Name */}
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-medium">Producer:</span>{" "}
                  {s.inputs?.producer_name}
                </p>

                {/* Producer Raw Crude Density */}
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Raw Crude Density:</span>{" "}
                  {s.inputs?.producer_density_kg_m3} kg/m³
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Created:{" "}
                  {s.created_at_text ||
                    new Date(String(s.created_at)).toLocaleString("en-CA")}
                </p>
              </div>

              <div className="pl-4">
                <input
                  type="checkbox"
                  className="h-5 w-5 cursor-pointer"
                  checked={selected.includes(s.id)}
                  onChange={() => toggle(s.id)}
                />
              </div>
            </div>
          ))}
        </div>

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

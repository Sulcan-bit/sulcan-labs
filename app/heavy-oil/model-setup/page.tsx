// app/heavy-oil/model-setup/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ModelSetupScreen() {
  const router = useRouter();

  // -----------------------------------------
  // Scenario Metadata
  // -----------------------------------------
  const [scenarioName, setScenarioName] = useState("");
  const [terminalOperator, setTerminalOperator] = useState("");
  const [terminalLocation, setTerminalLocation] = useState("");
  const [notes, setNotes] = useState("");

  // -----------------------------------------
  // LSD fields
  // -----------------------------------------
  const [lsd, setLsd] = useState("");
  const [section, setSection] = useState("");
  const [township, setTownship] = useState("");
  const [range, setRange] = useState("");
  const [meridian, setMeridian] = useState("");
  const [locationError, setLocationError] = useState("");

  // -----------------------------------------
  // Shrinkage Model
  // -----------------------------------------
  const shrinkageOptions = [
    { value: "api_bitumen", label: "API 12.3 Bitumen" },
    { value: "api_heavy", label: "API 12.3 Heavy Oil" },
    { value: "novacor", label: "Novacor" },
  ];

  const [shrinkageModel, setShrinkageModel] = useState("");

  // -----------------------------------------
  // LSD Validation
  // -----------------------------------------
  function validateLSDFields() {
    const assembled = `${lsd}-${section}-${township}-${range}-${meridian}`;

    const lsdRegex =
      /^([1-9]|1[0-6])-(?:[1-9]|[12][0-9]|3[0-6])-(?:[1-9]|[1-9][0-9]|1[0-1][0-9]|12[0-6])-(?:[1-9]|[12][0-9]|3[0-9])-(W4|W5|W6)$/;

    if (!lsdRegex.test(assembled)) {
      setLocationError(
        "Invalid LSD format. Required: [LSD]-[Section]-[Township]-[Range]-W[Meridian] (e.g., 7-25-24-1-W5)"
      );
      return null;
    }

    setLocationError("");
    return assembled;
  }

  // -----------------------------------------
  // Continue → InputsForm
  // -----------------------------------------
  function handleContinue() {
    if (!scenarioName || !terminalOperator || !shrinkageModel) {
      alert("Please complete all required fields.");
      return;
    }

    const assembledLSD = validateLSDFields();
    if (!assembledLSD) {
      alert("Please correct the LSD format before continuing.");
      return;
    }

    setTerminalLocation(assembledLSD);

    const now = new Date();
    const timestamp = now.toLocaleString("en-CA", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const scenarioNameWithTimestamp = `${scenarioName} — ${timestamp}`;

    const setup = {
      scenarioName: scenarioNameWithTimestamp,
      terminalOperator,
      terminalLocation: assembledLSD,
      shrinkageModel,
      notes,
      createdAt: timestamp,
    };

    router.push(
      `/heavy-oil/inputs?setup=${encodeURIComponent(JSON.stringify(setup))}`
    );
  }

  // -----------------------------------------
  // Render
  // -----------------------------------------
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            Heavy Oil Model Setup
          </h1>

          {/* FIXED HOME LINK */}
          <Link
            href="/heavy-oil"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-8 bg-white mt-10 rounded-lg shadow-md">

        {/* Back Button */}
        <button
          onClick={() => router.push("/models")}
          className="mb-8 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          ← Back to Models
        </button>

        {/* Scenario Name */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Scenario Name</h2>
          <input
            type="text"
            className="border p-3 rounded w-full"
            placeholder="Proposed North Truck Terminal"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-2">
            A timestamp will be automatically appended.
          </p>
        </section>

        {/* Terminal Operator */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Terminal Operator</h2>
          <input
            type="text"
            className="border p-3 rounded w-full"
            placeholder="Heavy Oil Terminal Inc."
            value={terminalOperator}
            onChange={(e) => setTerminalOperator(e.target.value)}
          />
        </section>

        {/* Terminal Location (LSD) */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">3. Terminal Location (LSD)</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

            <div>
              <label className="block mb-1 font-medium">LSD (1–16)</label>
              <input
                type="number"
                min="1"
                max="16"
                className="border p-3 rounded w-full"
                value={lsd}
                onChange={(e) => setLsd(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Section (1–36)</label>
              <input
                type="number"
                min="1"
                max="36"
                className="border p-3 rounded w-full"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Township (1–126)</label>
              <input
                type="number"
                min="1"
                max="126"
                className="border p-3 rounded w-full"
                value={township}
                onChange={(e) => setTownship(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Range (1–30)</label>
              <input
                type="number"
                min="1"
                max="30"
                className="border p-3 rounded w-full"
                value={range}
                onChange={(e) => setRange(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Meridian</label>
              <select
                className="border p-3 rounded w-full"
                value={meridian}
                onChange={(e) => setMeridian(e.target.value)}
              >
                <option value="">Select</option>
                <option value="W4">W4</option>
                <option value="W5">W5</option>
                <option value="W6">W6</option>
              </select>
            </div>
          </div>

          {locationError && (
            <p className="text-red-600 text-sm mt-3">{locationError}</p>
          )}

          <p className="text-sm text-gray-500 mt-3">
            Format: [LSD]-[Section]-[Township]-[Range]-W[Meridian]  
            <br />
            Example: <span className="font-mono">7-25-24-1-W5</span>
          </p>
        </section>

        {/* Shrinkage Model */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Shrinkage Model</h2>
          <select
            className="border p-3 rounded w-full"
            value={shrinkageModel}
            onChange={(e) => setShrinkageModel(e.target.value)}
          >
            <option value="">Select shrinkage model</option>
            {shrinkageOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </section>

        {/* Notes */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Notes (Optional)</h2>
          <textarea
            className="border p-3 rounded w-full"
            rows={4}
            placeholder="Optional notes about this scenario (e.g., assumptions, operator comments)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>

        {/* Continue */}
        <button
          onClick={handleContinue}
          className="bg-blue-600 text-white p-4 rounded-lg w-full text-lg font-semibold hover:bg-blue-700 transition"
        >
          Continue to Inputs →
        </button>
      </div>
    </main>
  );
}





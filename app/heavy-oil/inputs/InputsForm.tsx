// app/heavy-oil/inputs/InputsForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Allow dynamic indexing for all form fields
type InputsFormType = {
  [key: string]: string | number | null;
};

// Basic typing for months and previousSets
type MonthType = {
  id: number;
  year: number;
  month: string;
};

type PreviousSetType = {
  id: number;
  created_at: string;
  producer_name: string;
  [key: string]: any;
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}


type InputProps = {
  label: string;
  field: string;
  update: (field: string, value: string | number | null) => void;
  placeholder?: string;
  value: string | number | null;
};

function Input({ label, field, update, placeholder, value }: InputProps) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="border p-2 rounded w-full"
        value={value ?? ""}
        onChange={(e) => update(field, e.target.value as string)}
      />
    </div>
  );
}

export default function InputsForm({ months }: { months: MonthType[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ------------------------------------------------------------
  // Load scenario metadata from model-setup/page.tsx
  // ------------------------------------------------------------
  const setupJson = searchParams.get("setup");
  const setup = setupJson ? JSON.parse(setupJson) : {};

  const {
    scenarioName,
    terminalOperator,
    terminalLocation,
    shrinkageModel,
    notes,
  } = setup;

  // ------------------------------------------------------------
  // TT1‑ONLY FORM FIELDS
  // ------------------------------------------------------------
  const EMPTY_FORM: InputsFormType = {
    monthId: "",
    heavy_oil_stream: "",
    condensate_index_choice: "",

    // Producer
    producer_name: "",
    producer_volume_m3: "",
    producer_density_kg_m3: "",
    producer_TAN: "",
    target_blend_density: "",

    // Condensate Source 1
    cond1_density_kg_m3: "",
    cond1_sulphur_pct: "",
    cond1_load_fee_cad_m3: "",
    cond1_transport_tt1_cad_m3: "",
    cond1_hours_tt1: "",
    cond_trucking_rate_cad_m3: "",
    cond_truck_volume_m3: "",

    // Condensate Source 2
    cond2_density_kg_m3: "",
    cond2_sulphur_pct: "",
    cond2_load_fee_cad_m3: "",
    cond2_transport_tt1_cad_m3: "",
    cond2_hours_tt1: "",

    // Butane
    butane_injection_rate_pct: "",
    c4_trucking_rate_cad_m3: "",
    c4_truck_volume_m3: "",
    c4_hours_tt1: "",

    // Raw Crude Trucking
    raw_crude_trucking_rate_cad_m3: "",
    raw_crude_truck_volume_m3: "",
    raw_crude_hours_tt1: "",

    // Terminal Fee (TT1 only)
    tt1_fee_cad_m3: "",

    // Pipeline Fees (TT1 only)
    pipeline_power_surcharge_cad_m3: "",
    pipeline_loss_allowance_pct: "",
    pipeline_toll_tt1_cad_m3: "",

    // Profit Sharing (TT1 only)
    tt1_diluent_sharing_pct: "",

    // Premium Crude Values
    premium_crude_value_usd_bbl: "",
    hardisty_premium_crude_value_usd_bbl: "",

    scenarioId: null,
  };

  const REQUIRED_FIELDS = Object.keys(EMPTY_FORM).filter(
    (f) => f !== "scenarioId"
  );

  const [form, setForm] = useState<InputsFormType>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [previousSets, setPreviousSets] = useState<PreviousSetType[]>([]);
  const [selectedPreviousId, setSelectedPreviousId] = useState("");

  const STREAM_OPTIONS = [
    "MSW", "MSE", "MSY",
    "PEACE C5", "KAPS C5", "CRW C5",
    "WCS", "CHV", "LLB", "LLK",
    "WCB", "CWH", "BRN", "BRS",
    "CAL", "LSB"
  ];

  // ------------------------------------------------------------
  // Load previous datasets
  // ------------------------------------------------------------
  useEffect(() => {
    async function loadPrevious() {
      const res = await fetch("/api/heavy-oil/inputs/list");
      if (res.ok) {
        const data = await res.json();
        setPreviousSets(data);
      }
    }
    loadPrevious();
  }, []);

function normalizeLsdNumber(value: string): string {
  // Remove leading zeros, but keep "0" if the user actually typed 0
  const cleaned = value.replace(/^0+/, "");
  return cleaned === "" ? "0" : cleaned;
}


 function updateField(field: string, value: string) {
  const lsdFields = ["lsd", "section", "township", "range"];

  const cleaned =
    lsdFields.includes(field)
      ? normalizeLsdNumber(value)
      : value;

  setForm((prev) => ({ ...prev, [field]: cleaned }));
}



  // ------------------------------------------------------------
  // Validation
  // ------------------------------------------------------------
  function validateForm() {
    const missing = REQUIRED_FIELDS.filter((field) => !form[field]);

    if (missing.length > 0) {
      setMessage("Please complete all required fields before saving.");
      return false;
    }

    return true;
  }

  // ------------------------------------------------------------
  // Save Inputs
  // ------------------------------------------------------------
  async function handleSubmit() {
    setMessage("");

    if (!validateForm()) return;

    setSaving(true);

    const payload = {
      ...form,
      scenarioName,
      terminalOperator,
      terminalLocation,
      shrinkageModel,
      notes,
    };

    const res = await fetch("/api/heavy-oil/inputs/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to save.");
      setSaving(false);
      return;
    }

    setMessage("Inputs saved successfully.");

    if (data.scenarioId) {
      updateField("scenarioId", data.scenarioId.toString());
    }

    setSaving(false);
  }

  // ------------------------------------------------------------
  // Run Model
  // ------------------------------------------------------------
  function runModel() {
    if (!form.scenarioId) {
      setMessage("Please save inputs before running the model.");
      return;
    }
    router.push(`/heavy-oil/model-a?scenarioId=${form.scenarioId}`);
  }

  // ------------------------------------------------------------
  // Load previous dataset
  // ------------------------------------------------------------
  async function loadDataset(id: string) {
    const res = await fetch(`/api/heavy-oil/inputs/${id}`);
    if (!res.ok) {
      setMessage("Failed to load dataset.");
      return;
    }

    const data = await res.json();

    delete data.id;
    delete data.created_at;
    delete data.updated_at;

    const formatted: InputsFormType = {};

    for (const [key, value] of Object.entries(data)) {
      formatted[key] =
        typeof value === "number" ? value.toFixed(2) : value;
    }

    setForm({ ...formatted, scenarioId: null });
    setMessage(`Loaded dataset #${id}`);
  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">

      {/* Scenario Metadata */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Scenario Metadata</h2>
        <p><strong>Name:</strong> {scenarioName}</p>
        <p><strong>Operator:</strong> {terminalOperator}</p>
        <p><strong>Location (LSD):</strong> {terminalLocation}</p>
        <p><strong>Shrinkage Model:</strong> {shrinkageModel}</p>
        {notes && <p><strong>Notes:</strong> {notes}</p>}
      </div>

     

      {/* Load Previous Inputs */}
      <Section title="Load Previous Inputs">
        <select
          className="border p-2 rounded w-full"
          value={selectedPreviousId}
          onChange={async (e) => {
            const id = e.target.value;
            setSelectedPreviousId(id);
            if (id) await loadDataset(id);
          }}
        >
          <option value="">Select a previous dataset</option>
          {previousSets.map((p) => (
            <option key={p.id} value={p.id.toString()}>
              #{p.id} — {p.created_at.slice(0, 10)} — {p.producer_name}
            </option>
          ))}
        </select>
      </Section>

      {/* 1. Pricing Month */}
      <Section title="1. Pricing Month">
        <select
          className="border p-2 rounded w-full"
          value={form.monthId ?? ""}
          onChange={(e) => updateField("monthId", e.target.value as string)}

        >
          <option value="">Select Month</option>
          {months.map((m) => (
            <option key={m.id} value={m.id.toString()}>
              {m.year} — {m.month}
            </option>
          ))}
        </select>
      </Section>

      {/* 2. Heavy Oil Stream */}
      <Section title="2. Heavy Oil Stream">
        <select
          className="border p-2 rounded w-full"
          value={form.heavy_oil_stream ?? ""}
          onChange={(e) => updateField("heavy_oil_stream", e.target.value)}
        >
          <option value="">Select Stream</option>
          {STREAM_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </Section>

      {/* 3. Condensate Index */}
      <Section title="3. Condensate Index">
        <select
          className="border p-2 rounded w-full"
          value={form.condensate_index_choice ?? ""}
          onChange={(e) => updateField("condensate_index_choice", e.target.value)}
        >
          <option value="">Select Condensate Index</option>
          <option value="CRW">CRW</option>
          <option value="FTSK">FTSK / FSK</option>
          <option value="PEACE_C5">Peace C5</option>
          <option value="OTHER">Other</option>
        </select>
      </Section>

      {/* 4. Producer */}
      <Section title="4. Producer Raw Crude Properties">
        <Input label="Producer Name" field="producer_name" update={updateField} placeholder="Alberta Oil Co." value={form.producer_name} />
        <Input label="Raw Crude Monthly Volume (m³)" field="producer_volume_m3" update={updateField} placeholder="31000" value={form.producer_volume_m3} />
        <Input label="Raw Crude Density (kg/m³)" field="producer_density_kg_m3" update={updateField} placeholder="965.0" value={form.producer_density_kg_m3} />
        <Input label="Target Blend Density (kg/m³)" field="target_blend_density" update={updateField} placeholder="935.0" value={form.target_blend_density} />
        <Input label="TAN" field="producer_TAN" update={updateField} placeholder="0.8" value={form.producer_TAN} />

        <Input label="Raw Crude Truck Haul Rate (CAD/m³)" field="raw_crude_trucking_rate_cad_m3" update={updateField} placeholder="195.00" value={form.raw_crude_trucking_rate_cad_m3} />
        <Input label="Raw Crude Truck Haul Volume (m³)" field="raw_crude_truck_volume_m3" update={updateField} placeholder="42.0" value={form.raw_crude_truck_volume_m3} />
        <Input
          label={`Raw Crude Trucking Hours to ${terminalLocation}`}
          field="raw_crude_hours_tt1"
          update={updateField}
          placeholder="1.0"
          value={form.raw_crude_hours_tt1}
        />
      </Section>

      {/* 5. Condensate Source 1 */}
      <Section title="5. Condensate Source 1">
        <Input label="Density (kg/m³)" field="cond1_density_kg_m3" update={updateField} placeholder="660.0" value={form.cond1_density_kg_m3} />
        <Input label="Sulphur (%)" field="cond1_sulphur_pct" update={updateField} placeholder="0.015" value={form.cond1_sulphur_pct} />
        <Input label="Truck Load Fee (CAD/m³)" field="cond1_load_fee_cad_m3" update={updateField} placeholder="8.50" value={form.cond1_load_fee_cad_m3} />
        <Input
          label={`Truck Rate to ${terminalLocation} (CAD/m³)`}
          field="cond1_transport_tt1_cad_m3"
          update={updateField}
          placeholder="30.00"
          value={form.cond1_transport_tt1_cad_m3}
        />

        <Input
          label={`Condensate 1 Trucking Hours: Source to ${terminalLocation}`}
          field="cond1_hours_tt1"
          update={updateField}
          placeholder="1.0"
          value={form.cond1_hours_tt1}
        />

        <Input label="Condensate Truck Haul Rate (CAD/m³)" field="cond_trucking_rate_cad_m3" update={updateField} placeholder="195.00" value={form.cond_trucking_rate_cad_m3} />
        <Input label="Condensate Truck Haul Volume (m³)" field="cond_truck_volume_m3" update={updateField} placeholder="58.0" value={form.cond_truck_volume_m3} />
      </Section>

      {/* 6. Condensate Source 2 */}
      <Section title="6. Condensate Source 2">
        <Input label="Density (kg/m³)" field="cond2_density_kg_m3" update={updateField} placeholder="748.7" value={form.cond2_density_kg_m3} />
        <Input label="Sulphur (%)" field="cond2_sulphur_pct" update={updateField} placeholder="0.09" value={form.cond2_sulphur_pct} />
        <Input label="Truck Load Fee (CAD/m³)" field="cond2_load_fee_cad_m3" update={updateField} placeholder="8.50" value={form.cond2_load_fee_cad_m3} />
        <Input
          label={`Truck Rate to ${terminalLocation} (CAD/m³)`}
          field="cond2_transport_tt1_cad_m3"
          update={updateField}
          placeholder="30.00"
          value={form.cond2_transport_tt1_cad_m3}
        />

        <Input
          label={`Condensate 2 Trucking Hours: Source to ${terminalLocation}`}
          field="cond2_hours_tt1"
          update={updateField}
          placeholder="1.0"
          value={form.cond2_hours_tt1}
        />
      </Section>

      {/* 7. Butane */}
      <Section title="7. Butane (C4) Inputs">
        <Input label="Butane Injection Rate (%)" field="butane_injection_rate_pct" update={updateField} placeholder="3.20" value={form.butane_injection_rate_pct} />
        <Input label="Butane Truck Haul Rate (CAD/m³)" field="c4_trucking_rate_cad_m3" update={updateField} placeholder="195.00" value={form.c4_trucking_rate_cad_m3} />
        <Input label="Butane Truck Haul Volume (m³)" field="c4_truck_volume_m3" update={updateField} placeholder="50.0" value={form.c4_truck_volume_m3} />
        <Input
          label={`Butane Trucking Hours: Source to ${terminalLocation}`}
          field="c4_hours_tt1"
          update={updateField}
          placeholder="1.0"
          value={form.c4_hours_tt1}
        />
      </Section>

      {/* 8. Truck Terminal Fees */}
      <Section title="8. Truck Terminal Fees">
        <Input
          label={`Truck Terminal Fee: ${terminalLocation} (CAD/m³)`}
          field="tt1_fee_cad_m3"
          update={updateField}
          placeholder="6.00"
          value={form.tt1_fee_cad_m3}
        />
      </Section>

      {/* 9. Pipeline Operator Fees */}
      <Section title="9. Pipeline Operator Fees">
        <Input label="Power Surcharge (CAD/m³)" field="pipeline_power_surcharge_cad_m3" update={updateField} placeholder="0.10" value={form.pipeline_power_surcharge_cad_m3} />
        <Input
          label={`Pipeline Toll: ${terminalLocation} (CAD/m³)`}
          field="pipeline_toll_tt1_cad_m3"
          update={updateField}
          placeholder="18.50"
          value={form.pipeline_toll_tt1_cad_m3}
        />

        <Input label="Pipeline Loss Allowance (%)" field="pipeline_loss_allowance_pct" update={updateField} placeholder="0.20" value={form.pipeline_loss_allowance_pct} />
      </Section>

      {/* 10. Profit Sharing */}
      <Section title="10. Profit Sharing">
        <Input label="Diluent Benefit Sharing (%)" field="tt1_diluent_sharing_pct" update={updateField} placeholder="50" value={form.tt1_diluent_sharing_pct} />
      </Section>

      {/* 11. Premium Crude Values */}
      <Section title="11. Premium Crude Values">
        <Input label="Premium Crude Value (USD/bbl)" field="premium_crude_value_usd_bbl" update={updateField} placeholder="0.15" value={form.premium_crude_value_usd_bbl} />
        <Input label="Terminal Premium (USD/bbl)" field="hardisty_premium_crude_value_usd_bbl" update={updateField} placeholder="1.00" value={form.hardisty_premium_crude_value_usd_bbl} />
      </Section>

 {message && <div className="mb-4 text-red-600 font-medium">{message}</div>}

      {/* Save Inputs */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="bg-black text-white p-3 rounded mt-6 w-full"
      >
        {saving ? "Saving..." : "Save Inputs"}
      </button>

      {/* Run Model */}
      <button
        type="button"
        onClick={runModel}
        className="bg-blue-600 text-white p-3 rounded mt-3 w-full"
      >
        Run Diluent Optimization Model
      </button>

      {/* Back to Models */}
      <a
        href="/models"
        className="block text-center bg-gray-200 text-black p-3 rounded mt-3 w-full"
      >
        ← Back to Models
      </a>
    </div>
  );
}



// app/wti-futures/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

interface WtiPoint {
  month: string;
  price: number;
}

interface WcsPoint {
  month: string;
  price: number;
}

export default function WtiFuturesPage() {
  const [wti, setWti] = useState<WtiPoint[]>([]);
  const [wcs, setWcs] = useState<WcsPoint[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/wti-futures");
      const json = await res.json();
      setWti(json.wti);
      setWcs(json.wcs);
    }
    load();
  }, []);

  // ------------------------------------------------------------
  // BACKWARDATION / CONTANGO CALCULATIONS
  // ------------------------------------------------------------
  function calcSpread(data: WtiPoint[] | WcsPoint[], monthsAhead: number) {
    if (data.length < monthsAhead + 1) return null;

    const front = data[0].price;
    const future = data[monthsAhead].price;
    const diff = future - front;

    return {
      front,
      future,
      diff,
      type: diff > 0 ? "Contango" : diff < 0 ? "Backwardation" : "Flat",
    };
  }

  const wti6 = calcSpread(wti, 6);
  const wti12 = calcSpread(wti, 12);
  const wti18 = calcSpread(wti, 18);

  const wcs6 = calcSpread(wcs, 6);
  const wcs12 = calcSpread(wcs, 12);
  const wcs18 = calcSpread(wcs, 18);

  const chartData = {
    labels: wti.map((d) => d.month),
    datasets: [
      {
        label: "WTI Futures (USD/bbl)",
        data: wti.map((d) => d.price),
        borderColor: "rgba(0,0,0,0.9)",
        backgroundColor: "rgba(0,0,0,0.3)",
        tension: 0.2,
      },
      {
        label: "WCS Futures (USD/bbl)",
        data: wcs.map((d) => d.price),
        borderColor: "rgba(0,0,255,0.9)",
        backgroundColor: "rgba(0,0,255,0.3)",
        tension: 0.2,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="bg-white p-4 md:p-8 rounded shadow max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold mb-6 text-center">
          WTI & WCS Futures Curve (3-Year)
        </h1>

        {/* MOBILE-FRIENDLY CHART WRAPPER */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <Line data={chartData} />
          </div>
        </div>

        {/* SPREAD ANALYSIS */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Backwardation / Contango Analysis</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* WTI */}
            <div className="border rounded p-4">
              <h3 className="font-bold mb-2">WTI</h3>
              <ul className="text-sm space-y-2">
                <li>6-Month: {wti6 ? `${wti6.type} (${wti6.diff.toFixed(2)} USD/bbl)` : "N/A"}</li>
                <li>12-Month: {wti12 ? `${wti12.type} (${wti12.diff.toFixed(2)} USD/bbl)` : "N/A"}</li>
                <li>18-Month: {wti18 ? `${wti18.type} (${wti18.diff.toFixed(2)} USD/bbl)` : "N/A"}</li>
              </ul>
            </div>

            {/* WCS */}
            <div className="border rounded p-4">
              <h3 className="font-bold mb-2">WCS</h3>
              <ul className="text-sm space-y-2">
                <li>6-Month: {wcs6 ? `${wcs6.type} (${wcs6.diff.toFixed(2)} USD/bbl)` : "N/A"}</li>
                <li>12-Month: {wcs12 ? `${wcs12.type} (${wcs12.diff.toFixed(2)} USD/bbl)` : "N/A"}</li>
                <li>18-Month: {wcs18 ? `${wcs18.type} (${wcs18.diff.toFixed(2)} USD/bbl)` : "N/A"}</li>
              </ul>
            </div>

          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/models" className="text-blue-600 underline">
            ← Back to Models
          </a>
        </div>

      </div>
    </main>
  );
}


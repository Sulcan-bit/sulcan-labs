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

  const chartData = {
    labels: wti.map((d) => d.month),
    datasets: [
      {
        label: "WTI Futures (USD/bbl)",
        data: wti.map((d) => d.price),
        borderColor: "rgba(0,0,0,0.9)",      // BLACK LINE
        backgroundColor: "rgba(0,0,0,0.3)",
        tension: 0.2,
      },
      {
        label: "WCS Futures (USD/bbl)",
        data: wcs.map((d) => d.price),
        borderColor: "rgba(0,0,255,0.9)",    // BLUE LINE
        backgroundColor: "rgba(0,0,255,0.3)",
        tension: 0.2,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">WTI & WCS Futures Curve (3-Year)</h1>

        <Line data={chartData} />

        <div className="mt-6">
          <a href="/models" className="text-blue-600 underline">
            ← Back to Models
          </a>
        </div>
      </div>
    </main>
  );
}

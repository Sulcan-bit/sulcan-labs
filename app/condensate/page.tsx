// app/condensate/page.tsx

"use client";

import Link from "next/link";

export default function CondensateHomePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded shadow max-w-3xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          Condensate Comparison Model
        </h1>

        <div className="space-y-6">

          {/* New Condensate Model */}
          <Link
            href="/condensate/new"
            className="block px-5 py-3 bg-black text-white rounded text-center"
          >
            New Condensate Model Setup
          </Link>

          {/* History */}
          <Link
            href="/condensate/history"
            className="block px-5 py-3 bg-gray-800 text-white rounded text-center"
          >
            Condensate Comparison History
          </Link>

        </div>

      </div>
    </main>
  );
}

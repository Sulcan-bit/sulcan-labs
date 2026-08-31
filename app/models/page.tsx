// app/models/page.tsx

"use client";

import Link from "next/link";

export default function ModelsPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-md w-full">

        <h1 className="text-2xl font-bold mb-6">Select a Model</h1>

        <div className="flex flex-col gap-4">

          {/* Heavy Oil Model */}
          <Link
  href="/heavy-oil"
  className="block p-4 rounded bg-black text-white text-center"
>
  Heavy Oil Diluent Optimization
</Link>


          {/* WTI Futures Curve */}
          <Link
            href="/wti-futures"
            className="block p-4 rounded bg-gray-800 text-white text-center"
          >
            WTI Futures Curve (3-Year)
          </Link>

        </div>

      </div>
    </main>
  );
}


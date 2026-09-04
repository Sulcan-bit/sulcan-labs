// app/heavy-oil/page.tsx

import { requireAuth } from "@/lib/auth";
import Link from "next/link";

export default async function HeavyOilHome() {
  // ⭐ COOKIE-BASED AUTH (RESTORED)
  await requireAuth();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-xl shadow-lg max-w-md w-full">

        {/* Title */}
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Heavy Oil Modeling
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">

          <Link
            href="/heavy-oil/model-setup"
            className="w-full p-4 rounded-lg bg-black text-white text-center font-medium hover:bg-gray-900 transition"
          >
            New Heavy Oil Model Setup
          </Link>

          <Link
            href="/heavy-oil/comparison/select"
            className="w-full p-4 rounded-lg bg-gray-800 text-white text-center font-medium hover:bg-gray-700 transition"
          >
            Blended Heavy Oil Netback Comparison
          </Link>
        </div>

        {/* Navigation Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </main>
  );
}





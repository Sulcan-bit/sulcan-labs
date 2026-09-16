// app/condensate/page.tsx

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/auth";
import Link from "next/link";

export default async function CondensateHomePage() {
  const user = await getUserFromSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-xl shadow-lg max-w-md w-full">

        {/* Title */}
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Condensate Comparison Model
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">

          <Link
            href="/condensate/new"
            className="w-full p-4 rounded-lg bg-black text-white text-center font-medium hover:bg-gray-900 transition"
          >
            New Condensate Model Setup
          </Link>

          <Link
            href="/condensate/history"
            className="w-full p-4 rounded-lg bg-gray-800 text-white text-center font-medium hover:bg-gray-700 transition"
          >
            Condensate Comparison History
          </Link>

        </div>

        {/* Navigation Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <Link
            href="/models"
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </main>
  );
}

